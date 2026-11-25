/* The landing form's submissions, at /api/submit.

   The page posts { fields, context } here, in the shape of HubSpot's Forms Submission API. This function passes it
   on to the HubSpot form below (the page's IDs in landing/hubspot-config.js must match), with the visitor's IP so
   HubSpot sees where they really are. If HubSpot accepts it, the reply carries the playbook's access link,
   built from the PLAYBOOK_ACCESS_KEY environment variable (the same key the gate checks), so the page can open the
   playbook straight away. The key is never on the page: only a successful submission gets it.

   Without PLAYBOOK_ACCESS_KEY, HubSpot's own reply goes back unchanged (no redirect; the follow-up email still works).
   HubSpot's errors (a free email address, a missing field) go back unchanged too, for the page to show. */

const PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "52269566";
const FORM_ID = process.env.HUBSPOT_FORM_ID || "b27c8b3f-e3f3-492f-81bb-10bc44404d4a";
const HUBSPOT = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { message: "Use POST." });

  let body;
  try { body = await req.json(); } catch { return json(400, { message: "The submission wasn't valid JSON." }); }
  if (!body || !Array.isArray(body.fields)) return json(400, { message: "The submission has no fields." });

  const ctx = { ...(body.context || {}) };
  if (context && context.ip) ctx.ipAddress = context.ip;

  let res, reply;
  try {
    res = await fetch(HUBSPOT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: body.fields, context: ctx }),
    });
    reply = await res.json().catch(() => ({}));
  } catch {
    return json(502, { message: "Couldn't reach HubSpot." });
  }
  if (!res.ok) return json(res.status, reply);

  const key = process.env.PLAYBOOK_ACCESS_KEY;
  if (!key) return json(200, reply);
  const origin = new URL(req.url).origin;
  return json(200, { ...reply, redirectUri: `${origin}/intro/?access=${encodeURIComponent(key)}` });
};

export const config = { path: "/api/submit" };

/* The playbook's gate. The playbook's pages (and the working files that hold its copy) only open for a visitor
   with the access cookie; anyone else is sent to the landing page at "/".

   The cookie comes from the access link HubSpot hands out after the form, as the form's redirect and in its
   follow-up email: https://playbook.wearemagnifico.com/intro/?access=<key>. A visit with the right key sets the
   cookie for a year and reloads the same page without the key in the address. The key is the Netlify environment
   variable PLAYBOOK_ACCESS_KEY; until it is set, every gated page goes to the landing page. Changing the key
   closes the playbook to everyone who has the old link or cookie. */
import type { Config, Context } from "@netlify/edge-functions";

const COOKIE = "playbook_access";
const YEAR = 60 * 60 * 24 * 365;

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const key = Netlify.env.get("PLAYBOOK_ACCESS_KEY");
  const toLanding = () => new Response(null, { status: 302, headers: { Location: "/", "Cache-Control": "no-store" } });
  if (!key) return toLanding();

  const given = url.searchParams.get("access");
  if (given !== null) {
    if (given !== key) return toLanding();
    url.searchParams.delete("access");
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.pathname + url.search,
        "Set-Cookie": `${COOKIE}=${encodeURIComponent(key)}; Max-Age=${YEAR}; Path=/; Secure; HttpOnly; SameSite=Lax`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (context.cookies.get(COOKIE) === key) return; // let the page through
  return toLanding();
};

const gated = [
  "intro", "step-1-listen", "step-2-decide", "step-3-source", "step-4-align", "step-5-decisions", "step-6-test", "where-to-start",
  "tools", "hero-explorations", "design-system", "animations",
];

export const config: Config = {
  path: [
    ...gated.flatMap((dir) => [`/${dir}`, `/${dir}/*`]),
    "/playbook-listen.html", "/README.md", "/PROCESS.md",
  ],
};

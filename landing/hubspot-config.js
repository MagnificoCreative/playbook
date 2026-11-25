/* HubSpot form settings for the landing page (landing/index.html).
   The IDs of the playbook lead-magnet form in HubSpot (HubSpot › Marketing › Forms › the form › Share › Get embed code).
   The page keeps its own form and posts each submission to this HubSpot form, so the form in HubSpot must have
   exactly these fields: firstname, email and company. Clear portalId or formId to go back to the preview form, which sends nothing. */
window.LP_HUBSPOT = {
  portalId: "52269566",
  formId: "b27c8b3f-e3f3-492f-81bb-10bc44404d4a",
  region: "na1",       // as in the embed code; kept for reference
  submitText: "Send me the playbook",
};

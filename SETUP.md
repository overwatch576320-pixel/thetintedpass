# The Tinted Pass — website starter

A responsive React + Vite website with separate pages, a procedural 3D topographic-style Ladakh map, itinerary switching, clickable landmark details, WhatsApp/email contact links, and an admin starter.

## 1. Run it locally

Install Node.js (LTS), then in this folder run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## 2. Add your hero video

Put your video in `public/media/ladakh-hero.mp4`. The homepage already looks for that exact filename. Add a still image at `public/media/hero-poster.jpg` as the loading poster.

Use footage you own or have permission to use. Keep the video compressed and provide a poster image for mobile/slow connections.

## 3. Set contact details

Copy `.env.example` to `.env` and change:

- `VITE_WHATSAPP_NUMBER` to your WhatsApp number, including country code and digits only.
- `VITE_CONTACT_EMAIL` to your public enquiry email.

Restart the dev server after changing environment variables.

## 4. Connect Supabase (recommended before launch)

The current admin page has a local preview mode. In that mode, content edits and analytics are saved only in the current browser. It is not a shared CMS and is not secure for a live website.

To enable shared admin login and database-backed analytics:

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Authentication, create your administrator user.
4. Copy your Project URL and anon/public key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Restart the app and sign in at `/admin`.

For production, tighten the SQL policies so only a designated admin role can edit `site_content` and read analytics. Never put the Supabase service-role key in frontend code.

Country analytics are deliberately not inferred from the visitor's IP in this starter. Use a privacy-respecting analytics service or a server-side country lookup with appropriate notice/consent if country-level reporting is important.

## 5. Update the journeys and landmarks

Edit `src/data/siteData.js`.

- `journeys` contains the itinerary names, route stops and day-by-day descriptions.
- `landmarks` contains the image, description, traveller context and day plan for each location.
- The map is a stylised illustration. The marker coordinates in `src/components/TerrainMap.jsx` are approximate layout coordinates, not real GPS coordinates.

Historical artist/traveller portraits and attributions are intentionally represented as placeholders/research notes. Verify the exact connection between a person and a place, use appropriately licensed images, and add citations/credits before publishing.

## 6. Deploy with GitHub Pages

The repository includes a GitHub Actions workflow. Each push to `main` installs dependencies, builds the site and deploys the `dist/` folder to GitHub Pages. In the repository's **Settings → Pages**, set the deployment source to **GitHub Actions** if it is not already selected. The `CNAME` file keeps the existing `thetintedpass.in` custom domain attached.

Optional contact values can be set as repository Actions variables named `VITE_WHATSAPP_NUMBER` and `VITE_CONTACT_EMAIL`. Supabase can be configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Those are public browser values; never add a Supabase service-role key to this site.

Before accepting bookings, confirm routes, permits, road access, altitude and safety with a qualified local operator; confirm accommodation, transport, group size, inclusions and prices; and add the privacy, terms and cancellation information your business needs.

## Project structure

```text
src/
  components/   shared navigation, intro and 3D terrain map
  data/         itinerary and landmark content
  pages/        Home, About, Journeys, Art Practice, Journal, Pricing, Contact, Admin
  analytics.js  page-view tracking
  lib.js        Supabase and contact helpers
supabase/
  schema.sql    starter database schema
public/figma/   locally stored artwork used on the homepage
```

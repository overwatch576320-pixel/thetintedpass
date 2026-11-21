# The Tinted Pass — Project Context

## Project at a glance

- **Website:** [thetintedpass.in](https://thetintedpass.in/)
- **GitHub repository:** [overwatch576320-pixel/thetintedpass](https://github.com/overwatch576320-pixel/thetintedpass)
- **Live branch:** `main`
- **Figma file:** [The Tinted Pass Website Redesign](https://www.figma.com/design/p9Mh5dr5vchVehvaqo3FJ5/The-Tinted-Pass-Website-Redesign)
- **Figma homepage frame:** node `13:2`
- **Figma runnable Code layer:** node `36:10`
- **Latest website update:** commit `921abe475adcbf478417444ce467465cf753893c` (homepage tablet spacing)
- **Deployment:** GitHub Pages via GitHub Actions; the custom domain `thetintedpass.in` is preserved in `CNAME`.

## How Figma and the website relate

Figma is the visual reference. The React code in this project is what runs on the live website. Editing the Figma frame does **not** automatically change the React code, and changing React code does **not** automatically update Figma. Carry visual changes across manually: compare the current Figma homepage with `src/pages/Home.jsx` and `src/styles.css`, and save any used artwork under `public/figma/` rather than relying on expiring Figma asset links.

The editable homepage frame is node `13:2`. The Code layer at node `36:10` is a runnable preview of the imported React project. Use the design file for visual editing; use this project folder for code changes and deployment.

## Website structure

This is a React 18 + Vite 6 website using React Router, Lucide icons, Three.js for the interactive journey terrain map, and optional Supabase support. Main files:

- `src/pages/Home.jsx` — homepage sections and copy
- `src/styles.css` — shared site styles plus the responsive homepage styling
- `src/components/SiteLayout.jsx` — header, navigation, and footer
- `src/pages/` — About, Journeys, Art Practice, Journal, Pricing, Contact, Admin, and Not Found pages
- `src/data/siteData.js` — journey stops, itinerary content, and landmark details
- `src/components/TerrainMap.jsx` — interactive terrain map on the Journeys page
- `public/figma/` — local Figma artwork used by the homepage
- `supabase/schema.sql` — starter schema for the optional Supabase-backed admin page

## Routes

`/` Home · `/about` The idea · `/journeys` itineraries and field map · `/art-practice` creative practice · `/journal` field notes · `/pricing` journey details and pricing · `/contact` contact options · `/admin` admin starter.

## Design and deployment pipeline

1. Make or review the visual change in the Figma file.
2. Implement it in the appropriate React page/component and responsive styles. Download or export new design assets into the project and reference them locally.
3. Install the locked dependencies with `npm ci`; run `npm run dev` for a local preview.
4. Run `npm run build` to build the production site into `dist/`.
5. A push to `main` starts `.github/workflows/deploy.yml`: it installs packages, builds the website, copies the built homepage to `404.html` for direct React routes, uploads the Pages artifact, and deploys it.
6. GitHub Pages **Source must stay set to GitHub Actions** in repository Settings → Pages. The site was blank when Pages served the raw Vite/JSX source from the branch. It was fixed by switching the source to GitHub Actions and rerunning the successful deployment.

Pushing to `main` publishes to the public website. Review changes before pushing. Figma edits alone do not trigger deployment.

## Configuration and safeguards

- `.env.example` lists optional settings. There is no `.env` file in this handoff folder.
- `VITE_WHATSAPP_NUMBER` and `VITE_CONTACT_EMAIL` can customize public contact links. Current defaults in code are sample defaults and should be confirmed before launch.
- Supabase is optional. Without its URL and public anon key, the Admin page is only a local preview. Never put a Supabase service-role key in browser code or commit secrets.
- `CNAME` and `public/CNAME` preserve the existing custom domain.
- The GitHub Actions deployment must remain configured to build the Vite project. Do not point Pages back at raw `index.html`/`.jsx` source.

## Getting started

Install Node.js, then from this folder run:

```sh
npm ci
npm run dev
```

For deployment notes and Supabase setup, read [SETUP.md](./SETUP.md). For a concise project README, see [README.md](./README.md).

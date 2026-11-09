# The Tinted Pass

The responsive website for The Tinted Pass, a collection of art-led journeys through Ladakh. Built with React and Vite. GitHub Actions builds and deploys the site to GitHub Pages when changes reach `main`.

## Work on the site

```sh
npm ci
npm run dev
```

The development server prints a local preview address. Run `npm run build` to create the deployable site in `dist/`.

## Pages

- `/` — Homepage
- `/about` — The idea
- `/journeys` — Itineraries and interactive field map
- `/art-practice` — The creative practice
- `/journal` — Field notes
- `/pricing` — Journey details and pricing
- `/contact` — Contact options
- `/admin` — Admin starter

## Contact and optional services

Set `VITE_WHATSAPP_NUMBER` and `VITE_CONTACT_EMAIL` in a local `.env` file to update the contact details. The Supabase variables are optional; without them, the admin page runs in local preview mode. See [SETUP.md](./SETUP.md) before enabling shared admin data.

The Figma homepage artwork is stored in `public/figma/` and is served with the website, so it does not depend on temporary Figma URLs.

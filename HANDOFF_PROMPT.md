# Prompt for another AI

Copy and paste this prompt into the AI you want to continue with, then give it this project folder (or the ZIP) so it can inspect the source.

---

You are continuing work on my existing website, **The Tinted Pass**. First read `PROJECT_CONTEXT.md`, `README.md`, and `SETUP.md`, then inspect the relevant source files before making changes.

## Project links

- Live website: https://thetintedpass.in/
- GitHub repository: https://github.com/overwatch576320-pixel/thetintedpass
- Figma design file: https://www.figma.com/design/p9Mh5dr5vchVehvaqo3FJ5/The-Tinted-Pass-Website-Redesign
- Homepage design frame: node `13:2`
- Figma runnable Code layer: node `36:10`

## What the website is

The Tinted Pass offers small-group, art-led journeys through Ladakh. The visual direction is editorial and landscape-led: pale blue mountain imagery, sketchbook details, warm paper colors, muted greens, rust accents, serif headlines, and handwritten accents. The homepage design is in Figma; the React project in this folder powers the real site.

## Technical setup

This is a React 18 / Vite 6 project with React Router, Lucide icons, Three.js for the Journeys terrain map, and optional Supabase. Start with `npm ci` and `npm run dev`; build with `npm run build`. Use the existing components, routes, content data, CSS tokens/patterns, and local assets. Keep the site responsive and preserve existing navigation and working interactions unless a requested change requires otherwise.

## Figma-to-site workflow

Figma and the code do not sync automatically. Treat Figma as the visual reference and this folder as the running website source. For each requested visual change, compare the target Figma frame with the corresponding React page and CSS, make the change in React/CSS, and use local images/SVGs from `public/figma/` or add properly exported local assets there. Do not leave temporary Figma asset URLs in the website.

## GitHub and publishing workflow

The live repo is `overwatch576320-pixel/thetintedpass`, branch `main`, with custom domain `thetintedpass.in`. GitHub Pages is configured with **Source: GitHub Actions**. The workflow at `.github/workflows/deploy.yml` runs on pushes to `main`, builds the site, prepares `dist/404.html` for direct route links, uploads the Pages artifact, and deploys it. A push to `main` changes the public website. Do not switch Pages back to serving the raw branch source; that caused a blank page because browsers cannot run the JSX source directly.

Before editing, understand the user’s requested change and the scope. After editing, run `npm run build` and summarize the files changed. Do not push or deploy unless I explicitly ask; explain that a push to `main` publishes the public site. Never commit `.env`, API secrets, or Supabase service-role keys. The current contact defaults and some journey/admin details may be sample content, so do not invent real business details.

## Current project state

The current home page mirrors the Figma homepage, including its mountain/easel hero, manifesto sketch artwork, journey cards, field-notes book, and closing contact section. Other site routes are included. The latest homepage spacing adjustment is in GitHub commit `921abe475adcbf478417444ce467465cf753893c`.

Start by checking the supplied project files and current request. Then continue with the specific change I ask for.

---

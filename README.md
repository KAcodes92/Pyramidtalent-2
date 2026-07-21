# Celsior Website

Static website repo for the Celsior redesign.

## Deployment

The site is deployed from the GitHub `main` branch to Vercel.

Current dev URL:

- https://dev.celsiortech.us/

Do not rely on Vercel CLI login for normal updates. Push to GitHub `main` and let Vercel deploy.

## Local Preview

From the repo root, run:

    python3 -m http.server 8080

Then open:

    http://localhost:8080/

Stop the server with Ctrl + C.

## Key Files

- `index.html` – homepage
- `shared.js` – shared navbar, mobile drawer, mega menu, footer, HubSpot modal system, and site-wide scripts
- `vercel.json` – Vercel clean URL configuration
- `add-shared-header-footer.js` – utility script used for shared header/footer injection workflows

## URL Structure

Preferred structure is clean folder URLs:

    page-name/index.html -> /page-name
    category/page-name/index.html -> /category/page-name

Examples:

- `/our-focus/ai-adoption`
- `/capabilities/ai-and-data`
- `/solutions/managed-programs`
- `/partners`

Avoid creating new flat standalone HTML pages unless needed for compatibility.

## Navbar Behavior

Desktop top-level navbar labels are dropdown triggers only. They should not navigate to standalone parent pages.

Dropdown child links should remain clickable.

Navbar and footer behavior is managed in:

- `shared.js`

## Safe Update Workflow

Before editing:

    git pull origin main
    git status

Preview locally:

    python3 -m http.server 8080

Before committing:

    git status --short
    git --no-pager diff --stat
    git diff --check

Commit and push only after local preview is checked.

## Cleanup Notes

Repo cleanup is being done in phases.

Current safe cleanup docs are in:

- `docs/`
- `audits/`

Do not delete or rename legacy files until the link/routing audit is complete.

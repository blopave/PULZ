# PULZ v4.0 — Find Your Race

All running and trail races in South America in one place. 110+ races across 6 countries.

## Quick Start

1. Open this folder in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Done

## Project Structure

```
pulz/
├── index.html              ← Main page
├── README.md
├── css/
│   └── style.css           ← All styles (variables, splash, grid, roles, responsive)
├── js/
│   ├── i18n.js             ← Translations (ES/EN/PT) + language switcher
│   ├── data.js             ← Supabase data layer + fallback + CRUD + favorites
│   ├── app.js              ← App logic: parallax, filters, rendering, search
│   └── auth.js             ← Auth: roles (runner/organizer/admin), profiles, UI
└── docs/
    ├── 01_schema.sql       ← Supabase database schema (already executed)
    ├── 02_migration.sql    ← Data migration (already executed)
    ├── PULZ_Plan_Maestro.md
    └── PULZ_Analisis_Profesional.md
```

## Tech Stack

- Vanilla HTML / CSS / JS (no frameworks)
- Supabase (auth + database + storage)
- Google Fonts: Bebas Neue, Inter, JetBrains Mono
- CSS custom properties for theming

## Version History

- v4.0 — Supabase integration, role system, source badges
- v3.0 — Premium redesign, parallax, particles
- v2.0 — Splash hero, inline expansion
- v1.0 — Initial release

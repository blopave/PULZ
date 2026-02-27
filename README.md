# PULZ — Find Your Race

**Version:** 3.0  
**Date:** February 2026

All running and trail races in South America in one place. 110+ races across 6 countries.

## How to run

### Option 1 — Open directly
Open `index.html` in the browser.

### Option 2 — Local server (recommended)
```bash
python3 -m http.server 8000
# or: npx serve .
# or: VS Code Live Server extension
```

## Project structure

```
pulz/
├── index.html          ← Semantic HTML, external CSS/JS
├── README.md
├── css/
│   └── style.css       ← All styles (variables, splash, grid, responsive)
├── js/
│   ├── i18n.js         ← Translations (ES/EN/PT) and language switcher
│   ├── data.js         ← Race data for all 6 countries
│   └── app.js          ← App logic: parallax, filters, rendering
└── docs/
    └── CHANGELOG.md
```

## Tech stack

- Vanilla HTML / CSS / JS (no frameworks)
- Google Fonts: Bebas Neue, Instrument Sans, JetBrains Mono
- CSS custom properties for theming
- requestAnimationFrame-based parallax scroll

## Features

- Splash screen with parallax shrink-to-header effect
- Floating particle system
- Mouse-tracking glow on race cards
- Inline country content expansion (no page changes)
- Filters: month, type (road/trail), distance
- Trilingual: Spanish, English, Portuguese
- Fully responsive

## Countries

- 🇦🇷 Argentina (26 races)
- 🇨🇱 Chile (20 races)
- 🇧🇷 Brasil (18 races)
- 🇺🇾 Uruguay (7 races)
- 🇨🇴 Colombia (23 races)
- 🇵🇪 Peru (9 races)

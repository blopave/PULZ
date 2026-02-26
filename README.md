# ⚡ PULZ — Find Your Race

**All running and trail races in South America, in one place.**

PULZ is a race finder platform covering 6 countries across South America with 110+ races for the 2026 season. Built with a dark editorial aesthetic inspired by brands like Satisfy Running, Nike Run Club, and award-winning web agencies.

![PULZ Screenshot](docs/screenshot.png)

## Features

- 🌐 **Multilingual** — Spanish, English, Portuguese (full i18n)
- 🔍 **Smart Filters** — By month, terrain type (road/trail), and distance (≤10K, 21K, 42K, Ultra)
- ⭐ **Iconic Races** — Major events highlighted with gold badges
- 📱 **Responsive** — Mobile-first design, works on any device
- 🎨 **Premium Design** — Dark theme, Bebas Neue + JetBrains Mono typography, Electric Lime accent
- ⚡ **Zero Dependencies** — Pure HTML, CSS, JS. No frameworks. No build step.

## Countries Covered

| Country | Flag | Races |
|---------|------|-------|
| Argentina | 🇦🇷 | 26 |
| Chile | 🇨🇱 | 20 |
| Brasil | 🇧🇷 | 18 |
| Colombia | 🇨🇴 | 23 |
| Peru | 🇵🇪 | 9 |
| Uruguay | 🇺🇾 | 7 |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/pulz.git
cd pulz

# Open in browser (no build needed)
open index.html

# Or use Live Server in VS Code
```

## Project Structure

```
pulz/
├── index.html          # Main entry point
├── css/
│   └── style.css       # All styles (CSS variables, responsive)
├── js/
│   ├── i18n.js         # Translations (ES/EN/PT) + language switcher
│   ├── data.js         # Race data for all 6 countries
│   └── app.js          # Application logic (filters, rendering, nav)
├── docs/
│   └── screenshot.png  # Project screenshot
├── README.md           # This file
└── LICENSE             # MIT License
```

## Updating Race Data

Race data lives in `js/data.js`. Each race is a simple object:

```javascript
{
    n: "Maratón de Buenos Aires",  // Name
    d: "2026-09-20",               // Date (YYYY-MM-DD)
    l: "Buenos Aires, CABA",       // Location
    c: ["42K"],                    // Distance categories
    t: "asfalto",                  // Type: "asfalto" or "trail"
    w: "https://...",              // Website URL (empty string if none)
    i: 1                           // Iconic: 1 = yes, 0 = no
}
```

### Recommended Sources

| Country | Source | URL |
|---------|--------|-----|
| Argentina | Corro.com.ar | corro.com.ar |
| Argentina | Sports Facilities | sportsfacilities.com.ar |
| Chile | Tusdesafios | tusdesafios.com |
| Chile | Corre.cl | corre.cl |
| Brasil | Brasil Que Corre | brasilquecorre.com |
| All | Ahotu | ahotu.com |
| All | Finishers | finishers.com |

## Design System

| Element | Value |
|---------|-------|
| Background | `#0C0C0E` |
| Primary (Pulse) | `#E8FF00` (Electric Lime) |
| Text | `#F0EDE8` |
| Display Font | Bebas Neue |
| Body Font | Instrument Sans |
| Mono Font | JetBrains Mono |
| Trail Color | `#00E676` |
| Ultra Color | `#AA66FF` |
| Half Color | `#FF9100` |
| Full Color | `#FF3D00` |

## Brand

**PULZ** — 4 letters, one syllable, pure impact. The name reimagines "pulse" — the most basic element of running. The Z ending makes it rebellious, modern, cutting.

## License

MIT License — see [LICENSE](LICENSE)

---

Made with ⚡ by PULZ

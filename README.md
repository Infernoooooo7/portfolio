# Pavan MP — portfolio

Static site: plain HTML, CSS and JS. No build step.

```
npm start        # serves http://localhost:4173 (dependency-free Node server)
```

Or open `index.html` through any static host (Vercel, Netlify, GitHub Pages).

## Structure

- `index.html`, `styles.css`, `script.js` — the site.
- `assets/Pavan_MP_Resume.pdf` — the résumé offered for download.
- `assets/fonts/` — self-hosted Chakra Petch, Instrument Sans and JetBrains Mono (latin subsets, SIL OFL).
- `assets/icons.svg` — SVG sprite built from Tabler Icons.
- `vendor/` — third-party code, vendored so the site works offline and without a CDN.
- `server.mjs` — local preview server. It only serves `index.html`, `styles.css`, `script.js`, `assets/` and `vendor/`.

## Open-source pieces used (all MIT)

| Project | Used for | Location |
|---|---|---|
| [tsParticles](https://github.com/tsparticles/tsparticles) `@tsparticles/slim` 4.5.0 | animated particle-network background (loaded lazily; skipped with reduced motion / data saver) | `vendor/tsparticles/` |
| [vanilla-tilt.js](https://github.com/micku7zu/vanilla-tilt.js) 1.8.1 | 3D tilt + glare on project cards (desktop pointers only) | `vendor/vanilla-tilt/` |
| [cyberpunk-ui](https://github.com/laddtnov/cyberpunk-ui) 0.9.0 | design tokens, animated grid, scanline veil, blinking cursor, glitch keyframes (adapted) | `vendor/cyberpunk-ui/` |
| [Tabler Icons](https://github.com/tabler/tabler-icons) 3.50.0 | the icon sprite in `assets/icons.svg` (15 icons) | `vendor/tabler-icons/` (license) |

Each folder keeps its original LICENSE file. The kit's neon colors are deliberately toned down in `styles.css`.

## Editing content

All copy lives in `index.html`. Project facts come from the résumé PDF, the public GitHub/LinkedIn profiles and the XODUS repository README.

## Interaction notes

- **Project cards** open a write-up dialog (click, Enter, or the arrow keys to move between projects). Without JavaScript the write-ups simply show inline.
- **Quick jump**: `Ctrl/⌘ + K` opens a command palette (sections, projects, links, copy email, résumé).
- **Reduced motion**: no particles, no animation, no tilt; everything stays readable.
- Each project's pipeline diagram is a plain restatement of the data flow already described in its bullets (résumé / README), not extra claims.

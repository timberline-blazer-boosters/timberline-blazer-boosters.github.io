---
name: verify-site
description: Browser-check Boosters GitHub Pages UI after layout, gallery, nav, or donate changes. Use when verifying the live or local site, checking regressions, or after editing HTML, SCSS, or gallery JS.
---

# Verify the site

Use the browser tools. A single screenshot is not enough.

## Always

1. Exercise the changed flow as a visitor (click, navigate, wait for photos or PDFs).
2. Check **desktop and a narrow mobile** width if layout/nav/SCSS changed.
3. Confirm state matches on every page that shares the data you touched.

## Paths

| Change | Check |
|---|---|
| Gallery YAML/JS | `/gallery/`, a group, an album slideshow (photos load, prev/next) |
| Nav / `_config.yml` | Header links; `/compose/` and `/update/` stay **out** of nav |
| Donate include | `/gallery/`, `/gallery/group/`, `/gallery/album/` |
| Home / posts | `/`, a post, image loads |
| Documents | `/documents/` link opens the PDF |
| Menus | `/menu-school/`, `/menu-stadium/` |

## Hunt regressions

- Minima header/footer still wrap the page.
- `relative_url` assets are not 404.
- PhotoPrism slideshow still uses `X-Session-ID` (no console CORS/401 from Bearer).
- Footer visitor count still reads `/assets/data/visitor-count.json`.

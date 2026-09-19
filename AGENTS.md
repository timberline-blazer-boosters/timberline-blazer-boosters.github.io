# Timberline Blazers Booster Club site

Public Jekyll site on GitHub Pages. **Not** a Business Central / AL repo — ignore parent `AL Projects` AL rules.

- Live: https://timberlineblazerboosters.org
- Repo: `timberline-blazer-boosters/timberline-blazer-boosters.github.io`
- Stack: `github-pages` gem, Minima, native Pages build

## Rules (`.cursor/rules/`)

| Rule | When |
|---|---|
| `jekyll-github-pages.mdc` | Always — stack, domain, content model |
| `public-site-secrets.mdc` | Always — no tokens/PATs/passwords in the repo |
| `jekyll-instagram-posts.mdc` | `_posts` |
| `photoprism-gallery.mdc` | Gallery YAML and JS |
| `github-actions-pages.mdc` | `.github/workflows` |
| `jekyll-pages-and-assets.mdc` | Pages, includes, assets |
| `site-seo.mdc` | `_config.yml` and pages — logo, OG image, descriptions |
| `officer-forms.mdc` | `/compose/`, `/update/`, `/contact/` — Make vs FormSubmit |

## Skills (`.cursor/skills/`)

| Skill | When |
|---|---|
| `add-gallery-album` | New PhotoPrism album or group |
| `add-news-post` | News post + Instagram JPEG |
| `add-document` | PDF on `/documents/` |
| `publish-pages` | Commit / pull / push to `main` |
| `verify-site` | Browser-check after UI changes |

Prefer whitelist plugins (`jekyll-sitemap`, `jekyll-redirect-from`) over a custom Pages build.

Never run `Pull-CursorRules.ps1` here — that would copy Business Central AL rules into this Jekyll site.

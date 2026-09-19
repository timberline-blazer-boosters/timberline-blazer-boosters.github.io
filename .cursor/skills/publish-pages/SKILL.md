---
name: publish-pages
description: Commit and push this GitHub Pages site safely, pulling GoatCounter visitor-count commits first. Use when the user asks to commit, push, publish, or go live on timberlineblazerboosters.org.
---

# Publish to GitHub Pages

Live site: **https://timberlineblazerboosters.org** (repo `timberline-blazer-boosters/timberline-blazer-boosters.github.io`, branch `main`).

## Steps

1. `git status` and `git diff`. Do not commit secrets, `.env`, PhotoPrism libraries, or `_site/`.
2. `git pull` (or pull with rebase) **before** push. `.github/workflows/update-visitor-count.yml` commits `assets/data/visitor-count.json` to `main` on a schedule. Local `main` is often behind.
3. Stage only the intended files. Commit with a short message that says **why**.
4. `git push` to `origin/main`. **Never force-push `main`.**
5. Wait for the GitHub Pages build. Custom domain can lag a minute behind `github.io`.
6. Hard-refresh the changed URLs (gallery JS is cache-busted with `?v=`).

## After gallery or post changes

- Gallery: group on `/gallery/`, albums on `/gallery/group/?id=…`, photos on `/gallery/album/?id=…`
- Post: home list + JPEG in `/feed.xml`
- Document: link on `/documents/`

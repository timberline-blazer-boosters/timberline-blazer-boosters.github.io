---
name: add-gallery-album
description: Add or hide a PhotoPrism album on the Boosters gallery. Use when adding a football, volleyball, soccer, band, or other album, a new gallery group, a share token, or when the user mentions galleries.yml or photos.tlblazers.com.
---

# Add a gallery album

Photos stay on PhotoPrism (`https://photos.tlblazers.com`). This repo only records the **share token** and YAML.

## Steps

1. Get a **unique** album share token from PhotoPrism (no share password). Do not reuse another album’s token.
2. Edit `_data/galleries.yml` only. Do not add `gallery/*.html` pages.
3. Put the album under the matching **group**. If the sport/season does not exist, add a group with `slug` + `title`, then albums.
4. Use a stable `slug` (lowercase, hyphens) and a public `title`.

```yaml
      - slug: football-4
        title: Varsity vs Opponent
        token: uniquetoken
```

5. Hide without deleting: `published: false` on the album or group.
6. Do **not** bump `?v=` on gallery scripts for YAML-only changes. Bump `?v=` on **every** gallery script tag together only if `assets/js/gallery-*.js` changed.
7. After UI/YAML that should appear live, follow **publish-pages**. Then confirm `/gallery/` shows the group, `/gallery/group/?id=SLUG` lists the album, and `/gallery/album/?id=SLUG` loads photos.

## Do not

- Add a `categories:` heading; groups are the button row on `/gallery/`.
- Switch slideshow auth to `Authorization: Bearer`.
- Commit PhotoPrism originals into `assets/`.

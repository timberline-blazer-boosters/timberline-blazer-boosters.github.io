---
name: add-news-post
description: Create an Instagram-ready Jekyll news post in _posts with JPEG, tags, and image front matter. Use when adding a news post, blog post, Instagram RSS item, or converting a photo for /feed.xml.
---

# Add a news post

`_posts` entries go to `/feed.xml` and then Make.com for Instagram. Follow `.cursor/rules/jekyll-instagram-posts.mdc`.

## Steps

1. Convert the photo to **JPEG** (quality ~90). Target **1080×1350** (4:5) or **1080×1080**. Ratio must be 0.8–1.91. Crop center if the source is taller than 4:5. Do not letterbox.
2. Save as `assets/images/posts/YYYY-MM-DD-short-slug.jpg`.
3. Add `_posts/YYYY-MM-DD-short-slug.md`:

```yaml
---
layout: post
title: "Short readable title"
date: YYYY-MM-DD HH:MM:SS -0700
categories: news
tags:
  - news
  - topic-word
image: /assets/images/posts/YYYY-MM-DD-short-slug.jpg
---
```

4. In the body, show **that same JPEG** via `relative_url`. Write a short post; first lines should make sense as an Instagram caption.
5. Do not point `image:` at a PNG, WebP, PhotoPrism URL, or a different file than the body photo.
6. Publish with **publish-pages**. Confirm the post on the home list and that `image` in `/feed.xml` is the JPEG URL.

Officers can also use `/compose/` (not in nav). Do not put Graph tokens or the compose password in the post or HTML.

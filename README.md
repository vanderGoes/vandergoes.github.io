# mauritsvandergoes.nl

Personal site of Maurits van der Goes. Static site built with [Eleventy](https://www.11ty.dev/), hosted on GitHub Pages. Content migrated from the old Tumblr blog.

## Local development

```sh
npm install
npm start          # http://localhost:8080 with live reload
npm run build      # writes _site/
```

## Writing a post

Add a file to `src/posts/` named `YYYY-MM-DD-slug.md` (or `.html`):

```yaml
---
title: "Post title"
subtitle: "Optional subtitle"
date: 2026-11-22T10:00:00Z
topics: ["machine learning", "mlops"]
cover: /assets/img/posts/my-cover.jpg   # optional
external: https://medium.com/...        # optional, adds a "Continue reading" link
lang: nl                                # optional, for Dutch posts
---
```

Images go in `src/assets/img/posts/`. Text before `<!-- more -->` is used as the page description.

## Structure

- `src/posts/` – all posts; permalink is `/YYYY/slug/`
- `src/_includes/layouts/` – `default`, `post`, `page`
- `src/assets/css/site.css` – the whole design, no external fonts or scripts
- `src/redirects.liquid` – keeps old Tumblr URLs (`/post/<id>/...`, `/tagged/...`) working via `redirect_from` in each post
- `scripts/tumblr-images.tsv` + `scripts/import-tumblr-images.sh` – one-off image import from Tumblr's CDN

## Deployment

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.
Repository settings → Pages → Source must be set to **GitHub Actions**.

## Moving the domain from Tumblr

1. Run the **Import Tumblr images** workflow once (Actions tab) so all images live in this repo.
2. Settings → Pages → Custom domain: `mauritsvandergoes.nl`, then enable *Enforce HTTPS* once the certificate is issued.
3. At the DNS provider, replace the Tumblr records with GitHub Pages:
   - `A` records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `AAAA` records for `@`: 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
   - `CNAME` for `www`: `vandergoes.github.io`
4. Remove the custom domain from the Tumblr blog settings.

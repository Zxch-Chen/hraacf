# HRAACF website

Static site for [Harvard-Radcliffe Asian American Christian Fellowship](http://hraacf.org/).

Push to `main` and Vercel publishes the change. No FileZilla.

## Edit the site

1. Clone this repo (or open it on GitHub).
2. Change text in `index.html`. Photos live in `assets/img/`. Styles are in `css/styles.css`.
3. Commit and push to `main`.

On GitHub you can also click **Edit** on `index.html`, change the text, and commit — Vercel deploys that too.

## Local preview

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Domain

`hraacf.org` still points at DreamHost until DNS is switched to Vercel. The Vercel URL is the preview/production host until then.

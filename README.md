# HRAACF website

Static site for Harvard-Radcliffe Asian American Christian Fellowship.

- **Live (Vercel):** https://hraacf.vercel.app
- **GitHub:** https://github.com/Zxch-Chen/hraacf
- **hraacf.org** still points at DreamHost until DNS is switched. Do not use FileZilla for this copy.

Push to `main` and Vercel publishes in about a minute.

## Edit text (easiest)

1. Open [index.html on GitHub](https://github.com/Zxch-Chen/hraacf/blob/main/index.html).
2. Click the pencil (Edit).
3. Change the wording. Search the page for the sentence you want to update.
4. Commit to `main`.

That is the whole publish step. No FTP.

## Add a testimony (repo owner)

Published testimonies are the list in [`js/testimonies.json`](https://github.com/Zxch-Chen/hraacf/blob/main/js/testimonies.json). The site then loads the matching item from that Substack’s public RSS feed **after someone opens it** so the catalog stays a list. Visitors can still submit a URL; that emails Zach and does **not** publish until you add an object to the JSON file and push.

```json
{
  "title": "The Idolatry of Faith",
  "author": "Peter Chon",
  "date": "April 24, 2026",
  "subtitle": "Trusting in Jesus for our salvation",
  "blurb": "One or two sentences. Do not paste the full essay.",
  "url": "https://peterchon.substack.com/p/the-idolatry-of-faith"
}
```

The first form submit sends FormSubmit a confirmation email. Click that once.

## Edit locally

```bash
git clone https://github.com/Zxch-Chen/hraacf.git
cd hraacf
python3 -m http.server 8000
```

Visit http://localhost:8000, edit `index.html` (photos in `assets/img/`, styles in `css/styles.css`), then:

```bash
git add -A
git commit -m "Update upcoming events"
git push
```

## Give others access

On GitHub: **Settings → Collaborators → Add people**. They can then edit `index.html` the same way.

On Vercel: the project is under Zach’s Hobby team. Transfer later if the fellowship wants its own Vercel/GitHub org.

## Point hraacf.org here later

1. In Vercel: Project → Settings → Domains → add `hraacf.org` and `www.hraacf.org`.
2. In DreamHost DNS, set the records Vercel shows (usually an A record for the apex and a CNAME for `www`).
3. Wait for DNS, then confirm https://hraacf.org loads this site (HTTPS works on Vercel; it does not on the current DreamHost setup).
4. Leave DreamHost as registrar until you are sure. You can roll DNS back if needed.

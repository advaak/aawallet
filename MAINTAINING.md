# Maintaining AAwallet

Plain-English guide for running this site without help. No prior knowledge assumed.

## The mental model

The site is a folder of text files in this GitHub repo. When a file changes on
GitHub, Vercel automatically rebuilds the site and publishes it — live in about a
minute. You never "upload" anything; you just change files on GitHub.

- **Code:** https://github.com/advaak/aawallet
- **Live site:** https://aawallet-tawny.vercel.app (custom domain `aawallet.com` not connected yet)
- **Hosting dashboard:** https://vercel.com → project `aawallet`

## Where things live

| Folder | What it holds | File type |
|---|---|---|
| `src/content/pitches/` | Stock pitches | `.mdx` |
| `src/content/cases/` | Finance & consulting cases | `.mdx` |
| `src/content/notes/` | Short data notes (one chart each) | `.mdx` |
| `src/content/authors/` | Author profiles — name, bio, links | `.json` |
| `public/models/` | Spreadsheet files that pitches link to | `.xlsx` / `.csv` |
| `public/data/` | CSV files that charts read | `.csv` |
| `src/pages/about.astro` | Wording of the About page | `.astro` |
| `src/pages/disclaimer.astro` | Wording of the Disclaimer page | `.astro` |

Rules the site is built on are in `SPEC.md` and `CLAUDE.md`. Read those before
changing anything structural.

## An `.mdx` post file

Two parts. The bit between the `---` lines is settings ("frontmatter"). Below it
is the article, written as plain text with blank lines between paragraphs.

```mdx
---
title: "Why Acme is a short"
ticker: "ACME"
company: "Acme Corp"
direction: "short"
publishedAt: 2026-03-14
priceAtPublication: 41.20
thesis:
  - "First reason the stock falls."
  - "Second reason."
  - "Third reason."
killCriteria:
  - "What would prove this wrong."
author: your-slug          # must match a file in src/content/authors/
artifacts:
  - label: "Model (xlsx)"
    href: "/models/acme-model.xlsx"
dataSources:
  - "10-K FY25"
draft: true                 # true = not shown on the live site yet
---

Write the pitch here. Normal paragraphs.

## A heading

More text.
```

`draft: true` keeps a post off the live site while you work on it. Change it to
`draft: false` (or delete the line) when it's ready. Draft posts DO show when
previewing locally.

The full checklist each post must meet before publishing is in `SPEC.md` §9.

## How to add or edit a post (browser only, no software)

1. Go to https://github.com/advaak/aawallet
2. Click into the folder, e.g. `src` → `content` → `pitches`
3. **To edit:** open a file, click the pencil icon (top right), make changes
4. **To add:** click `Add file` → `Create new file`. Name it
   `ticker-short-slug.mdx` for a pitch (e.g. `acme-short.mdx`),
   `finance-slug.mdx` or `consulting-slug.mdx` for a case,
   `slug.mdx` for a note. Paste in the frontmatter + text.
5. Scroll down, click **Commit changes**, then **Commit changes** again in the box
6. Wait ~1 minute. Check https://vercel.com → project `aawallet` → the top
   deployment should go green ("Ready"). Then refresh the live site.

If the deployment goes **red** ("Error"), your file has a mistake — usually a
frontmatter typo (wrong date format, missing required field, bad indentation).
Click the failed deployment → "Build Logs" to see the error, then fix the file.
The live site keeps showing the last working version until you fix it.

## Editing on your Mac instead (optional, gives a preview)

Needs Node.js (already installed) and the code downloaded locally (it's in
`~/aawallet`).

```bash
cd ~/aawallet
npm install        # first time only
npm run dev        # starts a preview at http://localhost:4321
```

Edit files in any text editor. The preview updates as you save. When done:

```bash
npm run build      # must succeed with no errors
npx astro check    # must be clean
```

Then push the changes. Easiest without the terminal: install **GitHub Desktop**
(desktop.github.com), open this repo in it, write a short summary, click
**Commit**, then **Push origin**.

## Updating a pitch's status (the scorecard)

The scorecard on `/scorecard` is built automatically from the pitches. To change
a pitch's status:

1. Open its `.mdx` file
2. Change `status:` to `intact`, `weakened`, or `broken`
3. Add a dated entry to `statusLog` (never edit or delete old entries — it is
   append-only):

```yaml
status: "weakened"
statusLog:
  - date: 2026-05-01
    status: "weakened"
    note: "Q1 revenue beat; margin thesis intact but growth call is in question."
```

## Common problems

| Symptom | Cause / fix |
|---|---|
| Change not showing on live site | Deployment still building, or it failed — check Vercel |
| Vercel deployment red / "Error" | Frontmatter mistake in the file you just changed; read Build Logs |
| New post doesn't appear in lists | `draft: true` is still set, or `publishedAt` is a future date |
| Email signup box missing | `PUBLIC_BUTTONDOWN_USERNAME` env var missing in Vercel |
| Date error in build | Dates must be `YYYY-MM-DD` with no quotes, e.g. `2026-03-14` |

## Still to do (from Phase 4)

- Connect `aawallet.com` (registered on a friend's Wix account) — add it in
  Vercel → Settings → Domains, then point the domain's nameservers or DNS records
  at Vercel from the Wix dashboard.
- Enable Vercel Analytics: project → Analytics tab → Enable, then redeploy once.
- Have a person read `/disclaimer` and the footer legal text and confirm the
  wording before any real launch (SPEC §8).

## Getting help later

- Free Claude at https://claude.ai can help draft post text — paste the result
  into a new file on GitHub.
- A future Claude Code session will pick up the project's rules from `SPEC.md`
  and `CLAUDE.md` in this repo.

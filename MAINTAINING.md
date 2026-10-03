# Maintaining AAwallet

Plain-English guide for running this site, for both authors. No coding tools
needed: everything below can be done in a web browser, with ChatGPT or any other
assistant to help draft.

## The mental model

The site is a folder of text files in this GitHub repo. When a change lands on
the `main` branch, GitHub builds the site and publishes it, live in about two
minutes. You never "upload a website"; you change files on GitHub.

- **Code:** https://github.com/advaak/aawallet
- **Live site:** https://theaawallet.com
- **Deploys:** the **Actions** tab on GitHub (https://github.com/advaak/aawallet/actions).
  A green check means live; a red X means the build failed and the live site
  keeps showing the last good version.

> Until the move from Vercel to GitHub Pages is finished (see the checklist at
> the bottom), deploys still run on Vercel. Check its dashboard instead.

## Where things live

| Folder | What it holds | Shows up at |
|---|---|---|
| `src/content/pitches/` | Stock pitches (`.mdx`) | **Finance** tab |
| `src/content/cases/` | Interview-style cases, finance and consulting (`.mdx`) | **Casebook** tab |
| `src/content/notes/` | Short data notes (`.mdx`), no tab of their own | Glossary, Latest |
| `src/content/authors/` | One author profile each (`.json`) | **About**, `/authors/<name>` |
| `public/models/` | Files a pitch links to (spreadsheets, PDFs) | download links |
| `public/images/` | Images used inside posts | in-post figures |
| `public/data/` | CSV files that charts read | chart downloads |

The **Glossary** page builds itself from every published post. Nothing to edit.

Site rules live in `SPEC.md` and `CLAUDE.md`. The checklist a post must meet
before publishing is `SPEC.md` section 9.

## The house rules (apply to both of us)

- **Never invent a number.** Every figure comes from a source we can name. If we
  don't have it, we don't print it.
- Show the arithmetic. State assumptions. Say what would prove the thesis wrong.
- Direct, short sentences. No hedging. Never imply professional credentials.
- Case walkthroughs keep the wrong turn in. That's the format.
- Never edit or delete an old `statusLog` entry. Add a new dated one.
- The other author reads every post before it goes live.

## A post file

Two parts. The block between the `---` lines is settings ("frontmatter"). Below
it is the article in plain paragraphs, `##` for headings.

**Pitch** (`src/content/pitches/ticker-slug.mdx`, e.g. `crwd-bad-time-to-buy.mdx`):

```mdx
---
title: "Why Acme is a short"
ticker: "ACME"
company: "Acme Corp"
direction: "short"            # only "long" or "short"
publishedAt: 2026-03-14       # YYYY-MM-DD, no quotes
priceAtPublication: 41.20     # a plain number
currency: "USD"
thesis:                       # 2 to 4 bullets
  - "First reason."
  - "Second reason."
killCriteria:                 # at least 1: what would prove this wrong
  - "What would prove this wrong."
status: "intact"              # intact | weakened | broken
statusLog: []
author: your-author-name      # must match a file in src/content/authors/
artifacts:                    # at least 1 file, uploaded to public/models/
  - label: "Model (xlsx)"
    href: "/models/acme-model.xlsx"
dataSources:                  # at least 1
  - "10-K FY25"
disclosure: "No position, and none intended within 72 hours."   # must be TRUE
draft: true                   # true = hidden from the lists
---

Write the pitch here.
```

**Case** (`src/content/cases/consulting-slug.mdx` or `finance-slug.mdx`):

```mdx
---
title: "Sizing the US market for electric bikes"
desk: "consulting"            # "finance" or "consulting"
caseType: "market-sizing"     # paper-lbo, dcf, comps, accretion-dilution,
                              # merger-math, market-sizing, profitability,
                              # market-entry, pricing, growth-strategy
difficulty: "standard"        # warmup | standard | hard
publishedAt: 2026-03-14
author: your-author-name
prompt: "The case, stated cold, the way an interviewer would say it."
timeToSolve: 20               # minutes
testing:
  - "What the interviewer is actually testing."
artifacts: []
draft: true
---

Walk through it. Show the arithmetic. Include one wrong turn.
```

Useful pieces inside the article: `<WrongTurn>text</WrongTurn>` for the approach
that didn't work, `<Assumption>25% a year</Assumption>` to mark an assumption,
`<KeyNumber value="$4.9B" label="Year-5 cash" />`, and `<Callout title="Note">text</Callout>`.

**Two gotchas that break the build:**
1. Don't type `{`, `}`, `<` or `>` in normal text (the site reads them as code).
   Write "under" or "less than" instead.
2. A pitch must list at least one file under `artifacts:` or the build fails.
   Upload the file too (see below), or its download link will be dead.

`draft: true` hides a post from every list, but the page itself still exists if
someone has the exact link. It is not private.

## Adding a post from the browser (the review flow)

This keeps the "other author reads it first" rule built in.

1. Go to https://github.com/advaak/aawallet and open the folder
   (e.g. `src` > `content` > `cases`).
2. **Add file > Create new file.** Type the file name (e.g. `consulting-ebike-sizing.mdx`)
   and paste the post.
3. Under **Commit changes**, pick **Create a new branch for this commit and start
   a pull request**, then **Propose changes**, then **Create pull request**.
4. Wait about a minute for the check at the bottom of the pull request.
   **Green** means it builds. **Red** means a formatting mistake: click
   **Details** to read the error, fix the file (the pull request's **Files changed**
   tab, then the `...` menu, then **Edit file**), and the check re-runs.
5. The other author reads it and clicks **Merge pull request**. The site updates
   about two minutes later.

To edit an existing post, open it, click the pencil, and use the same "new branch
and pull request" option.

**Uploading a file or image:** open the folder (`public/models/` or
`public/images/`), **Add file > Upload files**, drag it in, and commit (same
branch choice). Then link it as `/models/yourfile.pdf` or `/images/yourimage.png`.
Use file names with no spaces.

## Using ChatGPT to draft a post

Paste this into ChatGPT first, then give it your notes. It will return a file
ready to paste into GitHub. **Always check every number against your sources:
the assistant can get facts wrong, and the site's whole point is that it doesn't.**

```text
You are helping me write a post for AAwallet, a student finance and consulting
publication. Return ONE file in MDX, starting with the --- line and nothing
before it, so I can paste it straight into GitHub.

HARD RULES
- Never invent numbers, quotes, filings or statistics. Use only figures I give
  you. If a figure is missing, write [NEED: what is missing] instead of guessing.
- Show the arithmetic. State assumptions explicitly. Say what would prove the
  thesis wrong. Direct, short sentences, no hedging. Never imply professional
  credentials.
- Do not type the characters { } < > in normal text (write "under" or "less
  than"). Use straight quotes only, and never put a double quote inside a
  quoted value.
- Dates are YYYY-MM-DD with no quotes. Keep every field name exactly as shown.
- Body headings use ##. Case walkthroughs must include one wrong turn, written
  as <WrongTurn>text</WrongTurn>. Mark key assumptions as
  <Assumption>text</Assumption>.

If I ask for a PITCH, use exactly this frontmatter:
---
title: ""
ticker: ""
company: ""
direction: "long"          (only "long" or "short")
publishedAt: YYYY-MM-DD
priceAtPublication: 0.00   (a plain number)
currency: "USD"
thesis:                    (2 to 4 bullets)
  - ""
killCriteria:              (1 or more: what would prove the thesis wrong)
  - ""
status: "intact"
statusLog: []
author: MY-AUTHOR-NAME
artifacts:                 (at least 1 file)
  - label: ""
    href: "/models/FILENAME"
dataSources:               (at least 1)
  - ""
disclosure: "No position, and none intended within 72 hours."
draft: true
---

If I ask for a CASE, use exactly this frontmatter:
---
title: ""
desk: "consulting"         (or "finance")
caseType: ""               (one of: paper-lbo, dcf, comps, accretion-dilution,
                            merger-math, market-sizing, profitability,
                            market-entry, pricing, growth-strategy)
difficulty: "standard"     (warmup, standard or hard)
publishedAt: YYYY-MM-DD
author: MY-AUTHOR-NAME
prompt: ""                 (the case, stated cold, like an interviewer would)
timeToSolve: 20            (minutes)
testing:
  - ""                     (what the interviewer is actually testing)
artifacts: []
draft: true
---

My author name is: ______
Write a PITCH / CASE about: ______
My notes and sources: ______
```

## Your author profile

Each author needs a file in `src/content/authors/`, named like `jane-doe.json`:

```json
{
  "name": "Jane Doe",
  "desk": "consulting",
  "role": "Your major and school, stated plainly",
  "bio": "One or two honest sentences. No inflation.",
  "links": { "linkedin": "https://www.linkedin.com/in/your-name" }
}
```

The file name (without `.json`) is what you put after `author:` in your posts, and
it becomes your page at `/authors/jane-doe`, the link for your resume. `desk` is
`finance` or `consulting`. `links` can be `{}`, or include `linkedin`, `github` and
`email` (full URLs; `email` is a plain address).

## Updating a pitch's status

Open the pitch, change `status:` to `intact`, `weakened` or `broken`, and **add** a
dated entry to `statusLog` (never edit or delete old entries):

```yaml
status: "weakened"
statusLog:
  - date: 2026-05-01
    status: "weakened"
    note: "Q1 revenue beat; margin thesis intact but growth call is in question."
```

## Editing on your own computer (optional, gives a live preview)

Needs Node.js, Git and the code (`git clone https://github.com/advaak/aawallet.git`).

```bash
npm install        # first time only
npm run dev        # preview at http://localhost:4321 (drafts show here)
npm run build      # must succeed with no errors
npx astro check    # must be clean
```

Easiest way to send changes without the terminal: **GitHub Desktop**
(desktop.github.com). Always **Fetch/Pull** before you start so you don't overwrite
the other author's work.

## Common problems

| Symptom | Cause / fix |
|---|---|
| Red X on the pull request or in Actions | Formatting mistake in the file. Open **Details**, read the error, fix the file |
| Error mentions a field or "expected" | A required field is missing or misspelled (e.g. no `artifacts`, wrong `direction`) |
| Error mentions "Unexpected character" or "Could not parse" | A `{`, `}`, `<` or `>` in normal text. Rewrite that sentence |
| Error says an author can't be found | `author:` doesn't match a file name in `src/content/authors/` |
| A download or image link is dead (404) | The file isn't uploaded, or the name in the link doesn't match exactly |
| New post missing from the lists | `draft: true` is still set, or `publishedAt` is in the future |
| Date error | Dates are `YYYY-MM-DD`, no quotes |
| Email signup box missing | The `PUBLIC_BUTTONDOWN_USERNAME` setting is missing (see below) |
| Merged but site unchanged | Wait two minutes, hard-refresh (`Cmd+Shift+R`), check the Actions tab |

## Checklist: moving hosting from Vercel to GitHub Pages

Why: Vercel's free plan only deploys changes made by its owner, so a second
author's edits would never go live. GitHub Pages is free and deploys any
collaborator's change. Do these once, in order:

1. **GitHub, repo Settings > Pages:** set **Source** to **GitHub Actions**.
2. **Settings > Secrets and variables > Actions > Variables tab > New repository
   variable:** name `PUBLIC_BUTTONDOWN_USERNAME`, value `Advaak`.
3. **Push** the `.github/workflows/deploy.yml` file (it's already in the repo).
   Watch the **Actions** tab until it goes green.
4. **Settings > Pages > Custom domain:** enter `theaawallet.com`, **Save**.
5. **In Wix (Domains > theaawallet.com > Manage DNS Records):** delete the old
   Vercel `A` record, add four `A` records on the root (host `@`):
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
   and change the `www` `CNAME` to point to `advaak.github.io`.
6. Wait. When GitHub offers it (it can take up to 24 hours), tick
   **Enforce HTTPS** on the Pages settings page.
7. Add the other author: repo **Settings > Collaborators > Add people**.
8. Once the new site is confirmed live, remove the domain from Vercel and delete
   the Vercel project.

Optional: **Settings > Branches > Add rule** for `main`, requiring one approving
review, so nothing goes live without the other author signing off.

## Still to do

- Replace `src/content/authors/placeholder-consulting.json` with the real second
  author's profile.
- Confirm the `disclosure:` line on the CrowdStrike pitch is true.
- Have a person read `/disclaimer` and the footer text and confirm the wording
  before any real launch (SPEC section 8).

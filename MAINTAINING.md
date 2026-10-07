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

The site is hosted on **GitHub Pages**. It used to be on Vercel; see "Hosting and
domain" at the bottom for why we moved and how it's wired.

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
- Tell the other author when you publish, so they can read it (SPEC section 9).

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

## Adding a post from the browser

Either of us can publish on our own. There is no approval step: a change you
commit to the `main` branch goes live about two minutes later.

1. Go to https://github.com/advaak/aawallet and open the folder
   (e.g. `src` > `content` > `cases`).
2. **Add file > Create new file.** Type the file name (e.g. `consulting-ebike-sizing.mdx`)
   and paste the post.
3. Scroll down to **Commit changes**, leave **Commit directly to the `main`
   branch** selected, and click **Commit changes**.
4. Open the **Actions** tab. A **green check** on your commit means it's live.
   A **red X** means a formatting mistake: nothing was published and the site
   keeps showing the last good version. Click the run, read the error, and fix
   the file (open it, click the pencil, edit, commit again).

To edit an existing post, open it, click the pencil, change it, and commit the
same way.

**Uploading a file or image:** open the folder (`public/models/` or
`public/images/`), **Add file > Upload files**, drag it in, and commit. Then
link it as `/models/yourfile.pdf` or `/images/yourimage.png`. Use short file
names with no spaces, and no "Copy of" (the name ends up in the public link).
Put files in `public/models/` or `public/images/`, not in the top `public/`
folder.

**Because there's no approval step, be careful what goes live:**
- Keep `draft: true` while you're writing. It hides the post from every list.
  Switch it to `false` only when the post is finished and every number is
  checked.
- Have your sources written down. Never publish a figure you can't back up.
- Your SPEC (section 9) says the other author should read each post. Since
  nothing enforces it now, tell the other author when you publish so they can
  read it, and fix anything quickly if it's wrong.

**If you ever want a second pair of eyes first,** choose **Create a new branch for
this commit and start a pull request** in step 3 instead. The other author can
then read it and click **Merge pull request** when it's ready. A pull request also
gets a green or red build check before anything goes live.

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
| Red X in the **Actions** tab (or on a pull request) | Formatting mistake in the file. Open the run, read the error, fix the file. The live site keeps its last good version meanwhile |
| Error mentions a field or "expected" | A required field is missing or misspelled (e.g. no `artifacts`, wrong `direction`) |
| Error mentions "Unexpected character" or "Could not parse" | A `{`, `}`, `<` or `>` in normal text. Rewrite that sentence |
| Error says an author can't be found | `author:` doesn't match a file name in `src/content/authors/` |
| A download or image link is dead (404) | The file isn't uploaded, or the name in the link doesn't match exactly |
| New post missing from the lists | `draft: true` is still set, or `publishedAt` is in the future |
| Date error | Dates are `YYYY-MM-DD`, no quotes |
| Email signup box missing | The `PUBLIC_BUTTONDOWN_USERNAME` variable is missing or misspelled (repo Settings > Secrets and variables > Actions > Variables). After fixing it, run Actions > Build and deploy > Run workflow |
| Merged but site unchanged | Wait two minutes, hard-refresh (`Cmd+Shift+R`), check the Actions tab |

## Hosting and domain (reference)

**Why GitHub Pages, not Vercel:** Vercel's free plan only deploys changes made by
its owner, so a second author's edits would never go live (and can get the
project flagged). GitHub Pages is free and publishes any collaborator's change.
**Do not reconnect Vercel to this repo.**

How it's wired:
- **Workflow:** `.github/workflows/deploy.yml` builds on every push and pull
  request, and publishes only from `main`. To republish without changing any file:
  **Actions > Build and deploy > Run workflow**.
- **Repo Settings > Pages:** Source is **GitHub Actions**, custom domain is
  `theaawallet.com`, and **Enforce HTTPS** is ticked.
- **Repo Settings > Secrets and variables > Actions > Variables:**
  `PUBLIC_BUTTONDOWN_USERNAME` = the Buttondown username (powers the email box).
  The name and value go in their own boxes: Name `PUBLIC_BUTTONDOWN_USERNAME`,
  Value just the username.
- **DNS lives in Wix** (the account that bought the domain). Records on
  `theaawallet.com`: four `A` records on `@` pointing to `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www`
  pointing to `advaak.github.io`. Wix does not allow custom nameservers, which is
  why we use plain records. Leave other records alone.

If the domain ever shows a security warning (certificate problem): in Settings >
Pages, **Remove** the custom domain, retype it, **Save**, and wait. Do this once;
each re-add restarts GitHub's timer, which can take many hours. Last time it took
about three days to issue the first certificate.

Publishing is deliberately open: either author can commit straight to `main`. If
you ever want a required review, use **Settings > Rules** to require a pull
request before merging.

## Still to do

- Replace `src/content/authors/placeholder-consulting.json` with the real second
  author's profile.
- Confirm the `disclosure:` line on the CrowdStrike pitch is true.
- Have a person read `/disclaimer` and the footer text and confirm the wording
  before any real launch (SPEC section 8).

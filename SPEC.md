# Build Spec — AAwallet (theaawallet.com)

Implementation contract. The PRD says *what and why*; this says *how*. Read both before running anything.

**Rule for the whole build:** run it phase by phase. Do not paste this whole file into Claude Code and say "build it." Each phase below has a prompt and an acceptance check. Don't start a phase until the previous one passes.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro 5+ | Content collections, `src/content.config.ts`, glob loaders |
| Content | MDX | `@astrojs/mdx` |
| Styling | Tailwind | via `@tailwindcss/vite` |
| Charts | `@observablehq/plot` | Build-time only. Renders to static SVG. Zero client JS. |
| Chart DOM | `linkedom` | DOM shim so Plot can render in Node. Approved 2026-09-02 (Plot has no headless renderer). |
| Data parsing | `csv-parse` | Reads CSVs at build time |
| Feed | `@astrojs/rss` | |
| Sitemap | `@astrojs/sitemap` | |
| Host | Vercel or Cloudflare Pages | Free tier, git-push deploys |
| Email | Buttondown or Kit | Embed form only. No JS SDK. |

**No React.** Nothing on this site needs client-side state. If a phase seems to need it, that's a signal the feature is out of scope for v1.

**Dependency rule:** adding any package not in this table requires a decision from a human first.

---

## 2. Directory structure

```
/
├── CLAUDE.md
├── SPEC.md
├── astro.config.mjs
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── pitches/          # <ticker>-<slug>.mdx
│   │   ├── cases/            # <desk>-<slug>.mdx
│   │   ├── notes/            # <slug>.mdx
│   │   └── authors/          # <slug>.json
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   │   └── tokens.css
│   └── lib/
│       ├── chart.ts          # Observable Plot → static SVG
│       └── scorecard.ts      # derives scorecard rows from pitches
└── public/
    ├── models/               # .xlsx / .csv artifacts, referenced by frontmatter
    └── data/                 # CSVs backing charts
```

**Artifacts live in `public/models/`.** Every pitch links a real downloadable file from there. If a pitch has no artifact, it isn't finished.

---

## 3. Content collections

`src/content.config.ts`:

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    desk: z.enum(['finance', 'consulting']),
    role: z.string(),                    // "Business & Data Science, UNC Chapel Hill '28"
    bio: z.string(),                     // 2-3 sentences, no inflation
    links: z.object({
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
      email: z.string().email().optional(),
    }).default({}),
  }),
});

const artifact = z.object({
  label: z.string(),                     // "DCF model (xlsx)"
  href: z.string(),                      // "/models/xyz-dcf.xlsx"
});

const statusEntry = z.object({
  date: z.date(),
  status: z.enum(['intact', 'weakened', 'broken']),
  note: z.string(),
});

const pitches = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pitches' }),
  schema: z.object({
    title: z.string(),
    ticker: z.string(),
    company: z.string(),
    direction: z.enum(['long', 'short']),
    publishedAt: z.date(),
    priceAtPublication: z.number(),
    currency: z.string().default('USD'),
    thesis: z.array(z.string()).min(2).max(4),      // the three bullets
    killCriteria: z.array(z.string()).min(1),       // required. no exceptions.
    status: z.enum(['intact', 'weakened', 'broken']).default('intact'),
    statusLog: z.array(statusEntry).default([]),
    author: reference('authors'),
    artifacts: z.array(artifact).min(1),            // required. see §2.
    dataSources: z.array(z.string()).min(1),        // ["10-K FY25", "FRED DGS10"]
    disclosure: z.string().default('No position, and none intended within 72 hours.'),
    draft: z.boolean().default(false),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    desk: z.enum(['finance', 'consulting']),
    caseType: z.enum([
      'paper-lbo', 'dcf', 'comps', 'accretion-dilution', 'merger-math',
      'market-sizing', 'profitability', 'market-entry', 'pricing', 'growth-strategy',
    ]),
    difficulty: z.enum(['warmup', 'standard', 'hard']),
    publishedAt: z.date(),
    author: reference('authors'),
    prompt: z.string(),                  // the case, stated cold. rendered in a box up top.
    timeToSolve: z.number(),             // minutes, as an interviewer would allot
    testing: z.array(z.string()).min(1), // "what the interviewer is actually testing"
    artifacts: z.array(artifact).default([]),
    draft: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.date(),
    author: reference('authors'),
    desk: z.enum(['finance', 'consulting', 'either']).default('either'),
    dataFile: z.string().optional(),     // "/data/foo.csv" — published alongside the chart
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { authors, pitches, cases, notes };
```

**The scorecard has no separate data file.** It is derived from the `pitches` collection in `src/lib/scorecard.ts`. One source of truth — a pitch's status is edited in its own frontmatter, and the scorecard updates itself.

**No `returns` field anywhere, deliberately.** The scorecard tracks thesis status, not P&L. See PRD §04.

---

## 4. Routes

| Route | Content |
|---|---|
| `/` | "Start here" pinned block, latest 6 posts across all types, both desks visible |
| `/scorecard` | Every pitch: ticker, direction, date, price at publication, status, last update. Sortable by column via plain `<table>` + a tiny inline sort script, or pre-sorted links. No framework. |
| `/pitches` | Index, newest first |
| `/pitches/[slug]` | PitchLayout |
| `/finance` | Desk landing: author blurb + finance cases grouped by `caseType` |
| `/finance/[slug]` | CaseLayout |
| `/consulting` | Same, consulting desk |
| `/consulting/[slug]` | CaseLayout |
| `/notes`, `/notes/[slug]` | |
| `/authors/[slug]` | Bio, desk, every post by that author. **This is the resume URL.** |
| `/about` | Both authors, what the site is, what it isn't |
| `/disclaimer` | Full text. Linked from every page footer. |
| `/rss.xml` | All post types |

`draft: true` excludes a post from every index and the RSS feed in production builds only.

---

## 5. Components

Build these as Astro components. Names are fixed — don't rename them later.

**Layout:** `BaseLayout`, `PostLayout` (shared chrome), `PitchLayout`, `CaseLayout`, `NoteLayout`

**Pitch-specific:** `ThesisBox` (the 3 bullets, above the fold), `KillCriteria`, `StatusBadge` (intact/weakened/broken, semantic color), `StatusLog` (dated updates), `Disclosure` (position statement), `ArtifactList` (download links), `DataSources` (cited list)

**Case-specific:** `PromptBox` (the case, stated cold), `TestingBox` ("what the interviewer is testing"), `WrongTurn` (a visually distinct block for the approach that didn't work — this is the site's signature element, make it look deliberate, not like an error)

**Shared:** `Byline` (author + desk + date, on every post), `AuthorCard`, `ScorecardTable`, `Chart`, `KeyNumber`, `Assumption` (inline, marks a stated assumption), `Callout`

### The `Chart` component

Charts render at build time. No client JS, no chart library shipped to the browser.

```
<Chart src="/data/foo.csv" type="line" x="date" y="value" caption="..." />
```

It reads the CSV in `public/data/`, renders SVG via Observable Plot in Node during the build, inlines the SVG, and renders a "download the data" link under the caption. Chart text colors come from CSS custom properties so both themes work.

---

## 6. Design tokens

`src/styles/tokens.css`. Starting point — change the hues if you want, but keep the structure: every color is a token defined in bare `:root` first, then overridden for dark.

```css
:root {
  --paper: #FAFBFC;  --surface: #FFFFFF;  --sunk: #F0F4F7;
  --ink: #131A21;    --ink-2: #3C4956;    --ink-3: #6E7C89;
  --rule: #DBE3EA;   --rule-strong: #B7C4D0;
  --accent: #1B5E8C;      /* finance desk */
  --accent-2: #3E8C7A;    /* consulting desk */
  --good: #1F6B4F;  --warn: #8F6013;  --crit: #97302F;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* redefine the same names, darker */ }
}
:root[data-theme="dark"] { /* same again, so a toggle wins */ }
```

**Type:** serif for headings, sans for body, mono for tickers/figures/labels. Set `font-variant-numeric: tabular-nums` on every table and every figure. Body measure ~68ch.

**Desk color is structural, not decorative.** Finance uses `--accent`, consulting uses `--accent-2`, consistently, everywhere. That's how a reader knows which desk they're in without reading the nav.

---

## 7. Build phases

Run these in order. Each is one Claude Code session. Review the diff before moving on.

### Phase 0 — Scaffold (target: 2 hrs)

> Set up an Astro 5 project with MDX, Tailwind (via @tailwindcss/vite), sitemap, and RSS. Create the directory structure in SPEC.md §2 and the exact content collections config in §3 — copy the schema verbatim, do not improvise fields. Create `src/styles/tokens.css` from §6. Create one author JSON file and one placeholder MDX file per collection so the build has something to typecheck against. Get `npm run build` passing. Do not build any pages or components yet.

**Accept when:** `npm run build` passes, `astro check` is clean, and the collection types are generated.

### Phase 1 — Layouts and post pages (target: 2 hrs)

> Build BaseLayout, PostLayout, PitchLayout, CaseLayout, NoteLayout and the components listed in SPEC.md §5, except Chart and ScorecardTable. Wire up the dynamic routes `/pitches/[slug]`, `/finance/[slug]`, `/consulting/[slug]`, `/notes/[slug]`. Use the design tokens from tokens.css — no hardcoded colors anywhere. Every post renders a Byline. Every page footer links /disclaimer.

**Accept when:** each placeholder post renders correctly in both light and dark, and no hex value appears outside tokens.css.

### Phase 2 — Indexes, scorecard, author pages (target: 1.5 hrs)

> Build `/`, `/pitches`, `/finance`, `/consulting`, `/notes`, `/authors/[slug]`, `/about`, `/disclaimer`, `/rss.xml`. Write `src/lib/scorecard.ts` to derive scorecard rows from the pitches collection and build `/scorecard` with ScorecardTable. Desk pages group cases by caseType. Exclude `draft: true` posts from indexes and RSS in production builds only.

**Accept when:** every route resolves, drafts are hidden in a production build, and the scorecard reflects pitch frontmatter with no separate data file.

### Phase 3 — Charts (target: 1 hr)

> Build the Chart component per SPEC.md §5. Read CSV from public/data at build time with csv-parse, render with @observablehq/plot in Node, inline the resulting SVG, and add a data-download link below the caption. Chart text and axis colors must use the CSS custom properties so both themes work. Ship one real example chart in a note.

**Accept when:** the chart renders as inline SVG, no Plot code reaches the client bundle, and it's legible in dark mode.

### Phase 4 — Deploy (target: 30 min)

> Deploy to Vercel. Point theaawallet.com at it. Add the email signup form embed to the footer and the bottom of PostLayout. Add Vercel Analytics.

**Accept when:** the live domain serves the site over HTTPS and a test signup lands in the email tool.

**Stop here.** No search, no tags, no redesign until there are ten real posts.

---

## 8. Legal text

Both of these go live in Phase 2. Have a human read them before deploy.

**Footer, every page:**
> Educational content by undergraduate students. Not investment advice, not a recommendation to buy or sell any security. Positions disclosed on every pitch. See full disclaimer.

**Every pitch, above the fold:**
> Price at publication: `$X` on `DATE`. This analysis is not updated for subsequent price movement. Author's position: `<disclosure>`.

---

## 9. Definition of done, per post type

A post ships only when every box is checked. Put this in the PR template.

**Pitch:** thesis in 2–4 bullets above the fold · kill criteria stated · every valuation assumption explicit and sourced · bear case written to win · model file in `public/models/` and linked · `dataSources` populated · disclosure present · price at publication stamped · read by the other author

**Case:** prompt stated cold before any analysis · at least one wrong turn shown and explained · arithmetic visible, not asserted · `testing` populated · `timeToSolve` realistic · read by the other author

**Note:** one chart · the source CSV published in `public/data/` and linked · one clear question, answered

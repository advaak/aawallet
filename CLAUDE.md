# CLAUDE.md

Rules for working in this repo. Read `SPEC.md` before making structural changes.

## What this is

**AAwallet** (aawallet.com) — a static publication of stock pitches and worked finance/consulting cases, written by two undergraduates. Two desks: **finance** and **consulting**. Every post carries a named byline; author pages are the URLs that go on resumes.

The site exists to demonstrate rigorous thinking. Everything below serves that.

## Commands

```
npm run dev      # local dev
npm run build    # production build — must pass before any commit
npx astro check  # type check — must be clean
```

## Hard rules

1. **Do not restructure.** The directory layout, collection schemas, route table, and component names in `SPEC.md` are fixed. If something seems wrong, say so and wait — do not refactor it unprompted.
2. **Do not add dependencies.** The stack table in `SPEC.md` §1 is complete. Adding anything else requires a human decision first. In particular: no React, no client-side chart library, no UI kit, no state management.
3. **No hardcoded colors.** Every color comes from a token in `src/styles/tokens.css`. A hex value anywhere else is a bug.
4. **No client-side JavaScript** unless there is no static alternative. This is a document site. Charts render at build time.
5. **Never invent financial figures.** If a number is needed for a placeholder, label it clearly as fake. Never fabricate a real company's financials, a filing quote, or a market statistic — a single made-up number destroys the entire point of this site.
6. **Never edit `statusLog` entries retroactively.** The scorecard's value is that it is append-only. Add a new dated entry; never rewrite or delete an old one.
7. **Don't touch `public/models/`.** Those are hand-built spreadsheets. Link them, never generate them.

## Conventions

- **Filenames:** pitches `<ticker-lowercase>-<slug>.mdx`, cases `<desk>-<slug>.mdx`, notes `<slug>.mdx`
- **Dates:** ISO `YYYY-MM-DD` in frontmatter, always
- **Desk color is structural:** finance = `--accent`, consulting = `--accent-2`. Never mix them.
- **Numbers in prose:** tabular-nums, units always stated, no naked percentages (say "up 340 bps", not "up a lot")
- **Components are Astro, not React.** `.astro` files.
- **Prose measure ~68ch.** Tables and charts may go wider inside an `overflow-x: auto` container; the page body never scrolls sideways.

## The scorecard

Derived at build time from the `pitches` collection by `src/lib/scorecard.ts`. There is **no separate scorecard data file** and there must never be one. To update a pitch's status, edit that pitch's frontmatter: change `status` and append an entry to `statusLog`.

There is deliberately **no returns column**. Do not add one, and do not add price-fetching of any kind. Prices are stamped once at publication and left alone.

## Voice

Two authors write here, and the site must read as one publication.

- Direct. Short sentences. No hedging, no "it depends" — state a view and give the reasoning.
- Show the arithmetic. An asserted number is worthless; a derived one is the product.
- State assumptions explicitly and flag which ones the conclusion is sensitive to.
- Never claim more confidence than the analysis supports. Never imply professional credentials.
- Case walkthroughs keep the wrong turn in. That's the format, not a mistake to clean up.

## Before shipping a post

Check it against the per-type checklist in `SPEC.md` §9. Every post is read by the other author before it goes live.

## Out of scope for v1

Comments · paid tiers · user accounts · search · tag filtering · live price data · a redesign before post #10. If asked to build one of these, point at this line first.

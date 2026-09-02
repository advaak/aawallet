import { getCollection } from "astro:content";
import { includeDrafts } from "./posts";

/**
 * The scorecard has NO separate data file and never will (SPEC §3, CLAUDE.md).
 * Every row is derived here from the `pitches` collection. There is deliberately
 * no returns column — this tracks thesis status, not P&L.
 */
export interface ScorecardRow {
  slug: string;
  title: string;
  ticker: string;
  company: string;
  direction: "long" | "short";
  publishedAt: Date;
  priceAtPublication: number;
  currency: string;
  status: "intact" | "weakened" | "broken";
  /** Most recent statusLog entry date, or publishedAt if the log is empty. */
  lastUpdate: Date;
  updateCount: number;
}

export async function getScorecardRows(): Promise<ScorecardRow[]> {
  const pitches = await getCollection("pitches");
  const visible = includeDrafts
    ? pitches
    : pitches.filter((p) => !p.data.draft);

  return visible
    .map((p): ScorecardRow => {
      const d = p.data;
      const logTimes = d.statusLog.map((e) => e.date.getTime());
      const lastUpdate = logTimes.length
        ? new Date(Math.max(...logTimes))
        : d.publishedAt;
      return {
        slug: p.id,
        title: d.title,
        ticker: d.ticker,
        company: d.company,
        direction: d.direction,
        publishedAt: d.publishedAt,
        priceAtPublication: d.priceAtPublication,
        currency: d.currency,
        status: d.status,
        lastUpdate,
        updateCount: d.statusLog.length,
      };
    })
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

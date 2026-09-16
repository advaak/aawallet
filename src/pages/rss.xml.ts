import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { includeDrafts, caseHref } from "../lib/posts";

export const GET: APIRoute = async (context) => {
  const [pitches, cases, notes] = await Promise.all([
    getCollection("pitches"),
    getCollection("cases"),
    getCollection("notes"),
  ]);

  const vis = <T extends { data: { draft: boolean } }>(entries: T[]): T[] =>
    includeDrafts ? entries : entries.filter((e) => !e.data.draft);

  const items = [
    ...vis(pitches).map((p) => ({
      title: `${p.data.ticker} — ${p.data.title}`,
      pubDate: p.data.publishedAt,
      link: `/pitches/${p.id}/`,
      description: p.data.thesis[0],
    })),
    ...vis(cases).map((c) => ({
      title: c.data.title,
      pubDate: c.data.publishedAt,
      link: `${caseHref(c)}/`,
      description: c.data.prompt,
    })),
    ...vis(notes).map((n) => ({
      title: n.data.title,
      pubDate: n.data.publishedAt,
      link: `/notes/${n.id}/`,
      description: n.data.title,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: "AAwallet",
    description:
      "Stock pitches and worked finance & consulting cases, written by two undergraduates.",
    site: context.site ?? "https://theaawallet.com",
    items,
  });
};

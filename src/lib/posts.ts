import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

/**
 * Drafts are visible in `astro dev` and hidden in production builds
 * (`astro build`). SPEC §4 / Phase 2. Nothing else keys off the environment.
 */
export const includeDrafts = import.meta.env.DEV;

export type PostType = "pitch" | "case" | "note";

export interface PostItem {
  type: PostType;
  id: string;
  title: string;
  href: string;
  publishedAt: Date;
  authorId: string;
  authorName: string;
  /** Desk for byline + accent colour. Notes may be "either" (neutral). */
  desk: "finance" | "consulting" | "either";
  draft: boolean;
  ticker?: string;
  direction?: "long" | "short";
  status?: "intact" | "weakened" | "broken";
  caseType?: CollectionEntry<"cases">["data"]["caseType"];
}

function visible<T extends { data: { draft: boolean } }>(entries: T[]): T[] {
  return includeDrafts ? entries : entries.filter((e) => !e.data.draft);
}

async function authorIndex() {
  const authors = await getCollection("authors");
  return new Map(authors.map((a) => [a.id, a.data]));
}

/** Path an entry is served at, by type (and by desk for cases). */
export function caseHref(entry: CollectionEntry<"cases">): string {
  return `/${entry.data.desk}/${entry.id}`;
}

export async function getPitchItems(): Promise<PostItem[]> {
  const [pitches, authors] = await Promise.all([
    getCollection("pitches"),
    authorIndex(),
  ]);
  return visible(pitches)
    .map((p): PostItem => {
      const author = authors.get(p.data.author.id);
      return {
        type: "pitch",
        id: p.id,
        title: p.data.title,
        href: `/pitches/${p.id}`,
        publishedAt: p.data.publishedAt,
        authorId: p.data.author.id,
        authorName: author?.name ?? p.data.author.id,
        desk: author?.desk ?? "either",
        draft: p.data.draft,
        ticker: p.data.ticker,
        direction: p.data.direction,
        status: p.data.status,
      };
    })
    .sort(byNewest);
}

export async function getCaseItems(): Promise<PostItem[]> {
  const [cases, authors] = await Promise.all([
    getCollection("cases"),
    authorIndex(),
  ]);
  return visible(cases)
    .map((c): PostItem => ({
      type: "case",
      id: c.id,
      title: c.data.title,
      href: caseHref(c),
      publishedAt: c.data.publishedAt,
      authorId: c.data.author.id,
      authorName: authors.get(c.data.author.id)?.name ?? c.data.author.id,
      desk: c.data.desk,
      draft: c.data.draft,
      caseType: c.data.caseType,
    }))
    .sort(byNewest);
}

export async function getNoteItems(): Promise<PostItem[]> {
  const [notes, authors] = await Promise.all([
    getCollection("notes"),
    authorIndex(),
  ]);
  return visible(notes)
    .map((n): PostItem => ({
      type: "note",
      id: n.id,
      title: n.data.title,
      href: `/notes/${n.id}`,
      publishedAt: n.data.publishedAt,
      authorId: n.data.author.id,
      authorName: authors.get(n.data.author.id)?.name ?? n.data.author.id,
      desk: n.data.desk,
      draft: n.data.draft,
    }))
    .sort(byNewest);
}

export async function getAllPosts(): Promise<PostItem[]> {
  const [pitches, cases, notes] = await Promise.all([
    getPitchItems(),
    getCaseItems(),
    getNoteItems(),
  ]);
  return [...pitches, ...cases, ...notes].sort(byNewest);
}

export async function getPostsByAuthor(authorId: string): Promise<PostItem[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.authorId === authorId);
}

function byNewest(a: PostItem, b: PostItem): number {
  return b.publishedAt.getTime() - a.publishedAt.getTime();
}

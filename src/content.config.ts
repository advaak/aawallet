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

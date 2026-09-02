import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { parseHTML } from "linkedom";
import * as Plot from "@observablehq/plot";

/**
 * Build-time chart rendering. Runs in Node during `astro build` / dev SSR only —
 * nothing here reaches the client bundle (SPEC §5, CLAUDE.md §4).
 *
 * Reads a CSV from public/data, renders it with Observable Plot into a linkedom
 * document, strips Plot's scoped <style>, and injects token-based theming so the
 * SVG works in both light and dark. Returns an inline-able SVG string.
 */

export type ChartType = "line" | "area" | "bar";

export interface ChartOptions {
  src: string; // "/data/foo.csv"
  type: ChartType;
  x: string;
  y: string;
  width?: number;
  height?: number;
}

export interface RenderedChart {
  svg: string;
  rowCount: number;
  src: string;
}

/** ISO date -> Date, plain number -> number, everything else -> trimmed string. */
function coerce(value: string): string | number | Date {
  if (value == null) return value;
  const s = value.trim();
  if (s === "") return s;
  if (/^\d{4}-\d{2}-\d{2}(T[\d:.+Z-]*)?$/.test(s)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

const THEME_CSS = `
text { white-space: pre; }
svg { color: var(--ink-2); font-family: var(--font-sans); font-size: 12px; }
[aria-label$="tick"] text,
[aria-label$="label"] text { fill: var(--ink-3); }
[aria-label$="tick"] line { stroke: var(--rule-strong); }
[aria-label$="grid"] line { stroke: var(--rule); stroke-opacity: 1; }
[aria-label="rule"] line { stroke: var(--rule-strong); }
[aria-label="line"] path { stroke: var(--chart-accent, var(--accent)); stroke-width: 2; fill: none; }
[aria-label="area"] path { fill: var(--chart-accent, var(--accent)); fill-opacity: 0.12; }
[aria-label="bar"] rect { fill: var(--chart-accent, var(--accent)); }
[aria-label="dot"] circle { fill: var(--chart-accent, var(--accent)); }
`.trim();

export function renderChart(opts: ChartOptions): RenderedChart {
  const { src, type, x, y, width = 720, height = 360 } = opts;

  const file = resolve(process.cwd(), "public", src.replace(/^\/+/, ""));
  const raw = readFileSync(file, "utf8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    throw new Error(`Chart: ${src} has no data rows`);
  }
  for (const col of [x, y]) {
    if (!(col in records[0])) {
      throw new Error(`Chart: column "${col}" not found in ${src}`);
    }
  }

  const data = records.map((r) => {
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(r)) row[key] = coerce(r[key]);
    return row;
  });

  const { document } = parseHTML(
    "<!DOCTYPE html><html><head></head><body></body></html>",
  );

  const marks =
    type === "area"
      ? [
          Plot.areaY(data, { x, y, curve: "monotone-x" }),
          Plot.lineY(data, { x, y, curve: "monotone-x" }),
        ]
      : type === "bar"
        ? [Plot.barY(data, { x, y })]
        : [Plot.lineY(data, { x, y, curve: "monotone-x" })];

  const node = Plot.plot({
    document,
    width,
    height,
    marginLeft: 56,
    marginRight: 16,
    marginBottom: 36,
    marginTop: 16,
    style: { background: "transparent", overflow: "visible" },
    x: { label: null, tickSize: 4, ticks: 6 },
    y: { label: null, tickSize: 0, grid: true },
    marks: [Plot.ruleY([0]), ...marks],
  }) as unknown as Element;

  const svg =
    node.tagName.toLowerCase() === "svg"
      ? node
      : node.querySelector("svg");
  if (!svg) throw new Error(`Chart: Plot produced no <svg> for ${src}`);

  svg.querySelectorAll("style").forEach((s) => s.remove());

  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("role", "img");

  const style = document.createElement("style");
  style.textContent = THEME_CSS;
  svg.insertBefore(style, svg.firstChild);

  return { svg: svg.outerHTML, rowCount: data.length, src };
}

// Schlichte Signets für die erfundenen Verwaltungen: ein Schild mit Band und Symbol.
// Bewusst keine echten Wappen oder Hoheitszeichen (z. B. kein Adler).
import { encodePng } from "./png";

export type EmblemSymbol = "tower" | "tree" | "wave" | "chip" | "columns" | "book" | "arch" | "grid";

export interface EmblemSpec {
  symbol: EmblemSymbol;
  /** Schildfarbe (#rrggbb). */
  color: string;
  /** Farbe des Bands (#rrggbb). */
  accent: string;
}

type Point = [number, number];
type Shape = { kind: "poly"; points: Point[]; rgb: number[] } | { kind: "circle"; cx: number; cy: number; r: number; rgb: number[] };

const W = 180;
const H = 216;
const WHITE = [255, 255, 255];

export function emblemPng(spec: EmblemSpec): Buffer {
  const shield = shieldOutline();
  const base = hex(spec.color);
  const accent = hex(spec.accent);
  const shapes: Shape[] = [
    // Band im oberen Drittel
    {
      kind: "poly",
      points: [
        [0, 22],
        [W, 22],
        [W, 58],
        [0, 58],
      ],
      rgb: accent,
    },
    ...symbol(spec.symbol, accent),
  ];
  const rgba = new Uint8Array(W * H * 4);
  const S = 3; // Kantenglättung durch Überabtastung
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let inside = 0;
      const sum = [0, 0, 0];
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const p: Point = [x + (sx + 0.5) / S, y + (sy + 0.5) / S];
          if (!inPolygon(p, shield)) continue;
          inside++;
          let rgb = base;
          for (const shape of shapes) if (contains(shape, p)) rgb = shape.rgb;
          sum[0] += rgb[0];
          sum[1] += rgb[1];
          sum[2] += rgb[2];
        }
      }
      const i = (y * W + x) * 4;
      if (inside) {
        rgba[i] = Math.round(sum[0] / inside);
        rgba[i + 1] = Math.round(sum[1] / inside);
        rgba[i + 2] = Math.round(sum[2] / inside);
        rgba[i + 3] = Math.round((inside / (S * S)) * 255);
      }
    }
  }
  return encodePng(W, H, rgba);
}

export const EMBLEM_SIZE = { width: W, height: H };

function shieldOutline(): Point[] {
  const pts: Point[] = [
    [6, 6],
    [W - 6, 6],
    [W - 6, 112],
  ];
  // rechte Rundung zur Spitze, dann gespiegelt zurück
  const curve: Point[] = [];
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const x = (1 - t) ** 2 * (W - 6) + 2 * (1 - t) * t * (W - 6) + t ** 2 * (W / 2);
    const y = (1 - t) ** 2 * 112 + 2 * (1 - t) * t * 176 + t ** 2 * (H - 4);
    curve.push([x, y]);
  }
  pts.push(...curve);
  pts.push(
    ...curve
      .slice(0, -1)
      .reverse()
      .map(([x, y]): Point => [W - x, y]),
  );
  pts.push([6, 112]);
  return pts;
}

function symbol(kind: EmblemSymbol, accent: number[]): Shape[] {
  const rect = (x: number, y: number, w: number, h: number, rgb = WHITE): Shape => ({
    kind: "poly",
    points: [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    rgb,
  });
  const poly = (points: Point[], rgb = WHITE): Shape => ({ kind: "poly", points, rgb });
  const circle = (cx: number, cy: number, r: number, rgb = WHITE): Shape => ({ kind: "circle", cx, cy, r, rgb });
  switch (kind) {
    case "tower":
      return [
        rect(62, 92, 56, 78),
        rect(56, 74, 14, 22),
        rect(83, 74, 14, 22),
        rect(110, 74, 14, 22),
        rect(56, 88, 68, 8),
        rect(80, 136, 20, 34, accent),
        circle(90, 136, 10, accent),
      ];
    case "tree":
      return [circle(90, 110, 36), circle(66, 126, 22), circle(114, 126, 22), rect(84, 130, 12, 46)];
    case "wave": {
      const band = (y0: number): Shape => {
        const top: Point[] = [];
        const bottom: Point[] = [];
        for (let x = 20; x <= 160; x += 5) {
          top.push([x, y0 + Math.sin((x - 20) / 18) * 8]);
          bottom.push([x, y0 + 14 + Math.sin((x - 20) / 18) * 8]);
        }
        return poly([...top, ...bottom.reverse()]);
      };
      return [band(92), band(124), band(156)];
    }
    case "chip": {
      const pins: Shape[] = [];
      for (let i = 0; i < 4; i++) {
        pins.push(rect(64 + i * 15, 76, 6, 16), rect(64 + i * 15, 158, 6, 16), rect(46, 96 + i * 15, 16, 6), rect(118, 96 + i * 15, 16, 6));
      }
      return [...pins, rect(60, 90, 60, 70), rect(74, 104, 32, 42, accent)];
    }
    case "columns":
      return [
        poly([
          [50, 100],
          [90, 72],
          [130, 100],
        ]),
        rect(56, 104, 12, 50),
        rect(84, 104, 12, 50),
        rect(112, 104, 12, 50),
        rect(48, 156, 84, 10),
        rect(52, 100, 76, 6),
      ];
    case "book":
      return [
        poly([
          [40, 92],
          [86, 100],
          [86, 160],
          [40, 152],
        ]),
        poly([
          [94, 100],
          [140, 92],
          [140, 152],
          [94, 160],
        ]),
        rect(52, 110, 26, 4, accent),
        rect(52, 122, 26, 4, accent),
        rect(102, 110, 26, 4, accent),
        rect(102, 122, 26, 4, accent),
      ];
    case "arch": {
      const outer: Point[] = [];
      const inner: Point[] = [];
      for (let i = 0; i <= 24; i++) {
        const a = Math.PI - (i / 24) * Math.PI;
        outer.push([90 + Math.cos(a) * 52, 150 - Math.sin(a) * 60]);
        inner.push([90 + Math.cos(a) * 34, 150 - Math.sin(a) * 42]);
      }
      return [poly([...outer, ...inner.reverse()]), rect(30, 150, 120, 10)];
    }
    case "grid":
      return [rect(52, 80, 34, 34), rect(94, 80, 34, 34), rect(52, 122, 34, 34), rect(94, 122, 34, 34, accent)];
  }
}

function contains(shape: Shape, p: Point): boolean {
  if (shape.kind === "circle") return (p[0] - shape.cx) ** 2 + (p[1] - shape.cy) ** 2 <= shape.r ** 2;
  return inPolygon(p, shape.points);
}

function inPolygon([x, y]: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function hex(color: string): number[] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (!m) throw new Error(`Ungültige Farbe: ${color}`);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

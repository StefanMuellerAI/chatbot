// Kleiner Formel-Rechner für die Excel-Dateien des Fundus. Er berechnet die Ergebnisse, die in der
// Datei neben der Formel stehen (so zeigen Excel, LibreOffice und das Auslesen sofort richtige Zahlen).
// Unterstützt: + - * / ^, Vergleiche, Klammern, Zellbezüge (auch 'Blatt'!A1), Bereiche und
// SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, ROUND, ABS, IF.

export type Value = number | string | boolean | null;

export interface FormulaContext {
  /** Liefert den (ggf. berechneten) Wert einer Zelle. */
  cell(sheet: string, col: number, row: number): Value;
}

type Token = { t: "num"; v: number } | { t: "str"; v: string } | { t: "ref"; v: string } | { t: "name"; v: string } | { t: "op"; v: string };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      const m = /^\d*\.?\d+(?:[eE][+-]?\d+)?/.exec(src.slice(i))!;
      tokens.push({ t: "num", v: Number(m[0]) });
      i += m[0].length;
      continue;
    }
    if (c === '"') {
      const end = src.indexOf('"', i + 1);
      tokens.push({ t: "str", v: src.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    const ref = /^(?:(?:'[^']+'|[A-Za-zÄÖÜäöüß0-9_]+)!)?\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?/.exec(src.slice(i));
    if (ref && !/^[A-Z]+\(/.test(src.slice(i))) {
      tokens.push({ t: "ref", v: ref[0] });
      i += ref[0].length;
      continue;
    }
    const name = /^[A-Z][A-Z0-9.]*/.exec(src.slice(i));
    if (name) {
      tokens.push({ t: "name", v: name[0] });
      i += name[0].length;
      continue;
    }
    const op = /^(<=|>=|<>|[-+*/^(),:<>=&])/.exec(src.slice(i));
    if (!op) throw new Error(`Unbekanntes Zeichen in Formel „${src}“: ${c}`);
    tokens.push({ t: "op", v: op[0] });
    i += op[0].length;
  }
  return tokens;
}

export function colIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export function colLetters(index: number): string {
  let s = "";
  while (index > 0) {
    const r = (index - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    index = Math.floor((index - 1) / 26);
  }
  return s;
}

function parseRef(ref: string, sheet: string): { sheet: string; from: [number, number]; to: [number, number] } {
  const bang = ref.lastIndexOf("!");
  const target = bang >= 0 ? ref.slice(0, bang).replace(/^'|'$/g, "") : sheet;
  const body = (bang >= 0 ? ref.slice(bang + 1) : ref).replace(/\$/g, "");
  const [a, b] = body.split(":");
  const cell = (s: string): [number, number] => {
    const m = /^([A-Z]+)(\d+)$/.exec(s)!;
    return [colIndex(m[1]), Number(m[2])];
  };
  return { sheet: target, from: cell(a), to: cell(b ?? a) };
}

const num = (v: Value): number =>
  typeof v === "number" ? v : typeof v === "boolean" ? Number(v) : v === null || v === "" ? 0 : Number.isNaN(Number(v)) ? 0 : Number(v);

export function evaluate(formula: string, sheet: string, ctx: FormulaContext): Value {
  const tokens = tokenize(formula.replace(/^=/, ""));
  let pos = 0;
  const peek = () => tokens[pos];
  const take = (v?: string) => {
    const tok = tokens[pos++];
    if (v && (!tok || tok.t !== "op" || tok.v !== v)) throw new Error(`Formel „${formula}“: „${v}“ erwartet`);
    return tok;
  };
  const isOp = (v: string) => peek()?.t === "op" && peek()!.v === v;

  const values = (ref: string): Value[] => {
    const r = parseRef(ref, sheet);
    const out: Value[] = [];
    for (let row = Math.min(r.from[1], r.to[1]); row <= Math.max(r.from[1], r.to[1]); row++) {
      for (let col = Math.min(r.from[0], r.to[0]); col <= Math.max(r.from[0], r.to[0]); col++) out.push(ctx.cell(r.sheet, col, row));
    }
    return out;
  };

  const args = (): Value[][] => {
    take("(");
    const list: Value[][] = [];
    if (isOp(")")) {
      take(")");
      return list;
    }
    for (;;) {
      const tok = peek();
      const next = tokens[pos + 1];
      if (tok?.t === "ref" && tok.v.includes(":") && next?.t === "op" && [",", ")"].includes(next.v)) {
        pos++;
        list.push(values(tok.v));
      } else {
        list.push([comparison()]);
      }
      if (isOp(",")) take(",");
      else break;
    }
    take(")");
    return list;
  };

  const call = (name: string): Value => {
    const list = args();
    const flat = list.flat();
    const nums = flat.filter((v): v is number => typeof v === "number");
    switch (name) {
      case "SUM":
        return nums.reduce((s, v) => s + v, 0);
      case "AVERAGE":
        return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
      case "MIN":
        return nums.length ? Math.min(...nums) : 0;
      case "MAX":
        return nums.length ? Math.max(...nums) : 0;
      case "COUNT":
        return nums.length;
      case "COUNTA":
        return flat.filter((v) => v !== null && v !== "").length;
      case "ROUND": {
        const digits = num(list[1]?.[0] ?? 0);
        const f = 10 ** digits;
        return Math.round(num(list[0][0]) * f) / f;
      }
      case "ABS":
        return Math.abs(num(list[0][0]));
      case "IF":
        return list[0][0] ? (list[1]?.[0] ?? true) : (list[2]?.[0] ?? false);
      default:
        throw new Error(`Formel „${formula}“: Funktion ${name} wird nicht unterstützt`);
    }
  };

  function primary(): Value {
    const tok = take();
    if (!tok) throw new Error(`Formel „${formula}“ ist unvollständig`);
    if (tok.t === "num") return tok.v;
    if (tok.t === "str") return tok.v;
    if (tok.t === "ref") {
      if (tok.v.includes(":")) throw new Error(`Formel „${formula}“: Bereich nur in Funktionen erlaubt`);
      return values(tok.v)[0];
    }
    if (tok.t === "name") {
      if (tok.v === "TRUE") return true;
      if (tok.v === "FALSE") return false;
      return call(tok.v);
    }
    if (tok.v === "(") {
      const v = comparison();
      take(")");
      return v;
    }
    if (tok.v === "-") return -num(primary());
    if (tok.v === "+") return num(primary());
    throw new Error(`Formel „${formula}“: unerwartetes „${tok.v}“`);
  }
  function power(): Value {
    let left = primary();
    while (isOp("^")) {
      take();
      left = num(left) ** num(primary());
    }
    return left;
  }
  function term(): Value {
    let left = power();
    while (isOp("*") || isOp("/")) {
      const op = take()!.v;
      const right = num(power());
      left = op === "*" ? num(left) * right : right === 0 ? 0 : num(left) / right;
    }
    return left;
  }
  function sum(): Value {
    let left = term();
    while (isOp("+") || isOp("-") || isOp("&")) {
      const op = take()!.v;
      const right = term();
      left = op === "&" ? `${left ?? ""}${right ?? ""}` : op === "+" ? num(left) + num(right) : num(left) - num(right);
    }
    return left;
  }
  function comparison(): Value {
    const left = sum();
    const tok = peek();
    if (tok?.t === "op" && ["<", ">", "<=", ">=", "=", "<>"].includes(tok.v)) {
      take();
      const right = sum();
      const [a, b] = typeof left === "string" || typeof right === "string" ? [String(left), String(right)] : [num(left), num(right)];
      switch (tok.v) {
        case "<":
          return a < b;
        case ">":
          return a > b;
        case "<=":
          return a <= b;
        case ">=":
          return a >= b;
        case "=":
          return a === b;
        default:
          return a !== b;
      }
    }
    return left;
  }

  const result = comparison();
  if (pos < tokens.length) throw new Error(`Formel „${formula}“: unerwartetes Ende`);
  return result;
}

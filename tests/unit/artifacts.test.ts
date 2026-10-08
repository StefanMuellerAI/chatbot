import { describe, expect, it } from "vitest";
import { collectArtifacts, fileNameFor, hardenHtml, parseSegments } from "@/lib/client/artifacts";

describe("Artefakt-Parser", () => {
  it("erkennt vollständige Artefakte zwischen Text", () => {
    const segs = parseSegments('Vorher\n<artifact id="seite" type="html" title="Seite">\n<h1>Hi</h1>\n</artifact>\nNachher');
    expect(segs.map((s) => s.kind)).toEqual(["text", "artifact", "text"]);
    const a = segs[1].kind === "artifact" ? segs[1].artifact : null;
    expect(a).toMatchObject({ id: "seite", type: "html", title: "Seite", content: "<h1>Hi</h1>", complete: true });
  });

  it("erkennt unvollständige Artefakte während des Streamings", () => {
    const segs = parseSegments('Text <artifact id="d" type="mermaid" title="D">\nflowchart LR\n  A --> B');
    const a = segs[1].kind === "artifact" ? segs[1].artifact : null;
    expect(a?.complete).toBe(false);
    expect(a?.content).toContain("A --> B");
  });

  it("blendet ein halb gestreamtes öffnendes Tag aus", () => {
    const segs = parseSegments("Hier kommt <artif");
    expect(segs).toEqual([{ kind: "text", text: "Hier kommt " }]);
  });

  it("entfernt Codeblock-Zäune im Inhalt", () => {
    const segs = parseSegments('<artifact id="c" type="code" language="python" title="C">\n```python\nprint(1)\n```\n</artifact>');
    expect(segs[0].kind === "artifact" && segs[0].artifact.content).toBe("print(1)");
  });

  it("zählt Versionen über Nachrichten hinweg", () => {
    const map = collectArtifacts([
      { id: "1", role: "assistant", text: '<artifact id="x" type="html" title="X">a</artifact>' },
      { id: "2", role: "user", text: '<artifact id="x" type="html" title="X">b</artifact>' },
      { id: "3", role: "assistant", text: '<artifact id="x" type="html" title="X">c</artifact>' },
    ]);
    expect(map.get("x")?.map((v) => [v.version, v.content])).toEqual([[1, "a"], [2, "c"]]);
  });

  it("bettet eine CSP in HTML ein und benennt Downloads sinnvoll", () => {
    expect(hardenHtml("<html><head><title>t</title></head><body></body></html>")).toContain("Content-Security-Policy");
    expect(hardenHtml("<p>nur ein Fragment</p>")).toMatch(/^<!doctype html>/);
    expect(fileNameFor({ id: "Mein Chart", type: "code", language: "python", title: "", content: "", complete: true })).toBe("mein-chart.py");
  });
});

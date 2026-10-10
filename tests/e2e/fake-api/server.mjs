// Nachbildung der Anthropic- und OpenAI-API für die Adapter-Tests (Projekte provider*).
// Freebie spricht im Fake-Modus über ANTHROPIC_BASE_URL/OPENAI_BASE_URL mit diesem Server.
//
// Verhalten pro Anfrage über Schlüsselwörter in der letzten Nutzer-Nachricht:
//   #fake:websuche  #fake:bild  #fake:pause  #fake:maxtokens  #fake:ablehnung
//   #fake:ersatzmodell  #fake:fehler:NNN  #fake:abbruch  #fake:langsam
//   #fake:postfach (Liste → Lesen → Antwort)  #fake:senden:<name> (Senden → Antwort)
// Jede Anfrage wird mitgeschrieben: GET /__requests?contains=<Text> liefert alle Anfragen,
// deren Inhalt den Text enthält (so bleiben parallel laufende Tests getrennt).
import { createServer } from "node:http";
import { FAKE_USAGE as USAGE } from "../support/servers.mjs";

const port = Number(process.argv[2] ?? 3300);
const KEYS = { anthropic: "fake-anthropic-key", openai: "fake-openai-key" };
// 1×1 PNG (orange) als Ergebnis der Bild-API.
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==";

/** @type {{ at: number; provider: string; method: string; path: string; headers: Record<string, string>; body: unknown; raw: string }[]} */
const recorded = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/** Einfaches Auslesen von multipart/form-data (Felder als Text, Dateien mit Name, Typ und Größe). */
function parseMultipart(buf, contentType) {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType ?? "");
  if (!boundary) return {};
  const marker = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
  const out = {};
  let start = buf.indexOf(marker);
  while (start !== -1) {
    const next = buf.indexOf(marker, start + marker.length);
    if (next === -1) break;
    const part = buf.subarray(start + marker.length + 2, next - 2);
    const headerEnd = part.indexOf("\r\n\r\n");
    const head = part.subarray(0, headerEnd).toString("utf8");
    const content = part.subarray(headerEnd + 4);
    const name = /name="([^"]+)"/.exec(head)?.[1];
    const filename = /filename="([^"]*)"/.exec(head)?.[1];
    if (name) {
      const value = filename !== undefined
        ? { filename, type: /content-type:\s*([^\r\n]+)/i.exec(head)?.[1] ?? "", size: content.length }
        : content.toString("utf8");
      if (out[name] === undefined) out[name] = value;
      else out[name] = [].concat(out[name], value);
    }
    start = next;
  }
  return out;
}

function json(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

function sse(res) {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/** Letzter Nutzertext im Verlauf (Tool-Ergebnisse zählen nicht als neue Frage). */
function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    if (typeof m.content === "string") return m.content;
    if (!Array.isArray(m.content)) continue;
    const texts = m.content.filter((b) => b.type === "text" || b.type === "input_text").map((b) => b.text);
    if (texts.length) return texts.join("\n");
  }
  return "";
}

function scenario(text) {
  const has = (name) => new RegExp(`#fake:${name}(?=\\s|$|:)`).test(text);
  const status = /#fake:fehler:(\d{3})/.exec(text)?.[1];
  return {
    web: has("websuche"),
    image: has("bild"),
    pause: has("pause"),
    maxTokens: has("maxtokens"),
    refusal: has("ablehnung"),
    fallback: has("ersatzmodell"),
    abort: has("abbruch"),
    slow: has("langsam"),
    status: status ? Number(status) : null,
    mailbox: has("postfach"),
    sendTo: /#fake:senden:(\S+)/.exec(text)?.[1] ?? null,
  };
}

/**
 * Nächster Schritt im Posteingang-Szenario – wie ein echtes Modell: erst Liste, dann die erste Mail
 * lesen und den Betreff nennen; beim Senden das Ergebnis des Werkzeugs wiedergeben.
 * `exchange` ist der letzte Werkzeug-Aufruf samt Ergebnis (oder null am Anfang).
 */
function mailboxStep(s, exchange) {
  if (!exchange) {
    if (s.sendTo) return { tool: "mailbox_send", input: { to: [s.sendTo], cc: [], subject: "Fake-Antwort", body: "Hallo von der Fake-API.", in_reply_to: "" } };
    return { tool: "mailbox_list", input: { folder: "inbox", unread_only: false, query: "", limit: 10 } };
  }
  if (exchange.isError) return { text: `Werkzeug-Fehler: ${exchange.content}` };
  if (exchange.name === "mailbox_list") {
    const id = /<email id="([^"]+)"/.exec(exchange.content)?.[1];
    return id ? { tool: "mailbox_read", input: { ids: [id] } } : { text: "Der Posteingang ist leer." };
  }
  if (exchange.name === "mailbox_read") return { text: `Im Posteingang liegt: „${/Betreff: (.+)/.exec(exchange.content)?.[1] ?? "?"}“.` };
  return { text: `Gesendet laut Werkzeug: ${exchange.content}` };
}

/** Anthropic: letzter tool_use und sein tool_result. */
function anthropicExchange(messages) {
  const last = messages.at(-1);
  const result = Array.isArray(last?.content) ? last.content.find((b) => b.type === "tool_result") : null;
  if (!result) return null;
  const use = (Array.isArray(messages.at(-2)?.content) ? messages.at(-2).content : []).filter((b) => b.type === "tool_use").at(-1);
  const content = typeof result.content === "string" ? result.content : (result.content ?? []).map((c) => c.text ?? "").join("");
  return { name: use?.name, content, isError: Boolean(result.is_error) };
}

/** OpenAI: letzter function_call und sein Ergebnis. */
function openaiExchange(input) {
  const last = input.at(-1);
  if (last?.type !== "function_call_output") return null;
  const call = input.find((i) => i.type === "function_call" && i.call_id === last.call_id);
  return { name: call?.name, content: last.output, isError: String(last.output).startsWith("Fehler:") };
}

/** Bild-Prompt mit der Frage darin, damit Tests die Anfrage an die Bild-API wiederfinden. */
const imagePrompt = (text) => `A small orange test square for: ${text.slice(0, 200)}`;

const ERROR_TYPES = {
  400: ["invalid_request_error", "Bad request from fake"],
  401: ["authentication_error", "invalid x-api-key"],
  403: ["permission_error", "forbidden"],
  404: ["not_found_error", "model not found"],
  413: ["request_too_large", "Request exceeds the maximum allowed number of bytes."],
  429: ["rate_limit_error", "Number of request tokens has exceeded your rate limit."],
  500: ["api_error", "Internal server error"],
  529: ["overloaded_error", "Overloaded"],
};

function sendError(res, provider, status) {
  const [type, message] = ERROR_TYPES[status] ?? ["api_error", `Fehler ${status}`];
  // Keine Wiederholungen durch das SDK: Tests sollen schnell und eindeutig sein.
  const headers = { "x-should-retry": "false" };
  if (provider === "anthropic") return json(res, status, { type: "error", error: { type, message } }, headers);
  return json(res, status, { error: { message, type, code: type, param: null } }, headers);
}

// ---------------------------------------------------------------- Anthropic

async function anthropicMessages(req, res, body) {
  const messages = body.messages ?? [];
  const text = lastUserText(messages);
  const s = scenario(text);
  if (s.status) return sendError(res, "anthropic", s.status);
  const last = messages.at(-1);
  const continuing = last?.role === "assistant"; // Fortsetzung nach pause_turn
  const afterTool = last?.role === "user" && Array.isArray(last.content) && last.content.some((b) => b.type === "tool_result");
  const model = body.model;

  /** @type {{ block: object; deltas?: object[] }[]} */
  const blocks = [];
  let stop = "end_turn";
  let webSearches = 0;
  let servedBy = model;

  if (s.fallback && !continuing && !afterTool) {
    servedBy = "claude-ersatz-1";
    blocks.push({ block: { type: "fallback", from: { model }, to: { model: servedBy }, reason: "refusal" } });
  }
  if (body.thinking && !continuing && !afterTool) {
    blocks.push({
      block: { type: "thinking", thinking: "", signature: "" },
      deltas: [
        { type: "thinking_delta", thinking: "Ich denke kurz nach " },
        { type: "thinking_delta", thinking: "(Fake-Gedankengang)." },
        { type: "signature_delta", signature: "fake-signatur" },
      ],
    });
  }

  if (s.refusal) {
    blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: "Dabei kann ich nicht helfen." }] });
    stop = "refusal";
  } else if (s.mailbox || s.sendTo) {
    const step = mailboxStep(s, afterTool ? anthropicExchange(messages) : null);
    if (step.tool) {
      blocks.push({
        block: { type: "tool_use", id: `toolu_fake_${Date.now()}`, name: step.tool, input: {} },
        deltas: [{ type: "input_json_delta", partial_json: JSON.stringify(step.input) }],
      });
      stop = "tool_use";
    } else {
      blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: step.text }] });
    }
  } else if (s.image && !afterTool) {
    const input = { prompt: imagePrompt(text), size: "1024x1024", quality: "low", reference_image_ids: [] };
    blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: "Ich erzeuge das Bild." }] });
    blocks.push({
      block: { type: "tool_use", id: `toolu_fake_${Date.now()}`, name: "generate_image", input: {} },
      deltas: [{ type: "input_json_delta", partial_json: JSON.stringify(input) }],
    });
    stop = "tool_use";
  } else if (s.image && afterTool) {
    blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: "Hier ist dein Fake-Bild." }] });
  } else if (s.pause && !continuing) {
    blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: "Erster Teil vor der Pause." }] });
    stop = "pause_turn";
  } else if (s.pause && continuing) {
    blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: "Zweiter Teil nach der Pause." }] });
  } else if (s.web) {
    const id = `srvtoolu_fake_${Date.now()}`;
    blocks.push({ block: { type: "server_tool_use", id, name: "web_search", input: { query: "Freebie Test" } } });
    blocks.push({
      block: {
        type: "web_search_tool_result",
        tool_use_id: id,
        content: [
          { type: "web_search_result", url: "https://example.org/eins", title: "Quelle eins", encrypted_content: "x", page_age: null },
          { type: "web_search_result", url: "https://example.org/zwei", title: "Quelle zwei", encrypted_content: "y", page_age: null },
        ],
      },
    });
    blocks.push({
      block: { type: "text", text: "", citations: [] },
      deltas: [
        { type: "citations_delta", citation: { type: "web_search_result_location", url: "https://example.org/drei", title: "Quelle drei", cited_text: "…", encrypted_index: "z" } },
        { type: "text_delta", text: "Laut Websuche gibt es drei Quellen." },
      ],
    });
    webSearches = 1;
  } else if (s.maxTokens) {
    blocks.push({ block: { type: "text", text: "" }, deltas: [{ type: "text_delta", text: "Diese Antwort ist zu lang und endet mitten im" }] });
    stop = "max_tokens";
  } else {
    blocks.push({
      block: { type: "text", text: "" },
      deltas: [
        { type: "text_delta", text: `Fake-Antwort von ${model}` },
        { type: "text_delta", text: continuing ? " (fortgesetzt)." : "." },
      ],
    });
  }

  const usage = {
    input_tokens: USAGE.input,
    output_tokens: USAGE.output,
    cache_read_input_tokens: USAGE.cacheRead,
    cache_creation_input_tokens: USAGE.cacheWrite,
    server_tool_use: { web_search_requests: webSearches, web_fetch_requests: 0 },
  };
  const id = `msg_fake_${Date.now()}`;

  if (!body.stream) {
    const content = blocks.map(({ block, deltas }) => {
      const b = { ...block };
      for (const d of deltas ?? []) {
        if (d.type === "text_delta") b.text += d.text;
        if (d.type === "thinking_delta") b.thinking += d.thinking;
        if (d.type === "input_json_delta") b.input = JSON.parse(d.partial_json);
      }
      return b;
    });
    // Titel-Anfragen bekommen einen erkennbaren Titel.
    const prompt = typeof messages[0]?.content === "string" ? messages[0].content : "";
    if (/Titel/i.test(prompt)) {
      for (const b of content) if (b.type === "text") b.text = "Fake-Titel";
    } else if (/Antworte nur mit: OK/.test(prompt)) {
      for (const b of content) if (b.type === "text") b.text = "OK";
    }
    return json(res, 200, { id, type: "message", role: "assistant", model: servedBy, content, stop_reason: stop, stop_sequence: null, usage });
  }

  const send = sse(res);
  send("message_start", {
    type: "message_start",
    message: { id, type: "message", role: "assistant", model, content: [], stop_reason: null, stop_sequence: null, usage: { ...usage, output_tokens: 1 } },
  });
  for (const [index, { block, deltas }] of blocks.entries()) {
    send("content_block_start", { type: "content_block_start", index, content_block: block });
    for (const delta of deltas ?? []) {
      if (s.slow) await sleep(400);
      send("content_block_delta", { type: "content_block_delta", index, delta });
      if (s.abort && delta.type === "text_delta") {
        await sleep(50);
        res.socket?.destroy();
        return;
      }
    }
    send("content_block_stop", { type: "content_block_stop", index });
  }
  send("message_delta", { type: "message_delta", delta: { stop_reason: stop, stop_sequence: null }, usage });
  send("message_stop", { type: "message_stop" });
  res.end();
}

// ---------------------------------------------------------------- OpenAI

function openaiResponse(body, output, usage, status = "completed", incomplete = null) {
  return {
    id: `resp_fake_${Date.now()}`,
    object: "response",
    created_at: Math.floor(Date.now() / 1000),
    status,
    error: null,
    incomplete_details: incomplete,
    model: body.model,
    output,
    usage,
  };
}

async function openaiResponses(req, res, body) {
  const input = typeof body.input === "string" ? [{ role: "user", content: body.input }] : (body.input ?? []);
  const text = lastUserText(input);
  const s = scenario(text);
  if (s.status) return sendError(res, "openai", s.status);
  const last = input.at(-1);
  const afterTool = last?.type === "function_call_output";
  const usage = {
    input_tokens: USAGE.input + USAGE.cacheRead + USAGE.cacheWrite,
    input_tokens_details: { cached_tokens: USAGE.cacheRead, cache_write_tokens: USAGE.cacheWrite },
    output_tokens: USAGE.output,
    output_tokens_details: { reasoning_tokens: 0 },
    total_tokens: USAGE.input + USAGE.cacheRead + USAGE.cacheWrite + USAGE.output,
  };

  /** Ausgabe-Elemente samt Ereignissen, die vor ihrem Abschluss gestreamt werden. */
  const items = [];
  let refusal = "";
  let status = "completed";
  let incomplete = null;
  const message = (t, annotations = []) => ({
    id: `msg_fake_${items.length}`,
    type: "message",
    role: "assistant",
    status: "completed",
    content: [{ type: "output_text", text: t, annotations }],
  });

  if (body.reasoning && !afterTool) {
    items.push({
      id: "rs_fake",
      type: "reasoning",
      summary: [{ type: "summary_text", text: "Ich denke kurz nach (Fake-Gedankengang)." }],
      encrypted_content: "fake-verschluesselt",
    });
  }
  if (s.refusal) {
    refusal = "Dabei kann ich nicht helfen.";
  } else if (s.mailbox || s.sendTo) {
    const step = mailboxStep(s, afterTool ? openaiExchange(input) : null);
    if (step.tool) {
      items.push({ id: `fc_fake_${items.length}`, type: "function_call", call_id: `call_fake_${Date.now()}`, name: step.tool, arguments: JSON.stringify(step.input), status: "completed" });
    } else {
      items.push(message(step.text));
    }
  } else if (s.image && !afterTool) {
    items.push({
      id: "fc_fake",
      type: "function_call",
      call_id: `call_fake_${Date.now()}`,
      name: "generate_image",
      arguments: JSON.stringify({ prompt: imagePrompt(text), size: "1024x1024", quality: "low", reference_image_ids: [] }),
      status: "completed",
    });
  } else if (s.image && afterTool) {
    items.push(message("Hier ist dein Fake-Bild."));
  } else if (s.web) {
    items.push({ id: "ws_fake", type: "web_search_call", status: "completed", action: { type: "search", query: "Freebie Test" } });
    items.push(
      message("Laut Websuche gibt es zwei Quellen.", [
        { type: "url_citation", url: "https://example.org/eins", title: "Quelle eins", start_index: 0, end_index: 5 },
        { type: "url_citation", url: "https://example.org/zwei", title: "Quelle zwei", start_index: 6, end_index: 10 },
      ]),
    );
  } else if (s.maxTokens) {
    items.push(message("Diese Antwort ist zu lang und endet mitten im"));
    status = "incomplete";
    incomplete = { reason: "max_output_tokens" };
  } else {
    const prompt = typeof body.input === "string" ? body.input : "";
    const answer = /Titel/i.test(prompt) ? "Fake-Titel" : /Antworte nur mit: OK/.test(prompt) ? "OK" : `Fake-Antwort von ${body.model}.`;
    items.push(message(answer));
  }

  if (!body.stream) {
    return json(res, 200, openaiResponse(body, items, usage, status, incomplete));
  }

  const send = sse(res);
  let seq = 0;
  const emit = (type, data) => send(type, { type, sequence_number: seq++, ...data });
  emit("response.created", { response: { ...openaiResponse(body, [], null, "in_progress"), usage: null } });
  for (const [index, item] of items.entries()) {
    if (s.slow) await sleep(400);
    if (item.type === "reasoning") {
      emit("response.output_item.added", { output_index: index, item: { ...item, summary: [] } });
      emit("response.reasoning_summary_part.added", { item_id: item.id, output_index: index, summary_index: 0, part: { type: "summary_text", text: "" } });
      emit("response.reasoning_summary_text.delta", { item_id: item.id, output_index: index, summary_index: 0, delta: item.summary[0].text });
    } else if (item.type === "message") {
      emit("response.output_item.added", { output_index: index, item: { ...item, content: [], status: "in_progress" } });
      const part = item.content[0];
      const half = Math.ceil(part.text.length / 2);
      for (const delta of [part.text.slice(0, half), part.text.slice(half)]) {
        emit("response.output_text.delta", { item_id: item.id, output_index: index, content_index: 0, delta, logprobs: [] });
        if (s.abort) {
          await sleep(50);
          res.socket?.destroy();
          return;
        }
      }
      for (const [annotation_index, annotation] of part.annotations.entries()) {
        emit("response.output_text.annotation.added", { item_id: item.id, output_index: index, content_index: 0, annotation_index, annotation });
      }
    } else if (item.type === "web_search_call") {
      emit("response.output_item.added", { output_index: index, item: { ...item, status: "in_progress" } });
      emit("response.web_search_call.in_progress", { item_id: item.id, output_index: index });
      emit("response.web_search_call.searching", { item_id: item.id, output_index: index });
      emit("response.web_search_call.completed", { item_id: item.id, output_index: index });
    } else {
      emit("response.output_item.added", { output_index: index, item });
    }
    emit("response.output_item.done", { output_index: index, item });
  }
  if (refusal) emit("response.refusal.delta", { item_id: "msg_refusal", output_index: items.length, content_index: 0, delta: refusal });
  const final = openaiResponse(body, items, usage, status, incomplete);
  emit(status === "incomplete" ? "response.incomplete" : "response.completed", { response: final });
  res.end();
}

// ---------------------------------------------------------------- Server

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const path = url.pathname;
  try {
    if (path === "/__health") return json(res, 200, { ok: true });
    if (path === "/__requests") {
      const contains = url.searchParams.get("contains") ?? "";
      const since = Number(url.searchParams.get("since") ?? 0);
      return json(res, 200, recorded.filter((r) => r.at >= since && r.raw.includes(contains)).map((r) => ({ ...r, raw: undefined })));
    }

    const provider = path.startsWith("/v1/messages") || req.headers["anthropic-version"] ? "anthropic" : "openai";
    const buf = await readBody(req);
    const type = req.headers["content-type"] ?? "";
    const body = type.includes("application/json") && buf.length ? JSON.parse(buf.toString("utf8")) : type.includes("multipart/form-data") ? parseMultipart(buf, type) : {};
    recorded.push({
      at: Date.now(),
      provider,
      method: req.method ?? "GET",
      path: url.pathname + url.search,
      headers: { "anthropic-beta": String(req.headers["anthropic-beta"] ?? ""), "content-type": type.split(";")[0] },
      body,
      raw: JSON.stringify(body),
    });
    if (recorded.length > 5000) recorded.splice(0, 1000);

    const key = provider === "anthropic" ? req.headers["x-api-key"] : String(req.headers.authorization ?? "").replace(/^Bearer /, "");
    if (key !== KEYS[provider]) return sendError(res, provider, 401);

    if (req.method === "POST" && path === "/v1/messages") return await anthropicMessages(req, res, body);
    if (req.method === "GET" && path === "/v1/models" && provider === "anthropic") {
      return json(res, 200, {
        data: [
          { type: "model", id: "claude-fake-1", display_name: "Claude Fake 1", created_at: "2026-09-01T00:00:00Z" },
          { type: "model", id: "claude-fake-2", display_name: "Claude Fake 2", created_at: "2026-09-02T00:00:00Z" },
          { type: "model", id: "claude-sonnet-5-5", display_name: "Claude Sonnet 5.5", created_at: "2026-08-01T00:00:00Z" },
        ],
        has_more: false,
        first_id: "claude-fake-1",
        last_id: "claude-sonnet-5-5",
      });
    }
    if (req.method === "POST" && path === "/v1/responses") return await openaiResponses(req, res, body);
    if (req.method === "GET" && path === "/v1/models") {
      return json(res, 200, {
        object: "list",
        data: [
          { id: "gpt-fake-b", object: "model", created: 1, owned_by: "fake" },
          { id: "gpt-fake-a", object: "model", created: 1, owned_by: "fake" },
        ],
      });
    }
    if (req.method === "POST" && path === "/v1/audio/transcriptions") {
      const size = body.file?.size ?? 0;
      return json(res, 200, { text: `Fake-Transkript (${body.model}, ${body.file?.filename}, ${size} Bytes).`, usage: { type: "duration", seconds: 10 } });
    }
    if (req.method === "POST" && (path === "/v1/images/generations" || path === "/v1/images/edits")) {
      const prompt = body.prompt ?? "";
      if (/#fake:bildfehler/.test(prompt)) return sendError(res, "openai", 400);
      return json(res, 200, { created: Math.floor(Date.now() / 1000), data: [{ b64_json: PNG }], usage: { input_tokens: 10, output_tokens: 100, total_tokens: 110 } });
    }
    return json(res, 404, { error: { message: `Unbekannter Pfad ${req.method} ${path}` } });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) json(res, 500, { error: { message: String(err) } });
    else res.end();
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Fake-API auf Port ${port}`));
const stop = () => server.close(() => process.exit(0));
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

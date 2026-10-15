import { requireAdmin } from "@/lib/auth/session";
import { fundusError } from "@/lib/fundus/api";
import { fundusRevision, listCategories, listHidden, listOwnItems, listPrompts } from "@/lib/fundus/store";
import { getCatalog } from "@/lib/library/catalog";
import { getSettings } from "@/lib/settings";

/** Alles für den Admin-Reiter „Fundus“: eigene und mitgelieferte Einträge, Kategorien, Prompts (auch inaktive). */
export async function GET() {
  try {
    await requireAdmin();
    const [builtIn, hiddenIds, own, categories, prompts, revision, settings] = await Promise.all([
      getCatalog(),
      listHidden(),
      listOwnItems(),
      listCategories(),
      listPrompts({ includeDisabled: true }),
      fundusRevision(),
      getSettings(),
    ]);
    const hidden = new Set(hiddenIds);
    const orgName = new Map(builtIn.orgs.map((o) => [o.id, o.short]));
    const ownThreads = own.items.filter((i) => i.kind === "thread");
    const threadTitle = new Map(ownThreads.map((t) => [t.id, t.title]));
    const documents = [
      ...own.items
        .filter((i) => i.kind === "document")
        .map((d) => ({
          id: d.id,
          source: "eigen" as const,
          title: d.title,
          type: d.docType,
          org: "Eigene Inhalte",
          date: d.date,
          tokens: d.tokens,
          fileName: d.fileName,
          summary: d.summary,
          tags: d.tags,
          keywords: d.keywords,
          enabled: d.enabled,
          threadId: d.threadId,
          threadTitle: d.threadId ? (threadTitle.get(d.threadId) ?? null) : null,
          hidden: false,
        })),
      ...builtIn.documents.map((d) => ({
        id: d.id,
        source: "fundus" as const,
        title: d.title,
        type: d.type,
        org: orgName.get(d.orgId) ?? d.orgId,
        date: d.date,
        tokens: d.tokens,
        fileName: d.fileName,
        summary: d.summary,
        tags: d.tags,
        keywords: d.keywords,
        enabled: true,
        threadId: null,
        threadTitle: null,
        hidden: hidden.has(d.id),
      })),
    ];
    const threads = [
      ...ownThreads.map((t) => {
        const mails = own.mails.filter((m) => m.threadId === t.id);
        return {
          id: t.id,
          source: "eigen" as const,
          title: t.title,
          org: "Eigene Inhalte",
          date: t.date,
          mails: mails.length,
          attachments: own.items.filter((i) => i.threadId === t.id).length,
          summary: t.summary,
          tags: t.tags,
          keywords: t.keywords,
          enabled: t.enabled,
          hidden: false,
        };
      }),
      ...builtIn.threads.map((t) => ({
        id: t.id,
        source: "fundus" as const,
        title: t.title,
        org: orgName.get(t.orgId) ?? t.orgId,
        date: t.date,
        mails: t.mails.length,
        attachments: new Set(t.mails.flatMap((m) => m.attachments)).size,
        summary: t.summary,
        tags: t.tags,
        keywords: t.keywords,
        enabled: true,
        hidden: hidden.has(t.id),
      })),
    ];
    return Response.json({
      revision,
      libraryEnabled: settings.features.library,
      documents,
      threads,
      categories,
      prompts: prompts.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        title: p.title,
        description: p.description,
        text: p.text,
        placeholders: p.placeholders,
        enabled: p.enabled,
        sortOrder: p.sortOrder,
      })),
    });
  } catch (err) {
    return fundusError(err);
  }
}

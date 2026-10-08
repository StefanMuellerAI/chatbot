"use client";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./CodeBlock";

export const Markdown = memo(function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: "ignore" }]]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const content = String(children ?? "");
            const lang = /language-([\w#+-]+)/.exec(className ?? "")?.[1];
            if (lang || content.includes("\n")) {
              return <CodeBlock code={content.replace(/\n$/, "")} lang={lang} />;
            }
            return <code>{children}</code>;
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" && src.startsWith("/api/files/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="max-h-96 rounded-xl" />
            ) : (
              <a href={typeof src === "string" ? src : undefined} target="_blank" rel="noopener noreferrer">
                {alt || "Bild"}
              </a>
            ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
});

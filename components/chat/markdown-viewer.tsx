"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p className="mb-4 last:mb-0 leading-7 text-[15px]">{children}</p>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-semibold mt-6 mb-3 tracking-normal text-zinc-100">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mt-6 mb-3 tracking-normal text-zinc-100">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-[16px] font-semibold mt-5 mb-2 tracking-normal text-zinc-100">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-6 mb-4 space-y-1.5 marker:text-zinc-500">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-6 mb-4 space-y-1.5 marker:text-zinc-500">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-7 text-[15px] pl-1">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-zinc-700 pl-4 py-1 my-4 text-zinc-400 italic bg-zinc-900/30 rounded-r-lg">
              {children}
            </blockquote>
          );
        },
        strong({ children }) {
          return <strong className="font-semibold text-zinc-200">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic text-zinc-300">{children}</em>;
        },
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !className?.includes("language-");
          
          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-800/60 text-white font-mono text-[14.5px] border border-zinc-700/40 break-words"
                {...rest}
              >
                {children}
              </code>
            );
          }

          const language = match ? match[1] : "text";
          return (
            <CodeBlock language={language} code={String(children).replace(/\n$/, "")} />
          );
        },
        pre({ children }) {
          // pre acts as wrapper for block code, we handle the actual styling inside CodeBlock
          return <div className="not-prose my-5">{children}</div>;
        },
        a({ children, href }) {
          return (
            <a href={href} className="text-zinc-300 underline underline-offset-4 hover:text-zinc-100 transition-colors" target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-800/30 font-mono text-[14.5px] shadow-sm flex flex-col w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/70 border-b border-zinc-700/50 text-zinc-300 select-none">
        <span className="text-xs font-medium lowercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors py-1 px-2 rounded hover:bg-zinc-700/60"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-thin">
        <pre className="text-zinc-100 leading-relaxed whitespace-pre min-w-full">
          <code className="bg-transparent p-0 text-[14.5px] font-mono border-none text-zinc-100">{code}</code>
        </pre>
      </div>
    </div>
  );
}

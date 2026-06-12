"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  // Split content by code block markers (e.g. ```javascript\n...\n```)
  const parts = content.split(/(\`\`\`[a-zA-Z0-9_-]*\n[\s\S]*?\`\`\`)/g);

  return (
    <div className="space-y-1 text-zinc-300">
      {parts.map((part, index) => {
        const match = part.match(/^\`\`\`([a-zA-Z0-9_-]*)\n([\s\S]*?)\`\`\`$/);
        if (match) {
          const [, language, code] = match;
          return (
            <CodeBlock 
              key={index} 
              language={language || "code"} 
              code={code.trim()} 
            />
          );
        }

        return <TextSection key={index} text={part} />;
      })}
    </div>
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
    <div className="my-4 rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950/80 font-mono text-sm shadow-md">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-[11px] text-zinc-400 select-none">
        <span className="capitalize font-semibold tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors py-1 px-1.5 rounded-md hover:bg-zinc-800/60"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-thin">
        <pre className="text-zinc-200 leading-relaxed text-xs sm:text-sm whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function parseInlineStyles(text: string) {
  const tokens: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText) {
    const boldIndex = currentText.indexOf("**");
    const codeIndex = currentText.indexOf("`");

    if (boldIndex === -1 && codeIndex === -1) {
      tokens.push(<span key={keyIdx++}>{currentText}</span>);
      break;
    }

    if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
      // Bold tag is first
      if (boldIndex > 0) {
        tokens.push(<span key={keyIdx++}>{currentText.slice(0, boldIndex)}</span>);
      }
      const rest = currentText.slice(boldIndex + 2);
      const nextBoldIndex = rest.indexOf("**");
      if (nextBoldIndex !== -1) {
        const boldText = rest.slice(0, nextBoldIndex);
        tokens.push(
          <strong key={keyIdx++} className="font-semibold text-zinc-100">
            {boldText}
          </strong>
        );
        currentText = rest.slice(nextBoldIndex + 2);
      } else {
        tokens.push(<span key={keyIdx++}>**</span>);
        currentText = rest;
      }
    } else {
      // Inline code backtick is first
      if (codeIndex > 0) {
        tokens.push(<span key={keyIdx++}>{currentText.slice(0, codeIndex)}</span>);
      }
      const rest = currentText.slice(codeIndex + 1);
      const nextCodeIndex = rest.indexOf("`");
      if (nextCodeIndex !== -1) {
        const codeText = rest.slice(0, nextCodeIndex);
        tokens.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800/80 text-zinc-200 font-mono text-xs font-semibold">
            {codeText}
          </code>
        );
        currentText = rest.slice(nextCodeIndex + 1);
      } else {
        tokens.push(<span key={keyIdx++}>`</span>);
        currentText = rest;
      }
    }
  }

  return tokens;
}

function TextSection({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let keyIdx = 0;
  
  let currentListItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (listType === "ul") {
        elements.push(
          <ul key={keyIdx++} className="list-disc pl-5 my-2.5 space-y-1 text-zinc-300">
            {currentListItems}
          </ul>
        );
      } else if (listType === "ol") {
        elements.push(
          <ol key={keyIdx++} className="list-decimal pl-5 my-2.5 space-y-1 text-zinc-300">
            {currentListItems}
          </ol>
        );
      }
      currentListItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={keyIdx++} className="text-sm font-bold text-zinc-100 mt-4 mb-1.5">
          {parseInlineStyles(line.slice(4))}
        </h3>
      );
      continue;
    }
    
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={keyIdx++} className="text-base font-bold text-zinc-100 mt-5 mb-2 border-b border-zinc-800/40 pb-1">
          {parseInlineStyles(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={keyIdx++} className="text-lg font-extrabold text-zinc-100 mt-6 mb-3">
          {parseInlineStyles(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Check for bullet list items
    const isBullet = line.startsWith("- ") || line.startsWith("* ");
    if (isBullet) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      currentListItems.push(
        <li key={keyIdx++} className="leading-relaxed text-zinc-300">
          {parseInlineStyles(line.slice(2))}
        </li>
      );
      continue;
    }

    // Check for numbered list items
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      currentListItems.push(
        <li key={keyIdx++} className="leading-relaxed text-zinc-300">
          {parseInlineStyles(numMatch[2])}
        </li>
      );
      continue;
    }

    // Empty line flushes the active list
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Normal paragraph line
    flushList();
    elements.push(
      <p key={keyIdx++} className="leading-relaxed mb-3.5 text-zinc-300">
        {parseInlineStyles(line)}
      </p>
    );
  }

  // Flush any remaining active lists
  flushList();

  return <>{elements}</>;
}

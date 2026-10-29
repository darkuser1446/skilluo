"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Code2 } from "lucide-react";

interface FormattedPromptProps {
  prompt: string;
  className?: string;
}

interface ParsedPrompt {
  badge: string | null;
  textBefore: string;
  codeBlocks: { code: string; lang: string }[];
  textAfter: string;
}

function isCodeLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  // Line numbers like "1   #include" or "8   for (int i..."
  if (/^\d+\s+[#a-zA-Z{}]/.test(t)) return true;
  // Common C++ structural statements
  if (
    /^(#include|using\s+namespace|for\s*\(|while\s*\(|do\s*\{|switch\s*\(|case\s+|default:|cout\s*<<|cin\s*>>|if\s*\(|else|return\b)/.test(
      t
    )
  ) {
    return true;
  }
  // Type declarations like "int a = 7", "char c = 'A';", "double subtotal = 10000;"
  if (
    /\b(int|char|float|double|bool|void|long\s+long|long)\s+[a-zA-Z_][a-zA-Z0-9_]*(\s*\[\s*\])?\s*(=|;|,|\()/.test(
      t
    )
  ) {
    return true;
  }
  // Standalone braces or closing lines
  if (/^(\{|\}|\}\s*;)$/.test(t)) return true;
  return false;
}

/**
 * Parses a question prompt into structured parts:
 * 1. Badge / Section tag (e.g. "[Section A: Multiple Choice Questions - Q19]")
 * 2. Question text (e.g. "What is the output?")
 * 3. Structured code block(s) (e.g. C++ loops, functions, variables)
 * 4. Trailing instructions/notes (e.g. "(a) Identify the 5 bugs...", "(ASCII value of 'A' is 65)")
 */
export function parsePrompt(rawPrompt: string): ParsedPrompt {
  if (!rawPrompt) {
    return { badge: null, textBefore: "", codeBlocks: [], textAfter: "" };
  }

  let text = rawPrompt.trim();

  // 1. Extract optional leading Section Badge like "[Section A: Multiple Choice Questions - Q19]"
  let badge: string | null = null;
  const badgeMatch = text.match(/^\[(.*?)\]\s*/);
  if (badgeMatch) {
    badge = badgeMatch[1].trim();
    text = text.slice(badgeMatch[0].length).trim();
  }

  // 2. Check for explicit Markdown code blocks (```cpp ... ``` or ``` ... ```)
  const codeBlockRegex = /```([a-zA-Z0-9]*)\n?([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];

  if (matches.length > 0) {
    const firstMatch = matches[0];
    const matchIndex = firstMatch.index ?? 0;
    const textBefore = text.slice(0, matchIndex).trim();
    const code = firstMatch[2].trimEnd();
    const lang = firstMatch[1] || "cpp";
    const textAfter = text.slice(matchIndex + firstMatch[0].length).trim();

    return {
      badge,
      textBefore,
      codeBlocks: [{ code, lang }],
      textAfter,
    };
  }

  // 3. Heuristic detection of raw un-fenced C++ code
  const lines = text.split("\n");

  let firstCodeIdx = -1;
  let lastCodeIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCodeLine(line)) {
      if (firstCodeIdx === -1) firstCodeIdx = i;
      lastCodeIdx = i;
    } else if (firstCodeIdx !== -1) {
      const trimmed = line.trim();
      if (
        trimmed === "" ||
        trimmed.startsWith("}") ||
        trimmed.endsWith(";") ||
        trimmed.includes("=") ||
        trimmed.includes("+") ||
        trimmed.includes("-") ||
        trimmed.includes("*") ||
        trimmed.includes("%") ||
        trimmed.includes("cout") ||
        trimmed.includes("cin")
      ) {
        lastCodeIdx = i;
      } else {
        if (/^(\([a-zA-Z0-9]+\)|Total|Note|ASCII|Where|Instructions|Write)/i.test(trimmed)) {
          break;
        }
      }
    }
  }

  if (firstCodeIdx !== -1 && lastCodeIdx >= firstCodeIdx) {
    const beforeLines = lines.slice(0, firstCodeIdx);
    const codeLines = lines.slice(firstCodeIdx, lastCodeIdx + 1);
    const afterLines = lines.slice(lastCodeIdx + 1);

    return {
      badge,
      textBefore: beforeLines.join("\n").trim(),
      codeBlocks: [{ code: codeLines.join("\n").trimEnd(), lang: "cpp" }],
      textAfter: afterLines.join("\n").trim(),
    };
  }

  // 4. Inline C++ code detection (e.g. single-line questions where code immediately follows prompt)
  const inlineCodeMatch = text.match(
    /\b(for\s*\(|while\s*\(|do\s*\{|switch\s*\(|#include\b|int\s+[a-zA-Z_]\s*=|char\s+[a-zA-Z_]\s*=|cout\s*<<)/
  );
  if (inlineCodeMatch && inlineCodeMatch.index !== undefined && inlineCodeMatch.index > 0) {
    const textBefore = text.slice(0, inlineCodeMatch.index).trim();
    let codePart = text.slice(inlineCodeMatch.index).trim();

    // Check if code contains trailing text like (ASCII value...) or (a) Identify...
    let textAfter = "";
    const trailingMatch = codePart.match(
      /(\n|\s{2,})(\([a-zA-Z0-9]+\)|Total|Note|ASCII|Where|Instructions|Write|Constraint)[\s\S]*$/i
    );
    if (trailingMatch && trailingMatch.index !== undefined) {
      textAfter = codePart.slice(trailingMatch.index).trim();
      codePart = codePart.slice(0, trailingMatch.index).trim();
    }

    // Format single-line code if it has multiple braces/semicolons
    if (!codePart.includes("\n") && (codePart.includes(";") || codePart.includes("{"))) {
      codePart = codePart
        .replace(/\{\s*/g, "{\n    ")
        .replace(/;\s*(?!\})/g, ";\n    ")
        .replace(/\s*\}\s*/g, "\n}\n")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    }

    return {
      badge,
      textBefore,
      codeBlocks: [{ code: codePart, lang: "cpp" }],
      textAfter,
    };
  }

  return {
    badge,
    textBefore: text,
    codeBlocks: [],
    textAfter: "",
  };
}

export default function FormattedPrompt({ prompt, className = "" }: FormattedPromptProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { badge, textBefore, codeBlocks, textAfter } = parsePrompt(prompt);

  const handleCopy = (code: string, idx: number) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Optional Section Badge */}
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF0E5] text-[#F07C27] border-[2px] border-[#111111] font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#111111]">
          <Terminal className="w-3.5 h-3.5 text-[#F07C27]" />
          <span>{badge}</span>
        </div>
      )}

      {/* 2. Question Text (Before Code) */}
      {textBefore && (
        <div className="text-[15px] sm:text-base font-sans font-bold text-[#111111] leading-relaxed whitespace-pre-line">
          {textBefore}
        </div>
      )}

      {/* 3. Structured Code Block(s) */}
      {codeBlocks.map((block, idx) => {
        const codeLines = block.code.split("\n");
        // Check if code already contains line numbers (like Q21/Q22: "1   #include...")
        const hasBuiltInLineNumbers = codeLines.some((l) => /^\d+\s+[#a-zA-Z{}]/.test(l.trim()));

        return (
          <div
            key={idx}
            className="rounded-none border-[3px] border-[#111111] bg-[#0F172A] text-slate-100 shadow-[5px_5px_0px_#111111] overflow-hidden my-3 select-text"
          >
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#1E293B] border-b-[2px] border-[#111111]">
              <div className="flex items-center gap-2">
                {/* Mac-style terminal dots */}
                <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-[#7F1D1D] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-[#78350F] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#10B981] border border-[#064E3B] inline-block" />
                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-[#0F172A] border border-slate-700 font-mono text-[10px] font-black tracking-wider text-amber-400 uppercase">
                  <Code2 className="w-3 h-3 text-[#F07C27]" />
                  <span>{block.lang.toUpperCase() || "C++"}</span>
                </div>
              </div>

              {/* Copy Code button */}
              <button
                type="button"
                onClick={() => handleCopy(block.code, idx)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-bold bg-[#0F172A] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                title="Copy code snippet to clipboard"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body with Syntax Monospace Styling */}
            <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre">
                {codeLines.map((line, lineIdx) => (
                  <div key={lineIdx} className="table-row hover:bg-slate-800/40">
                    {!hasBuiltInLineNumbers && codeLines.length > 1 && (
                      <span className="table-cell select-none pr-4 text-right text-slate-500 font-mono text-xs w-8">
                        {lineIdx + 1}
                      </span>
                    )}
                    <span className="table-cell text-slate-100 font-mono font-medium">
                      {line || " "}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        );
      })}

      {/* 4. Trailing Text / Sub-questions (e.g. "(a) Identify...", "(ASCII value...)") */}
      {textAfter && (
        <div className="text-sm font-sans font-semibold text-[#111111] leading-relaxed whitespace-pre-line pt-1">
          {textAfter}
        </div>
      )}
    </div>
  );
}

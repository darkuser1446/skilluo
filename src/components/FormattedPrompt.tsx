"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Code2 } from "lucide-react";

interface FormattedPromptProps {
  prompt: string;
  className?: string;
}

export interface PromptSegment {
  type: "text" | "code";
  content?: string;
  code?: string;
  lang?: string;
}

export interface ParsedPrompt {
  badge: string | null;
  segments: PromptSegment[];
}

function isCodeLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^\d+\s+[#a-zA-Z{}]/.test(t)) return true;
  if (
    /^(#include|using\s+namespace|for\s*\(|while\s*\(|do\s*\{|switch\s*\(|case\s+|default:|cout\s*<<|cin\s*>>|if\s*\(|else|return\b)/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\b(int|char|float|double|bool|void|long\s+long|long)\s+[a-zA-Z_][a-zA-Z0-9_]*(\s*\[\s*\])?\s*(=|;|,|\()/.test(
      t
    )
  ) {
    return true;
  }
  if (/^(\{|\}|\}\s*;)$/.test(t)) return true;
  return false;
}

function formatSingleLineCode(code: string): string {
  let indentLevel = 0;
  let parenDepth = 0;
  let result = "";
  const tokens = code.trim();

  for (let i = 0; i < tokens.length; i++) {
    const ch = tokens[i];
    if (ch === "(") {
      parenDepth++;
      result += ch;
    } else if (ch === ")") {
      if (parenDepth > 0) parenDepth--;
      result += ch;
    } else if (ch === "{") {
      indentLevel++;
      result += " {\n" + "    ".repeat(indentLevel);
      while (i + 1 < tokens.length && tokens[i + 1] === " ") i++;
    } else if (ch === "}") {
      indentLevel = Math.max(0, indentLevel - 1);
      result += "\n" + "    ".repeat(indentLevel) + "}";
      while (i + 1 < tokens.length && tokens[i + 1] === " ") i++;
      if (i + 1 < tokens.length && tokens[i + 1] !== "}" && tokens[i + 1] !== ";") {
        result += "\n" + "    ".repeat(indentLevel);
      }
    } else if (ch === ";" && parenDepth === 0) {
      result += ";\n" + "    ".repeat(indentLevel);
      while (i + 1 < tokens.length && tokens[i + 1] === " ") i++;
    } else {
      result += ch;
    }
  }
  return result.replace(/\n\s*\n/g, "\n").trim();
}

function autoIndentCpp(lines: { lineNum: number; code: string }[]) {
  let indentLevel = 0;

  return lines.map((item) => {
    let text = item.code.trim();
    if (!text) {
      return { lineNum: item.lineNum, code: "" };
    }

    if (/^\}/.test(text)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indentedCode = "    ".repeat(indentLevel) + text;

    if (/\{$/.test(text) || /^\{$/.test(text)) {
      indentLevel++;
    }

    return {
      lineNum: item.lineNum,
      code: indentedCode,
    };
  });
}

function processCodeBlock(rawCode: string, lang?: string) {
  const rawLines = rawCode.split("\n");
  const isCpp = !lang || lang.toLowerCase().includes("c");

  if (!isCpp) {
    return rawLines.map((line, idx) => ({ lineNum: idx + 1, code: line }));
  }

  const hasLineNumbers = rawLines.some((l) => /^\s*\d+\s+[#a-zA-Z{}]/.test(l));

  const initial = rawLines.map((line, idx) => {
    if (hasLineNumbers) {
      const match = line.match(/^\s*(\d+)\s*(.*)$/);
      if (match) {
        return { lineNum: parseInt(match[1], 10), code: match[2] };
      }
      return { lineNum: idx + 1, code: line };
    }
    return { lineNum: idx + 1, code: line };
  });

  return autoIndentCpp(initial);
}

/**
 * Parses a question prompt into structured parts:
 * 1. Badge / Section tag (e.g. "[Section A: Multiple Choice Questions - Q19]")
 * 2. Sequential segments (interleaved text, code blocks, terminal outputs)
 */
export function parsePrompt(rawPrompt: string): ParsedPrompt {
  if (!rawPrompt) {
    return { badge: null, segments: [] };
  }

  let text = rawPrompt.trim();

  // 1. Extract optional leading Section Badge like "[Section A: Multiple Choice Questions - Q19]"
  let badge: string | null = null;
  const badgeMatch = text.match(/^\[(.*?)\]\s*/);
  if (badgeMatch) {
    badge = badgeMatch[1].trim();
    text = text.slice(badgeMatch[0].length).trim();
  }

  // 2. Check for explicit Markdown code blocks (```cpp ... ``` or ```text ... ``` or ``` ... ```)
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];

  if (matches.length > 0) {
    const segments: PromptSegment[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      const matchIndex = match.index ?? 0;
      if (matchIndex > lastIndex) {
        const textBefore = text.slice(lastIndex, matchIndex).trim();
        if (textBefore) {
          segments.push({ type: "text", content: textBefore });
        }
      }
      const lang = match[1] || "cpp";
      const code = match[2].trimEnd();
      segments.push({ type: "code", code, lang });
      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      const textAfter = text.slice(lastIndex).trim();
      if (textAfter) {
        segments.push({ type: "text", content: textAfter });
      }
    }

    return { badge, segments };
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

    const segments: PromptSegment[] = [];
    const textBefore = beforeLines.join("\n").trim();
    if (textBefore) segments.push({ type: "text", content: textBefore });

    segments.push({ type: "code", code: codeLines.join("\n").trimEnd(), lang: "cpp" });

    const textAfter = afterLines.join("\n").trim();
    if (textAfter) segments.push({ type: "text", content: textAfter });

    return { badge, segments };
  }

  // 4. Inline C++ code detection (e.g. single-line questions where code immediately follows prompt)
  const inlineCodeMatch = text.match(
    /\b(for\s*\(|while\s*\(|do\s*\{|switch\s*\(|#include\b|int\s+[a-zA-Z_]\s*=|char\s+[a-zA-Z_]\s*=|cout\s*<<)/
  );
  if (inlineCodeMatch && inlineCodeMatch.index !== undefined && inlineCodeMatch.index > 0) {
    const textBefore = text.slice(0, inlineCodeMatch.index).trim();
    let codePart = text.slice(inlineCodeMatch.index).trim();

    let textAfter = "";
    const trailingMatch = codePart.match(
      /(\n|\s{2,})(\([a-zA-Z0-9]+\)|Total|Note|ASCII|Where|Instructions|Write|Constraint)[\s\S]*$/i
    );
    if (trailingMatch && trailingMatch.index !== undefined) {
      textAfter = codePart.slice(trailingMatch.index).trim();
      codePart = codePart.slice(0, trailingMatch.index).trim();
    }

    if (!codePart.includes("\n") && (codePart.includes(";") || codePart.includes("{"))) {
      codePart = formatSingleLineCode(codePart);
    }

    const segments: PromptSegment[] = [];
    if (textBefore) segments.push({ type: "text", content: textBefore });
    segments.push({ type: "code", code: codePart, lang: "cpp" });
    if (textAfter) segments.push({ type: "text", content: textAfter });

    return { badge, segments };
  }

  return {
    badge,
    segments: [{ type: "text", content: text }],
  };
}

export default function FormattedPrompt({ prompt, className = "" }: FormattedPromptProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { badge, segments } = parsePrompt(prompt);

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
    <div className={`space-y-3.5 ${className}`}>
      {/* 1. Optional Section Badge */}
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF0E5] text-[#F07C27] border-[2px] border-[#111111] font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#111111]">
          <Terminal className="w-3.5 h-3.5 text-[#F07C27]" />
          <span>{badge}</span>
        </div>
      )}

      {/* 2. Structured Segments (Text & Code in natural sequential order) */}
      {segments.map((segment, idx) => {
        if (segment.type === "text" && segment.content) {
          return (
            <div
              key={idx}
              className="text-[15px] sm:text-base font-sans font-bold text-[#111111] leading-relaxed whitespace-pre-line select-text"
            >
              {segment.content}
            </div>
          );
        }

        if (segment.type === "code" && segment.code) {
          const isTextOutput = segment.lang === "text" || segment.lang === "output";
          const processedLines = processCodeBlock(segment.code, segment.lang);
          const showLineNumbers = !isTextOutput && processedLines.length > 1;

          return (
            <div
              key={idx}
              className="rounded-none border-[3px] border-[#111111] bg-[#0F172A] text-slate-100 shadow-[5px_5px_0px_#111111] overflow-hidden my-3.5 select-text"
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
                    <span>
                      {isTextOutput
                        ? "SAMPLE OUTPUT / FORMAT"
                        : segment.lang?.toUpperCase() || "C++"}
                    </span>
                  </div>
                </div>

                {/* Copy Code button */}
                <button
                  type="button"
                  onClick={() => handleCopy(segment.code || "", idx)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold bg-[#0F172A] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.5)]"
                  title="Copy snippet to clipboard"
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
              <div className="p-4 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed scrollbar-thin">
                <pre className="whitespace-pre">
                  {processedLines.map((lineItem, lineIdx) => (
                    <div key={lineIdx} className="table-row hover:bg-slate-800/40">
                      {showLineNumbers && (
                        <span className="table-cell select-none pr-4 text-right text-slate-500 font-mono text-xs w-9 border-r border-slate-800/80">
                          {lineItem.lineNum}
                        </span>
                      )}
                      <span
                        className={`table-cell font-mono font-medium ${
                          showLineNumbers ? "pl-4" : ""
                        } ${isTextOutput ? "text-emerald-400" : "text-slate-100"}`}
                      >
                        {lineItem.code || " "}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

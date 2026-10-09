"use client";

import React from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  actionIcon?: LucideIcon;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionIcon: ActionIcon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border-[3px] border-[#111111] p-8 sm:p-10 bg-white shadow-[6px_6px_0px_#111111] text-center flex flex-col items-center justify-center max-w-lg mx-auto my-4 ${className}`}
    >
      <div className="w-14 h-14 border-[2px] border-[#111111] bg-[#FFF0E5] shadow-[3px_3px_0px_#111111] flex items-center justify-center text-[#F07C27] mb-3.5">
        <Icon className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs text-slate-700 leading-relaxed max-w-sm mb-5 font-mono">
        {description}
      </p>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-[#111111] bg-[#F07C27] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#111111] shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionLabel}</span>
        </Link>
      )}

      {!actionHref && onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-[#111111] bg-[#F07C27] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#111111] shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

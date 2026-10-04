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
      className={`rounded-2xl p-8 sm:p-10 bg-[#0F172A]/60 border border-slate-800/80 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-4 shadow-inner ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-brand-orange mb-3.5 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="font-display font-bold text-white text-base tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-5 font-mono">
        {description}
      </p>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-brand-orange text-white hover:brightness-110 transition-all shadow-sm"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionLabel}</span>
        </Link>
      )}

      {!actionHref && onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-brand-orange text-white hover:brightness-110 transition-all shadow-sm"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

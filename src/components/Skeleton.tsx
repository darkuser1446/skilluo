"use client";

import React from "react";

/**
 * Base animated skeleton primitive with dark-slate styling and pulse shimmer.
 */
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/60 ${className}`}
      {...props}
    />
  );
}

/**
 * Metric card skeleton matching dark-slate dashboard overview tiles.
 */
export function SkeletonMetric({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 bg-slate-800/70" />
        <Skeleton className="h-5 w-5 rounded-md bg-slate-800/80" />
      </div>
      <Skeleton className="h-8 w-20 bg-slate-700/60" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-2 w-full rounded-full bg-slate-800/60" />
        <Skeleton className="h-3 w-36 bg-slate-800/50" />
      </div>
    </div>
  );
}

/**
 * Card skeleton with header, body content lines, and footer action placeholder.
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-5 w-5 rounded-md bg-slate-800/80" />
          <Skeleton className="h-4 w-36 bg-slate-800/70" />
        </div>
        <Skeleton className="h-4 w-16 rounded-md bg-slate-800/60" />
      </div>

      <div className="space-y-2.5 py-1">
        <Skeleton className="h-3.5 w-full bg-slate-800/60" />
        <Skeleton className="h-3.5 w-5/6 bg-slate-800/60" />
        <Skeleton className="h-3.5 w-3/4 bg-slate-800/50" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-24 rounded-full bg-slate-800/60" />
        <Skeleton className="h-7 w-20 rounded-lg bg-slate-800/70" />
      </div>
    </div>
  );
}

/**
 * Table row skeleton for tabular views (Candidate Pipeline, Roster, Attendance, Audit Log).
 */
export function SkeletonTableRow({
  columns = 5,
  className = "",
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <tr className={`border-b border-slate-800/60 ${className}`}>
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-3.5 px-4">
          <Skeleton
            className={`h-4 bg-slate-800/60 ${
              idx === 0 ? "w-8" : idx === 1 ? "w-32" : idx === 2 ? "w-24" : "w-16"
            }`}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * User / Mentor / Student profile skeleton with avatar circle, name block, and details pills.
 */
export function SkeletonProfile({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 bg-[#0F172A]/70 border border-slate-800/80 shadow-md flex items-start gap-4 ${className}`}
    >
      <Skeleton className="w-16 h-16 rounded-2xl bg-slate-800/80 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-40 bg-slate-800/70" />
          <Skeleton className="h-5 w-20 rounded-full bg-slate-800/60" />
        </div>
        <Skeleton className="h-3.5 w-48 bg-slate-800/50" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-24 rounded-lg bg-slate-800/60" />
          <Skeleton className="h-6 w-28 rounded-lg bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

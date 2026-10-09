"use client";

import React from "react";

/**
 * Base animated skeleton primitive with Neo-Brutalist right angles and paper tone.
 */
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-[#e8e8e8] border border-[#111111]/30 ${className}`}
      {...props}
    />
  );
}

/**
 * Metric card skeleton matching Neo-Brutalist dashboard overview tiles.
 */
export function SkeletonMetric({ className = "" }: { className?: string }) {
  return (
    <div
      className={`p-5 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 bg-[#d2c4ba]" />
        <Skeleton className="h-5 w-5 bg-[#d2c4ba]" />
      </div>
      <Skeleton className="h-8 w-20 bg-[#111111]/30" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-2 w-full bg-[#dec1b2]" />
        <Skeleton className="h-3 w-36 bg-[#e8e8e8]" />
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
      className={`p-6 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-5 w-5 bg-[#F07C27]/40" />
          <Skeleton className="h-4 w-36 bg-[#111111]/30" />
        </div>
        <Skeleton className="h-4 w-16 bg-[#e8e8e8]" />
      </div>

      <div className="space-y-2.5 py-1">
        <Skeleton className="h-3.5 w-full bg-[#f4f3f3]" />
        <Skeleton className="h-3.5 w-5/6 bg-[#f4f3f3]" />
        <Skeleton className="h-3.5 w-3/4 bg-[#f4f3f3]" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-24 bg-[#dec1b2]" />
        <Skeleton className="h-7 w-20 bg-[#111111]/40" />
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
    <tr className={`border-b-[2px] border-[#111111] ${className}`}>
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-3.5 px-4">
          <Skeleton
            className={`h-4 bg-[#f4f3f3] ${
              idx === 0 ? "w-8" : idx === 1 ? "w-32" : idx === 2 ? "w-24" : "w-16"
            }`}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * User / Mentor / Student profile skeleton with avatar square, name block, and details pills.
 */
export function SkeletonProfile({ className = "" }: { className?: string }) {
  return (
    <div
      className={`p-6 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] flex items-start gap-4 ${className}`}
    >
      <Skeleton className="w-16 h-16 border-[2px] border-[#111111] bg-[#f4f3f3] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-40 bg-[#111111]/40" />
          <Skeleton className="h-5 w-20 bg-[#F07C27]/40" />
        </div>
        <Skeleton className="h-3.5 w-48 bg-[#d2c4ba]" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-24 bg-[#f4f3f3]" />
          <Skeleton className="h-6 w-28 bg-[#f4f3f3]" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;


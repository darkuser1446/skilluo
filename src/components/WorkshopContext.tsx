"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface WorkshopOption {
  id: string;
  name: string;
  year: number;
  status: string;
  evaluationConfig?: Record<string, number> | null;
  [key: string]: unknown;
}

interface WorkshopContextValue {
  workshops: WorkshopOption[];
  /** The workshop currently scoped across the dashboard (single source of truth). */
  activeWorkshopId: string;
  setActiveWorkshopId: (id: string) => void;
  loadingWorkshops: boolean;
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

/**
 * Owns the workshop list + the currently-scoped workshop for every dashboard
 * page, so the header switcher and the per-page selectors stay in sync.
 * Also refetches when a new workshop is created/updated (via `refresh`).
 */
export function WorkshopProvider({ children }: { children: ReactNode }) {
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const [activeWorkshopId, setActiveWorkshopId] = useState("");
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workshops");
        if (!res.ok) return;
        const data = await res.json();
        const list: WorkshopOption[] = data?.data?.workshops || [];
        if (cancelled) return;
        setWorkshops(list);
        // Keep the existing selection if it still exists, else default to newest.
        setActiveWorkshopId((prev) =>
          prev && list.some((w) => w.id === prev) ? prev : list[0]?.id || ""
        );
      } catch {
        /* non-critical — pages fall back to their own defaults */
      } finally {
        if (!cancelled) setLoadingWorkshops(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WorkshopContext.Provider
      value={{ workshops, activeWorkshopId, setActiveWorkshopId, loadingWorkshops }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshopContext(): WorkshopContextValue {
  const ctx = useContext(WorkshopContext);
  if (!ctx) {
    throw new Error("useWorkshopContext must be used within a WorkshopProvider");
  }
  return ctx;
}

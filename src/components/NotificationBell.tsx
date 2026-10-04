"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  ASSIGNMENT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  REVIEW: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  DOUBT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ANNOUNCEMENT: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  ASSESSMENT: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  RESULT: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  ATTENDANCE: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  FEEDBACK: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  INFO: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.data?.notifications || []);
    } catch {
      /* non-critical */
    }
  };

  useEffect(() => {
    load();
    // Poll for new notifications every 60s
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = items.filter((n) => !n.isRead).length;

  const markRead = async (n: Notification) => {
    if (n.isRead) return;
    try {
      await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center shadow-md">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="font-display font-bold text-white text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-mono text-brand-orange hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-slate-500 font-mono">
                No notifications yet
              </p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markRead(n);
                  if (n.link) window.location.href = n.link;
                }}
                className={`w-full text-left px-4 py-3 border-b border-slate-800/70 hover:bg-slate-800/50 transition-colors ${
                  n.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {!n.isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${
                          TYPE_COLORS[n.type] || TYPE_COLORS.INFO
                        }`}
                      >
                        {n.type}
                      </span>
                      <span className="font-semibold text-xs text-white truncate">{n.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.body}</p>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {n.link && <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0 mt-1" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
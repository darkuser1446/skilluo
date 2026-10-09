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
  ASSIGNMENT: "bg-blue-100 text-blue-950 border-[#111111]",
  REVIEW: "bg-emerald-100 text-emerald-950 border-[#111111]",
  DOUBT: "bg-amber-100 text-amber-950 border-[#111111]",
  ANNOUNCEMENT: "bg-purple-100 text-purple-950 border-[#111111]",
  ASSESSMENT: "bg-sky-100 text-sky-950 border-[#111111]",
  RESULT: "bg-rose-100 text-rose-950 border-[#111111]",
  ATTENDANCE: "bg-[#F4F3F3] text-slate-900 border-[#111111]",
  FEEDBACK: "bg-pink-100 text-pink-950 border-[#111111]",
  INFO: "bg-[#FFF0E5] text-[#F07C27] border-[#111111]",
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
        className="relative p-2 bg-white hover:bg-[#FFF0E5] border-[2px] border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#F07C27] text-white text-[10px] font-mono font-black border border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#FFF0E5] border-b-[2px] border-[#111111]">
            <span className="font-mono font-black uppercase text-[#111111] text-xs tracking-wider">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[10px] font-mono font-black uppercase text-[#F07C27] hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-slate-500 font-mono font-bold">
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
                className={`w-full text-left px-4 py-3 border-b border-[#111111]/15 hover:bg-[#FFF0E5]/40 transition-colors ${
                  n.isRead ? "opacity-60 bg-[#F9F9F9]" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {!n.isRead && (
                    <span className="mt-1.5 w-2 h-2 bg-[#F07C27] border border-[#111111] flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 border text-[9px] font-mono font-black uppercase shadow-[1px_1px_0px_#111111] ${
                          TYPE_COLORS[n.type] || TYPE_COLORS.INFO
                        }`}
                      >
                        {n.type}
                      </span>
                      <span className="font-mono font-black text-xs text-[#111111] truncate">{n.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-mono mt-1 line-clamp-2">{n.body}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {n.link && <ExternalLink className="w-3.5 h-3.5 text-[#111111] flex-shrink-0 mt-1" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
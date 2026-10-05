"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, BellOff, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SerializedNotification } from "@/types";

export function NotificationList({
  initialNotifications,
}: {
  initialNotifications: SerializedNotification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    if (!res.ok) {
      toast.error("ทำเครื่องหมายอ่านแล้วไม่สำเร็จ");
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  }

  async function markAllRead() {
    const prev = notifications;
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
    if (!res.ok) {
      toast.error("ทำเครื่องหมายอ่านแล้วไม่สำเร็จ");
      setNotifications(prev);
    }
  }

  async function remove(id: string) {
    const prev = notifications;
    setNotifications((p) => p.filter((n) => n.id !== id));
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("ลบการแจ้งเตือนไม่สำเร็จ");
      setNotifications(prev);
    } else {
      toast.success("ลบการแจ้งเตือนแล้ว");
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
        <BellOff size={32} />
        <p className="text-sm">ยังไม่มีการแจ้งเตือน</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={markAllRead}
          className="self-end flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <CheckCheck size={14} />
          อ่านทั้งหมด ({unreadCount})
        </button>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-2 rounded-xl border p-3 ${
            n.isRead ? "bg-card border-border" : "bg-primary/5 border-primary/30"
          }`}
        >
          <Bell size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <Link
            href={n.orderId ? `/orders/${n.orderId}` : "#"}
            className="flex flex-col min-w-0 flex-1"
          >
            <span className="font-semibold text-sm text-foreground">{n.title}</span>
            <span className="text-xs text-muted-foreground">{n.message}</span>
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!n.isRead && (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="ทำเครื่องหมายว่าอ่านแล้ว"
                onClick={() => markRead(n.id)}
              >
                <Check size={14} />
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="ลบการแจ้งเตือน"
              onClick={() => remove(n.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

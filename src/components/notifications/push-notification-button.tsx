"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type State =
  | "loading"
  | "unavailable" // push not configured on the server, or no service worker support
  | "ios-install" // iPhone/iPad in a browser tab: must be added to the home screen first
  | "denied"
  | "off"
  | "on";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function isIosBrowserTab() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  return ios && !standalone;
}

/**
 * Lets a customer get a phone/desktop notification when their food starts
 * cooking and when it's ready, even with SkipQ closed. `compact` is the
 * one-line banner used on the order tracker; it hides itself once enabled.
 */
export function PushNotificationButton({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>("loading");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setState(isIosBrowserTab() ? "ios-install" : "unavailable");
        return;
      }
      try {
        const { publicKey } = (await fetch("/api/push").then((r) => r.json())) as { publicKey: string | null };
        if (!publicKey) {
          if (!cancelled) setState("unavailable");
          return;
        }
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;
        setPublicKey(publicKey);
        setState(Notification.permission === "denied" ? "denied" : subscription ? "on" : "off");
      } catch {
        if (!cancelled) setState("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    if (!publicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error();
      setState("on");
      toast.success("เปิดแจ้งเตือนแล้ว — จะเด้งบอกเมื่อร้านเริ่มทำและเมื่ออาหารพร้อม");
    } catch {
      toast.error("เปิดแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("off");
      toast.success("ปิดแจ้งเตือนบนอุปกรณ์นี้แล้ว");
    } catch {
      toast.error("ปิดแจ้งเตือนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "unavailable") return null;
  if (compact && state === "on") return null;

  if (state === "ios-install") {
    return (
      <div className={cn("flex items-start gap-2 text-xs text-muted-foreground", compact ? "rounded-xl bg-muted px-4 py-3" : "")}>
        <Smartphone size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          อยากได้แจ้งเตือนเมื่ออาหารพร้อมบน iPhone? กดปุ่ม <b>แชร์</b> → <b>เพิ่มไปยังหน้าจอโฮม</b> แล้วเปิด SkipQ
          จากไอคอนนั้น
        </span>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className={cn("text-xs text-muted-foreground", compact && "rounded-xl bg-muted px-4 py-3")}>
        เบราว์เซอร์บล็อกการแจ้งเตือนของ SkipQ อยู่ — เปิดได้ที่การตั้งค่าเว็บไซต์ของเบราว์เซอร์
      </p>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <BellRing size={18} className="text-primary flex-shrink-0" />
        <span className="flex-1 text-sm text-foreground">ให้เด้งแจ้งเตือนเมื่ออาหารพร้อม แม้ปิดหน้านี้ไปแล้ว</span>
        <Button size="sm" disabled={busy} onClick={enable} className="rounded-full">
          เปิด
        </Button>
      </div>
    );
  }

  return state === "on" ? (
    <Button variant="outline" size="sm" disabled={busy} onClick={disable} className="gap-1.5">
      <BellOff size={14} /> ปิดแจ้งเตือนบนอุปกรณ์นี้
    </Button>
  ) : (
    <Button size="sm" disabled={busy} onClick={enable} className="gap-1.5">
      <BellRing size={14} /> เปิดแจ้งเตือนบนอุปกรณ์นี้
    </Button>
  );
}

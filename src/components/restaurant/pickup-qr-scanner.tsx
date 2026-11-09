"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The customer's pickup QR (see OrderTracker) encodes
 * `{"orderId": "...", "pickupCode": "123456"}`; a bare 6-digit code is
 * accepted too.
 */
function parsePickupCode(raw: string): string | null {
  const text = raw.trim();
  if (/^\d{6}$/.test(text)) return text;
  try {
    const data = JSON.parse(text) as { pickupCode?: unknown };
    if (typeof data.pickupCode === "string" && /^\d{6}$/.test(data.pickupCode)) return data.pickupCode;
  } catch {
    // not JSON — fall through
  }
  return null;
}

export function PickupQrScanner({ onScan, disabled }: { onScan: (pickupCode: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="h-11 gap-1.5"
      >
        <Camera size={16} />
        สแกน QR
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สแกน QR รับอาหาร</DialogTitle>
            <DialogDescription>ให้ลูกค้าเปิด QR ในหน้าติดตามออเดอร์ แล้วส่องกล้องไปที่ QR</DialogDescription>
          </DialogHeader>
          {open && (
            <ScannerView
              onScan={(code) => {
                setOpen(false);
                onScan(code);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScannerView({ onScan }: { onScan: (pickupCode: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(false);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function tick() {
      if (stopped) return;
      const video = videoRef.current;
      if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Downscale large camera frames — decoding is much faster and QR
        // codes held up to the camera are still easily readable.
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
        if (result?.data) {
          const code = parsePickupCode(result.data);
          if (code) {
            stopped = true;
            navigator.vibrate?.(100);
            onScanRef.current(code);
            return;
          }
          setInvalid(true);
        }
      }
      frame = requestAnimationFrame(tick);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("เบราว์เซอร์นี้เปิดกล้องไม่ได้ (ต้องเปิดเว็บผ่าน https หรือ localhost)");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        frame = requestAnimationFrame(tick);
      } catch (err) {
        const name = (err as DOMException)?.name;
        setError(
          name === "NotAllowedError"
            ? "ไม่ได้รับอนุญาตให้ใช้กล้อง — กดอนุญาตกล้องในการตั้งค่าเบราว์เซอร์แล้วลองใหม่"
            : name === "NotFoundError"
              ? "ไม่พบกล้องบนอุปกรณ์นี้"
              : "เปิดกล้องไม่สำเร็จ ลองใหม่อีกครั้ง"
        );
      }
    }

    void start();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (error) {
    return <p className="text-sm text-destructive py-6 text-center">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-[15%] rounded-2xl border-4 border-white/80 pointer-events-none" />
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {invalid ? "QR นี้ไม่ใช่ QR รับอาหารของ SkipQ" : "กำลังค้นหา QR..."}
      </p>
    </div>
  );
}

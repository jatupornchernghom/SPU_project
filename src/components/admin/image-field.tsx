"use client";

import { useRef, useState } from "react";
import { ImageOff, Upload, X } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_SIDE = 1200;

/**
 * Uploaded files are resized in the browser and stored as a data: URL in the
 * document itself — Render's free disk is wiped on every deploy, so there's
 * nowhere durable to keep files on the server.
 */
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = canvas.toDataURL("image/webp", 0.82);
  // Safari can't encode WebP and silently falls back to PNG — use JPEG instead.
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
}

export function ImageField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isUpload = value.startsWith("data:");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      setError("อ่านไฟล์รูปไม่สำเร็จ ลองไฟล์อื่น");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border border-border bg-muted">
        {value && broken !== value ? (
          <AppImage
            src={value}
            alt="ตัวอย่างรูป"
            fill
            sizes="480px"
            className="object-cover"
            onError={() => setBroken(value)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground px-4 text-center">
            <ImageOff size={20} />
            {value ? "โหลดรูปจากลิงก์นี้ไม่ได้ — ต้องเป็นลิงก์ไฟล์รูปโดยตรง (ลงท้าย .jpg .png .webp)" : "ยังไม่มีรูป"}
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="ลบรูป"
            className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={isUpload ? "" : value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder={isUpload ? "ใช้รูปที่อัปโหลดแล้ว" : "วางลิงก์รูป https://..."}
          className="flex-1"
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()} className="gap-1">
          <Upload size={14} />
          {busy ? "กำลังย่อรูป..." : "อัปโหลด"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

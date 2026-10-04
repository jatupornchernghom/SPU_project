"use client";

import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { buildPromptPayPayload, formatPromptPayId, PromptPayError } from "@/lib/promptpay";

export function PromptPayQr({
  promptPayId,
  accountName,
  amount,
}: {
  promptPayId?: string;
  accountName?: string;
  amount: number;
}) {
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    if (!promptPayId) return null;
    try {
      return buildPromptPayPayload(promptPayId, amount);
    } catch (error) {
      return error instanceof PromptPayError ? error : null;
    }
  }, [promptPayId, amount]);

  async function handleCopy() {
    if (!promptPayId) return;
    try {
      await navigator.clipboard.writeText(promptPayId.replace(/[^0-9]/g, ""));
      setCopied(true);
      toast.success("คัดลอกเลขบัญชีแล้ว");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  }

  if (!promptPayId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
        <AlertTriangle size={20} />
        <p>
          ร้านนี้ยังไม่ได้ตั้งค่า PromptPay ID — ไปที่ Admin &gt; ร้านอาหาร &gt; แก้ไข เพื่อเพิ่มเลขบัญชี
          (ดู docs/promptpay-qr.md)
        </p>
      </div>
    );
  }

  if (payload instanceof PromptPayError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-center text-sm text-destructive">
        <AlertTriangle size={20} />
        <p>{payload.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5">
      <div className="bg-white p-3 rounded-xl">
        <QRCode value={payload ?? ""} size={176} />
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">สแกนด้วยแอปธนาคาร (PromptPay)</p>
        {accountName && <p className="text-sm font-semibold text-foreground">{accountName}</p>}
        <p className="font-display text-2xl font-extrabold text-foreground mt-1">
          ฿{amount.toFixed(2)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-muted text-sm font-semibold text-foreground active:scale-95 transition-transform"
      >
        {copied ? <Check size={14} className="text-status-ready-fg" /> : <Copy size={14} />}
        {formatPromptPayId(promptPayId)}
      </button>

      <p className="text-[11px] text-muted-foreground text-center max-w-xs">
        QR นี้เป็นของจริงตามมาตรฐาน Thai QR Payment เงินจะเข้าบัญชีร้านโดยตรง — ร้านค้าจะเป็นผู้กด
        &quot;ยืนยันรับยอด&quot; เองหลังตรวจสอบยอดเงินแล้ว
      </p>
    </div>
  );
}

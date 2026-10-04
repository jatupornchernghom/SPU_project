"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck size={40} className="text-primary" />
        <h1 className="font-display text-lg font-bold text-foreground">ส่งคำขอแล้ว</h1>
        <p className="text-sm text-muted-foreground">
          หากอีเมล {email} มีอยู่ในระบบ เราได้ส่งคำแนะนำการตั้งรหัสผ่านใหม่ไปให้แล้ว
        </p>
        <Link href="/login" className="text-primary font-semibold text-sm">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-foreground">ลืมรหัสผ่าน?</h1>
        <p className="text-sm text-muted-foreground mt-1">
          กรอกอีเมลของคุณ เราจะส่งคำแนะนำการตั้งรหัสผ่านใหม่ให้
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@spu.ac.th"
            className="h-12"
          />
        </div>
        <Button type="submit" className="h-12 rounded-full text-base">
          ส่งคำขอ
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        นึกรหัสผ่านได้แล้ว?{" "}
        <Link href="/login" className="text-primary font-semibold">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

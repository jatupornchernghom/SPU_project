"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/validations/auth";

const EMAIL_DOMAIN = "@spumail.net";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = registerSchema.safeParse({ ...form, email: `${form.email.trim()}${EMAIL_DOMAIN}` });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      // Full page load (not router.push) so nothing the client router cached
      // for a previously signed-in account carries over.
      window.location.assign("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-foreground">สมัครสมาชิกใหม่</h1>
        <p className="text-sm text-muted-foreground mt-1">สำหรับนักศึกษา ม.ศรีปทุม (บัญชีบุคลากรและร้านค้า ติดต่อผู้ดูแลระบบ)</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="ชื่อ-นามสกุล" id="name">
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-12"
          />
        </Field>

        <Field label="อีเมลมหาวิทยาลัย" id="email">
          <div className="flex h-12 items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <input
              id="email"
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={form.email}
              // Users often paste their full address — keep only the part before "@".
              onChange={(e) => setForm({ ...form, email: e.target.value.split("@")[0].replace(/\s/g, "") })}
              placeholder="yourname"
              className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
            <span className="pr-3 text-sm text-muted-foreground select-none">{EMAIL_DOMAIN}</span>
          </div>
        </Field>

        <Field label="รหัสนักศึกษา" id="studentId">
          <Input
            id="studentId"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            className="h-12"
          />
        </Field>

        <Field label="เบอร์โทร" id="phone">
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0812345678"
            className="h-12"
          />
        </Field>

        <Field label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" id="password">
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="h-12"
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="h-12 rounded-full text-base mt-2">
          {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="text-primary font-semibold">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

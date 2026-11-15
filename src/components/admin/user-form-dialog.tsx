"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminCreateUserSchema, type AdminCreateUserInput } from "@/lib/validations/auth";
import type { SerializedUser } from "@/types";

type Role = AdminCreateUserInput["role"];

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "RESTAURANT_STAFF", label: "ร้านค้า" },
  { value: "STAFF", label: "บุคลากร" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

const EMPTY = { name: "", email: "", password: "", phone: "", role: "RESTAURANT_STAFF" as Role, restaurantId: "" };

export function UserFormDialog({
  restaurants,
  onSaved,
}: {
  restaurants: { id: string; name: string }[];
  onSaved: (user: SerializedUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = adminCreateUserSchema.safeParse({
      ...form,
      restaurantId: form.role === "RESTAURANT_STAFF" ? form.restaurantId || undefined : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "สร้างบัญชีไม่สำเร็จ");
        return;
      }
      toast.success(`สร้างบัญชี ${data.user.email} แล้ว`);
      onSaved(data.user);
      setForm(EMPTY);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-1" />}>
        <Plus size={16} /> สร้างบัญชี
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างบัญชีผู้ใช้</DialogTitle>
          <DialogDescription>ส่งอีเมลและรหัสผ่านให้เจ้าของบัญชีเพื่อใช้เข้าสู่ระบบ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="ประเภทบัญชี">
            <Select value={form.role} onValueChange={(v) => v && setForm({ ...form, role: v as Role })}>
              <SelectTrigger>
                <SelectValue>{(v: Role) => ROLE_OPTIONS.find((o) => o.value === v)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {form.role === "RESTAURANT_STAFF" && (
            <Field label="ร้านอาหาร">
              <Select value={form.restaurantId} onValueChange={(v) => v && setForm({ ...form, restaurantId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกร้าน">
                    {(v: string) => restaurants.find((r) => r.id === v)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="ชื่อ-นามสกุล / ชื่อผู้ดูแลร้าน">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="อีเมล">
            <Input
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="shop@example.com"
            />
          </Field>
          <Field label="เบอร์โทร (ไม่บังคับ)">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812345678"
            />
          </Field>
          <Field label="รหัสผ่านเริ่มต้น (อย่างน้อย 8 ตัวอักษร)">
            <Input
              type="text"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "กำลังสร้าง..." : "สร้างบัญชี"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

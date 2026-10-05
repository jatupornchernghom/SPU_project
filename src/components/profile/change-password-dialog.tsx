"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordSchema } from "@/lib/validations/auth";

const formSchema = changePasswordSchema
  .extend({ confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่") })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      return;
    }

    toast.success("เปลี่ยนรหัสผ่านแล้ว");
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-muted transition-colors"
          />
        }
      >
        <KeyRound size={18} className="text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-semibold text-foreground">เปลี่ยนรหัสผ่าน</span>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Field label="รหัสผ่านปัจจุบัน" error={errors.currentPassword?.message}>
            <Input type="password" {...register("currentPassword")} />
          </Field>
          <Field label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" error={errors.newPassword?.message}>
            <Input type="password" {...register("newPassword")} />
          </Field>
          <Field label="ยืนยันรหัสผ่านใหม่" error={errors.confirmPassword?.message}>
            <Input type="password" {...register("confirmPassword")} />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

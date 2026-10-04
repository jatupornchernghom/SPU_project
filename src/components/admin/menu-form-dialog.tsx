"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { menuInputSchema } from "@/lib/validations/restaurant";
import type { SerializedMenu, SerializedRestaurant } from "@/types";
import type { z } from "zod";

type FormValues = z.infer<typeof menuInputSchema>;

export function MenuFormDialog({
  menu,
  restaurants,
  onSaved,
}: {
  menu?: SerializedMenu;
  restaurants: SerializedRestaurant[];
  onSaved: (menu: SerializedMenu) => void;
}) {
  const [open, setOpen] = useState(false);
  const defaults: FormValues = {
    restaurantId: menu?.restaurantId ?? restaurants[0]?.id ?? "",
    name: menu?.name ?? "",
    description: menu?.description ?? "",
    image: menu?.image ?? "",
    price: menu?.price ?? 0,
    category: menu?.category ?? "",
    rating: menu?.rating ?? 4.5,
    isAvailable: menu?.isAvailable ?? true,
    preparationTime: menu?.preparationTime ?? 5,
    popular: menu?.popular ?? false,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(menuInputSchema), defaultValues: defaults });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: FormValues) {
    const url = menu ? `/api/menu/${menu.id}` : "/api/menu";
    const method = menu ? "PATCH" : "POST";
    const payload = menu ? { ...values, restaurantId: undefined } : values;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    toast.success(menu ? "แก้ไขเมนูแล้ว" : "เพิ่มเมนูแล้ว");
    onSaved(data.menu);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={menu ? <Button size="sm" variant="outline" /> : <Button className="gap-1" />}>
        {menu ? (
          "แก้ไข"
        ) : (
          <>
            <Plus size={16} /> เพิ่มเมนู
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menu ? "แก้ไขเมนู" : "เพิ่มเมนู"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          {!menu && (
            <div className="flex flex-col gap-1">
              <Label>ร้านอาหาร</Label>
              <Select
                value={watch("restaurantId")}
                onValueChange={(v) => v && setValue("restaurantId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกร้าน" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Field label="ชื่อเมนู" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="คำอธิบาย">
            <Textarea {...register("description")} rows={2} />
          </Field>
          <Field label="URL รูปภาพ">
            <Input {...register("image")} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ราคา (บาท)" error={errors.price?.message}>
              <Input type="number" {...register("price", { valueAsNumber: true })} />
            </Field>
            <Field label="หมวดหมู่" error={errors.category?.message}>
              <Input {...register("category")} placeholder="จานเดียว" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="เวลาเตรียม (นาที)" error={errors.preparationTime?.message}>
              <Input type="number" {...register("preparationTime", { valueAsNumber: true })} />
            </Field>
            <Field label="คะแนน">
              <Input type="number" step="0.1" {...register("rating", { valueAsNumber: true })} />
            </Field>
          </div>
          <div className="flex items-center justify-between">
            <Label>มีขายอยู่</Label>
            <Switch checked={watch("isAvailable")} onCheckedChange={(v) => setValue("isAvailable", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>เมนูแนะนำ (ยอดนิยม)</Label>
            <Switch checked={watch("popular")} onCheckedChange={(v) => setValue("popular", v)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
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

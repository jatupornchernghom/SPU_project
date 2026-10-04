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
import { restaurantInputSchema } from "@/lib/validations/restaurant";
import type { SerializedRestaurant } from "@/types";
import type { z } from "zod";

type FormValues = z.infer<typeof restaurantInputSchema>;

export function RestaurantFormDialog({
  restaurant,
  onSaved,
}: {
  restaurant?: SerializedRestaurant;
  onSaved: (restaurant: SerializedRestaurant) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(restaurantInputSchema),
    defaultValues: {
      name: restaurant?.name ?? "",
      description: restaurant?.description ?? "",
      image: restaurant?.image ?? "",
      location: restaurant?.location ?? "",
      category: restaurant?.category ?? "",
      isOpen: restaurant?.isOpen ?? true,
      openingHours: restaurant?.openingHours ?? "08:00 - 16:00",
      averagePreparationTime: restaurant?.averagePreparationTime ?? 5,
      rating: restaurant?.rating ?? 4.5,
      queuePrefix: restaurant?.queuePrefix ?? "A",
      promptPayId: restaurant?.promptPayId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: restaurant?.name ?? "",
        description: restaurant?.description ?? "",
        image: restaurant?.image ?? "",
        location: restaurant?.location ?? "",
        category: restaurant?.category ?? "",
        isOpen: restaurant?.isOpen ?? true,
        openingHours: restaurant?.openingHours ?? "08:00 - 16:00",
        averagePreparationTime: restaurant?.averagePreparationTime ?? 5,
        rating: restaurant?.rating ?? 4.5,
        queuePrefix: restaurant?.queuePrefix ?? "A",
        promptPayId: restaurant?.promptPayId ?? "",
      });
    }
  }, [open, restaurant, reset]);

  async function onSubmit(values: FormValues) {
    const url = restaurant ? `/api/restaurants/${restaurant.id}` : "/api/restaurants";
    const method = restaurant ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    toast.success(restaurant ? "แก้ไขร้านอาหารแล้ว" : "เพิ่มร้านอาหารแล้ว");
    onSaved(data.restaurant);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={restaurant ? <Button size="sm" variant="outline" /> : <Button className="gap-1" />}
      >
        {restaurant ? (
          "แก้ไข"
        ) : (
          <>
            <Plus size={16} /> เพิ่มร้านอาหาร
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{restaurant ? "แก้ไขร้านอาหาร" : "เพิ่มร้านอาหาร"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Field label="ชื่อร้าน" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="คำอธิบาย">
            <Textarea {...register("description")} rows={2} />
          </Field>
          <Field label="URL รูปภาพ">
            <Input {...register("image")} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ที่ตั้ง" error={errors.location?.message}>
              <Input {...register("location")} placeholder="อาคาร 11" />
            </Field>
            <Field label="ประเภทอาหาร" error={errors.category?.message}>
              <Input {...register("category")} placeholder="ตามสั่ง" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="เวลาเตรียม (นาที)" error={errors.averagePreparationTime?.message}>
              <Input type="number" {...register("averagePreparationTime", { valueAsNumber: true })} />
            </Field>
            <Field label="คะแนน">
              <Input type="number" step="0.1" {...register("rating", { valueAsNumber: true })} />
            </Field>
            <Field label="อักษรคิว" error={errors.queuePrefix?.message}>
              <Input maxLength={2} {...register("queuePrefix")} placeholder="A" />
            </Field>
          </div>
          <Field label="เวลาเปิด-ปิด">
            <Input {...register("openingHours")} placeholder="08:00 - 16:00" />
          </Field>
          <Field
            label="PromptPay ID ของร้าน (เบอร์โทร / เลขบัตรประชาชน / e-Wallet)"
            error={errors.promptPayId?.message}
          >
            <Input {...register("promptPayId")} placeholder="0812345678" />
          </Field>
          <div className="flex items-center justify-between">
            <Label>เปิดร้านอยู่</Label>
            <Switch checked={watch("isOpen")} onCheckedChange={(v) => setValue("isOpen", v)} />
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

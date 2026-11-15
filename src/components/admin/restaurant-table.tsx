"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppImage } from "@/components/ui/app-image";
import { cn } from "cn";
import { RestaurantFormDialog } from "@/components/admin/restaurant-form-dialog";
import type { SerializedRestaurant } from "@/types";

type StatusFilter = "ALL" | "OPEN" | "CLOSED";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "OPEN", label: "เปิด" },
  { value: "CLOSED", label: "ปิด" },
];

export function RestaurantTable({ initialRestaurants }: { initialRestaurants: SerializedRestaurant[] }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [category, setCategory] = useState("ALL");

  const categories = useMemo(
    () => [...new Set(restaurants.map((r) => r.category))].sort((a, b) => a.localeCompare(b, "th")),
    [restaurants]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter(
      (r) =>
        (status === "ALL" || r.isOpen === (status === "OPEN")) &&
        (category === "ALL" || r.category === category) &&
        (!q || [r.name, r.location, r.category].some((v) => v.toLowerCase().includes(q)))
    );
  }, [restaurants, query, status, category]);

  function upsert(restaurant: SerializedRestaurant) {
    setRestaurants((prev) => {
      const exists = prev.some((r) => r.id === restaurant.id);
      return exists ? prev.map((r) => (r.id === restaurant.id ? restaurant : r)) : [restaurant, ...prev];
    });
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("ลบไม่สำเร็จ");
      return;
    }
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
    toast.success("ลบร้านอาหารแล้ว");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อร้าน ที่ตั้ง หรือประเภท"
          className="h-9 lg:max-w-xs"
        />
        <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={cn(
                "px-3 h-7 rounded-md text-xs font-semibold",
                status === f.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="กรองตามประเภท"
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm w-fit"
        >
          <option value="ALL">ทุกประเภท</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="lg:ml-auto">
          <RestaurantFormDialog onSaved={upsert} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        แสดง {filtered.length} จาก {restaurants.length} ร้าน
      </p>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">รูป</TableHead>
              <TableHead>ชื่อร้าน</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>เวลาเตรียม</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="relative h-10 w-14 rounded-md overflow-hidden bg-muted">
                    {r.image && <AppImage src={r.image} alt={r.name} fill sizes="56px" className="object-cover" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>
                  <Badge variant={r.isOpen ? "default" : "secondary"}>
                    {r.isOpen ? "เปิด" : "ปิด"}
                  </Badge>
                </TableCell>
                <TableCell>{r.averagePreparationTime} นาที</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <RestaurantFormDialog restaurant={r} onSaved={upsert} />
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button size="sm" variant="destructive" />}>
                        <Trash2 size={14} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบร้าน &quot;{r.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            การลบร้านจะไม่ลบประวัติคำสั่งซื้อที่มีอยู่แล้ว แต่จะซ่อนร้านนี้จากหน้าหลัก
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(r.id)}>ลบ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {restaurants.length === 0 ? "ยังไม่มีร้านอาหาร" : "ไม่พบร้านที่ตรงกับตัวกรอง"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

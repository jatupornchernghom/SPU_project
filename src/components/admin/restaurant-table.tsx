"use client";

import { useState } from "react";
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
import { RestaurantFormDialog } from "@/components/admin/restaurant-form-dialog";
import type { SerializedRestaurant } from "@/types";

export function RestaurantTable({ initialRestaurants }: { initialRestaurants: SerializedRestaurant[] }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);

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
      <div className="flex justify-end">
        <RestaurantFormDialog onSaved={upsert} />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อร้าน</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>เวลาเตรียม</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((r) => (
              <TableRow key={r.id}>
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
            {restaurants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีร้านอาหาร
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

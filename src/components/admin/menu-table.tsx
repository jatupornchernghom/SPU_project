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
import { MenuFormDialog } from "@/components/admin/menu-form-dialog";
import type { SerializedMenu, SerializedRestaurant } from "@/types";

export function MenuTable({
  initialMenu,
  restaurants,
}: {
  initialMenu: SerializedMenu[];
  restaurants: SerializedRestaurant[];
}) {
  const [menu, setMenu] = useState(initialMenu);

  function upsert(item: SerializedMenu) {
    setMenu((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      return exists ? prev.map((m) => (m.id === item.id ? item : m)) : [item, ...prev];
    });
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("ลบไม่สำเร็จ");
      return;
    }
    setMenu((prev) => prev.filter((m) => m.id !== id));
    toast.success("ลบเมนูแล้ว");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <MenuFormDialog restaurants={restaurants} onSaved={upsert} />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เมนู</TableHead>
              <TableHead>ร้าน</TableHead>
              <TableHead>ราคา</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menu.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  {m.name} {m.popular && <Badge className="ml-1">ยอดนิยม</Badge>}
                </TableCell>
                <TableCell>{m.restaurantName}</TableCell>
                <TableCell>฿{m.price}</TableCell>
                <TableCell>
                  <Badge variant={m.isAvailable ? "default" : "secondary"}>
                    {m.isAvailable ? "มีขาย" : "หมด"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <MenuFormDialog menu={m} restaurants={restaurants} onSaved={upsert} />
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button size="sm" variant="destructive" />}>
                        <Trash2 size={14} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบเมนู &quot;{m.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>การลบไม่สามารถย้อนกลับได้</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(m.id)}>ลบ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {menu.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีเมนู
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

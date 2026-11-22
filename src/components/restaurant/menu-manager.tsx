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
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MenuFormDialog } from "@/components/admin/menu-form-dialog";
import { cn } from "cn";
import type { SerializedMenu, SerializedRestaurant } from "@/types";

/**
 * A restaurant's own menu, built for the counter: the sold-out switch is one
 * tap on every dish; editing and deleting sit beside it.
 */
export function MenuManager({
  restaurant,
  initialMenu,
}: {
  restaurant: SerializedRestaurant;
  initialMenu: SerializedMenu[];
}) {
  const [menu, setMenu] = useState(initialMenu);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? menu.filter((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) : menu;
  }, [menu, query]);
  const soldOut = menu.filter((m) => !m.isAvailable).length;

  function upsert(item: SerializedMenu) {
    setMenu((prev) => (prev.some((m) => m.id === item.id) ? prev.map((m) => (m.id === item.id ? item : m)) : [item, ...prev]));
  }

  async function toggleAvailable(item: SerializedMenu, isAvailable: boolean) {
    setSavingId(item.id);
    upsert({ ...item, isAvailable });
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      upsert(data.menu);
      toast.success(isAvailable ? `"${item.name}" กลับมาขายแล้ว` : `"${item.name}" หมดแล้ว — ลูกค้าจะสั่งไม่ได้`);
    } catch (error) {
      upsert(item);
      toast.error((error as Error).message || "บันทึกไม่สำเร็จ");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item: SerializedMenu) {
    const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("ลบไม่สำเร็จ");
      return;
    }
    setMenu((prev) => prev.filter((m) => m.id !== item.id));
    toast.success(`ลบ "${item.name}" แล้ว`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเมนูหรือหมวดหมู่"
          className="h-9 sm:max-w-xs"
        />
        <p className="text-xs text-muted-foreground sm:flex-1">
          ทั้งหมด {menu.length} เมนู{soldOut > 0 && <span className="text-destructive font-semibold"> · หมด {soldOut}</span>}
        </p>
        <MenuFormDialog restaurants={[restaurant]} onSaved={upsert} ownRestaurant />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          {menu.length === 0 ? "ยังไม่มีเมนู — กด \"เพิ่มเมนู\" เพื่อเริ่ม" : "ไม่พบเมนูที่ค้นหา"}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className={cn(
                "bg-card border border-border rounded-xl p-3 flex items-center gap-3",
                !item.isAvailable && "bg-muted/50"
              )}
            >
              <div className={cn("relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0", !item.isAvailable && "opacity-50 grayscale")}>
                {item.image && <AppImage src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  ฿{item.price} · {item.category}
                  {item.popular && " · แนะนำ"}
                </p>
              </div>
              <label className="flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer">
                <Switch
                  checked={item.isAvailable}
                  disabled={savingId === item.id}
                  onCheckedChange={(v) => toggleAvailable(item, v)}
                  aria-label={`${item.name} มีขาย`}
                />
                <span className={cn("text-[10px] font-semibold", item.isAvailable ? "text-muted-foreground" : "text-destructive")}>
                  {item.isAvailable ? "มีขาย" : "หมด"}
                </span>
              </label>
              <div className="flex gap-1.5 flex-shrink-0">
                <MenuFormDialog menu={item} restaurants={[restaurant]} onSaved={upsert} ownRestaurant />
                <AlertDialog>
                  <AlertDialogTrigger render={<Button size="sm" variant="outline" aria-label={`ลบ ${item.name}`} />}>
                    <Trash2 size={14} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ลบ &quot;{item.name}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ถ้าแค่ของหมดชั่วคราว ใช้สวิตช์ &quot;หมด&quot; แทนได้ — การลบเอาเมนูออกถาวร (ประวัติออเดอร์เดิมยังอยู่)
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item)}>ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

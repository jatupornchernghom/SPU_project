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
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import type { SerializedUser, UserRole } from "@/types";

const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: "นักศึกษา",
  STAFF: "บุคลากร",
  RESTAURANT_STAFF: "ร้านค้า",
  ADMIN: "ผู้ดูแลระบบ",
};

export function UserTable({
  initialUsers,
  restaurants,
  currentUserId,
}: {
  initialUsers: SerializedUser[];
  restaurants: { id: string; name: string }[];
  currentUserId?: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q));
  }, [users, query]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "ลบไม่สำเร็จ");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("ลบบัญชีแล้ว");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อหรืออีเมล"
          className="h-9 sm:max-w-xs"
        />
        <UserFormDialog restaurants={restaurants} onSaved={(u) => setUsers((prev) => [u, ...prev])} />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>ร้าน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "STUDENT" ? "secondary" : "default"}>{ROLE_LABEL[u.role]}</Badge>
                </TableCell>
                <TableCell>{u.restaurantName ?? "-"}</TableCell>
                <TableCell className="text-right">
                  {u.id !== currentUserId && (
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button size="sm" variant="destructive" />}>
                        <Trash2 size={14} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบบัญชี &quot;{u.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            บัญชีนี้จะเข้าสู่ระบบไม่ได้อีก ประวัติคำสั่งซื้อที่มีอยู่จะยังคงอยู่
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u.id)}>ลบ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ไม่พบผู้ใช้
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

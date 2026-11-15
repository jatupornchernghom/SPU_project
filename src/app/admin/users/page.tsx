import { listUsers } from "@/services/user.service";
import { listRestaurants } from "@/services/restaurant.service";
import { auth } from "@/lib/auth";
import { UserTable } from "@/components/admin/user-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [session, users, restaurants] = await Promise.all([auth(), listUsers(), listRestaurants()]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">จัดการบัญชีผู้ใช้</h1>
        <p className="text-sm text-muted-foreground mt-1">
          นักศึกษาสมัครเองได้ ส่วนบัญชีบุคลากร ร้านค้า และผู้ดูแลระบบ ต้องสร้างจากหน้านี้เท่านั้น
        </p>
      </div>
      <UserTable
        initialUsers={users}
        restaurants={restaurants.map((r) => ({ id: r.id, name: r.name }))}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}

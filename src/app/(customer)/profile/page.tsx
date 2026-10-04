import { Mail, Phone, IdCard, Heart, Bell, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Menu } from "@/models/Menu";
import { NotificationToggle } from "@/components/profile/notification-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  await connectToDatabase();
  const user = await User.findById(session.user.id);
  if (!user) return null;

  const favorites = user.favoriteMenuIds.length
    ? await Menu.find({ _id: { $in: user.favoriteMenuIds } }).limit(5)
    : [];

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">{user.name}</h1>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
      </div>

      {(user.role === "RESTAURANT_STAFF" || user.role === "ADMIN") && (
        <Link
          href={user.role === "ADMIN" ? "/admin" : "/restaurant/dashboard"}
          className="flex items-center gap-2 h-12 px-4 rounded-xl bg-primary/10 text-primary font-semibold"
        >
          {user.role === "ADMIN" ? <ShieldCheck size={18} /> : <LayoutDashboard size={18} />}
          {user.role === "ADMIN" ? "ไปที่ Admin Dashboard" : "ไปที่ Restaurant Dashboard"}
        </Link>
      )}

      <section className="flex flex-col gap-1 bg-card border border-border rounded-xl divide-y divide-border">
        <InfoRow icon={Mail} label="อีเมล" value={user.email} />
        {user.studentId && <InfoRow icon={IdCard} label="รหัสนักศึกษา/พนักงาน" value={user.studentId} />}
        {user.phone && <InfoRow icon={Phone} label="เบอร์โทร" value={user.phone} />}
      </section>

      <section className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">การแจ้งเตือน</span>
        </div>
        <NotificationToggle initialEnabled={user.notificationsEnabled} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Heart size={14} /> เมนูโปรด
        </h2>
        {favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">ยังไม่มีเมนูโปรด</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {favorites.map((f) => (
              <div key={f._id.toString()} className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                {f.name}
              </div>
            ))}
          </div>
        )}
      </section>

      <SignOutButton />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={18} className="text-muted-foreground flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground truncate">{value}</span>
      </div>
    </div>
  );
}

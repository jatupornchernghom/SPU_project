import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { serializeNotification } from "@/lib/serialize";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  await connectToDatabase();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  const serialized = notifications.map(serializeNotification);

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <h1 className="font-display text-xl font-bold text-foreground">การแจ้งเตือน</h1>

      {serialized.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <BellOff size={32} />
          <p className="text-sm">ยังไม่มีการแจ้งเตือน</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {serialized.map((n) => (
            <Link
              key={n.id}
              href={n.orderId ? `/orders/${n.orderId}` : "#"}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                n.isRead ? "bg-card border-border" : "bg-primary/5 border-primary/30"
              }`}
            >
              <Bell size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-foreground">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.message}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

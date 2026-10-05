import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { serializeNotification } from "@/lib/serialize";
import { NotificationList } from "@/components/notification/notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  await connectToDatabase();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <h1 className="font-display text-xl font-bold text-foreground">การแจ้งเตือน</h1>
      <NotificationList initialNotifications={notifications.map(serializeNotification)} />
    </div>
  );
}

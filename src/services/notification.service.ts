import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { sendPushToUser } from "@/lib/web-push";
import type { NotificationType } from "@/types";

const SCRIPTS: Record<NotificationType, { title: string; message: string }> = {
  ORDER_RECEIVED: {
    title: "รับออเดอร์แล้ว",
    message: "ร้านได้รับออเดอร์ของคุณแล้ว",
  },
  PREPARING: {
    title: "กำลังปรุงอาหาร",
    message: "ร้านกำลังทำอาหารให้คุณ",
  },
  READY_FOR_PICKUP: {
    title: "พร้อมรับแล้ว!",
    message: "อาหารพร้อมแล้ว มารับที่ร้านได้เลย",
  },
  COMPLETED: {
    title: "รับอาหารสำเร็จ",
    message: "ขอบคุณที่ใช้บริการ SkipQ",
  },
};

export async function notify(userId: string, orderId: string, type: NotificationType) {
  const script = SCRIPTS[type];
  const notification = await Notification.create({
    userId,
    orderId,
    type,
    title: script.title,
    message: script.message,
  });

  // Phone/desktop push for the moments worth interrupting someone for. Not
  // awaited: a slow push service must never hold up the order update.
  if (type === "PREPARING" || type === "READY_FOR_PICKUP") {
    void User.exists({ _id: userId, notificationsEnabled: true })
      .then((wantsPush) =>
        wantsPush
          ? sendPushToUser(userId, {
              title: `SkipQ · ${script.title}`,
              body: script.message,
              url: `/orders/${orderId}`,
              tag: `order-${orderId}`,
            })
          : undefined
      )
      .catch((error) => console.error("push notification failed", error));
  }

  return notification;
}

export async function countUnreadNotifications(userId: string) {
  return Notification.countDocuments({ userId, isRead: false });
}

export async function markAllNotificationsRead(userId: string) {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

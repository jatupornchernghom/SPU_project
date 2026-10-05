import { Notification } from "@/models/Notification";
import type { NotificationType } from "@/types";

const SCRIPTS: Record<NotificationType, { title: string; message: string }> = {
  ORDER_RECEIVED: {
    title: "รับออเดอร์แล้ว",
    message: "Your order has been received.",
  },
  PREPARING: {
    title: "กำลังปรุงอาหาร",
    message: "Your food is being prepared.",
  },
  READY_FOR_PICKUP: {
    title: "พร้อมรับแล้ว!",
    message: "Your order is ready for pickup!",
  },
  COMPLETED: {
    title: "รับอาหารสำเร็จ",
    message: "Thank you for using SPU SkipQ.",
  },
};

export async function notify(userId: string, orderId: string, type: NotificationType) {
  const script = SCRIPTS[type];
  return Notification.create({
    userId,
    orderId,
    type,
    title: script.title,
    message: script.message,
  });
}

export async function countUnreadNotifications(userId: string) {
  return Notification.countDocuments({ userId, isRead: false });
}

export async function markAllNotificationsRead(userId: string) {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

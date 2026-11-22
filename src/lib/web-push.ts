import webpush from "web-push";
import { PushSubscription } from "@/models/PushSubscription";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

/** Push is optional: without VAPID keys the app works and simply never pushes. */
export const pushEnabled = !!(publicKey && privateKey);
export const vapidPublicKey = pushEnabled ? publicKey! : null;

if (pushEnabled) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@spumail.net", publicKey!, privateKey!);
}

export type PushPayload = { title: string; body: string; url: string; tag?: string };

/** Sends to every device the user subscribed; drops subscriptions the push service says are gone. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!pushEnabled) return;
  const subscriptions = await PushSubscription.find({ userId }).lean();

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload), {
          TTL: 60 * 60,
          urgency: "high",
        });
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error("web push failed", status, (error as Error).message);
        }
      }
    })
  );
}

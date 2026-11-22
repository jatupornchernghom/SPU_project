// SkipQ service worker: shows order push notifications and opens the order
// when one is tapped. Registered by PushNotificationButton.

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "SkipQ", body: event.data.text(), url: "/orders" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/192",
      badge: "/icons/96",
      tag: data.tag,
      renotify: Boolean(data.tag),
      vibrate: [200, 100, 200],
      data: { url: data.url || "/orders" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/orders", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((w) => w.url === url);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

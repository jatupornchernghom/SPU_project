import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { countUnreadNotifications } from "@/services/notification.service";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingCartButton } from "@/components/layout/floating-cart-button";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  let unreadCount = 0;
  if (session?.user) {
    await connectToDatabase();
    unreadCount = await countUnreadNotifications(session.user.id);
  }

  return (
    <>
      <Header userName={session?.user?.name} unreadCount={unreadCount} />
      <main className="flex-1 w-full pt-16 pb-40 md:pb-24 max-w-5xl mx-auto">{children}</main>
      <FloatingCartButton />
      <BottomNav />
    </>
  );
}

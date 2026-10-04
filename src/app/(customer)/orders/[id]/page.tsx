import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/services/order.service";
import { OrderTracker } from "@/components/order/order-tracker";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const order = await getOrderById(id, {
    id: session.user.id,
    role: session.user.role,
    restaurantId: session.user.restaurantId,
  });
  if (!order) notFound();

  return <OrderTracker order={order} />;
}

import { listAllOrdersForAdmin } from "@/services/order.service";
import { listRestaurants } from "@/services/restaurant.service";
import { StatusBadge } from "@/components/queue/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ORDER_STATUSES } from "@/types";

type Props = {
  searchParams: Promise<{ restaurantId?: string; status?: string; date?: string; email?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const filters = await searchParams;
  const [orders, restaurants] = await Promise.all([
    listAllOrdersForAdmin({
      restaurantId: filters.restaurantId || undefined,
      status: (filters.status as (typeof ORDER_STATUSES)[number]) || undefined,
      date: filters.date || undefined,
      userEmail: filters.email || undefined,
    }),
    listRestaurants(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-foreground">คำสั่งซื้อทั้งหมด</h1>

      <form className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-card border border-border rounded-xl p-3">
        <select
          name="restaurantId"
          defaultValue={filters.restaurantId ?? ""}
          className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
        >
          <option value="">ทุกร้าน</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
        >
          <option value="">ทุกสถานะ</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          defaultValue={filters.date ?? ""}
          className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
        />
        <input
          type="email"
          name="email"
          placeholder="อีเมลลูกค้า"
          defaultValue={filters.email ?? ""}
          className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
        />
        <button
          type="submit"
          className="col-span-2 md:col-span-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
          กรองข้อมูล
        </button>
      </form>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่ออเดอร์</TableHead>
              <TableHead>ร้าน</TableHead>
              <TableHead>ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>ชำระเงิน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.orderNumber}</TableCell>
                <TableCell>{o.restaurantName}</TableCell>
                <TableCell>฿{o.total}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell>{o.paymentStatus}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ไม่พบคำสั่งซื้อ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

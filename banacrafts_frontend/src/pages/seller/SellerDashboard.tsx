import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatsCard from "@/components/common/StatsCard";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import PaymentStatusBadge from "@/components/common/PaymentStatusBadge";
import RevenueChart from "@/components/charts/RevenueChart";
import OrdersChart from "@/components/charts/OrdersChart";
import TopProductsChart from "@/components/charts/TopProductsChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Clock,
  Eye,
  Star,
} from "lucide-react";
import { normalizeUserFromPayload, useAuth } from "@/context/AuthContext";
import { normalizePaymentStatusForBadge } from "@/lib/orderPayment";

const API = "http://localhost:5000";

const getSellerIdFromUser = (userData: Record<string, unknown>): string =>
  String(
    (userData as { id?: string })?.id ||
      (userData as { _id?: string })?._id ||
      (userData as { sellerId?: string })?.sellerId ||
      (userData as { seller?: { id?: string; _id?: string } })?.seller?.id ||
      (userData as { seller?: { _id?: string } })?.seller?._id ||
      ""
  );

type DashboardOrder = {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerRequest: {
    type: string;
    status: string;
  } | null;
};

const transformSellerOrders = (orders: unknown): DashboardOrder[] => {
  if (!Array.isArray(orders)) return [];

  return orders.map((order: Record<string, unknown>) => ({
    id: String((order as { _id?: string })._id),
    customerName:
      ((order as { user?: { name?: string } }).user?.name as string) ||
      "Unknown",
    totalAmount: Number((order as { totalPrice?: number }).totalPrice) || 0,
    status: String(
      (order as { orderStatus?: string }).orderStatus || "pending"
    ).toLowerCase(),
    paymentStatus: normalizePaymentStatusForBadge(
      (order as { paymentStatus?: string }).paymentStatus
    ),
    createdAt: String((order as { createdAt?: string }).createdAt || ""),
    customerRequest: (order as { cancelRequested?: boolean }).cancelRequested
      ? {
          type: "cancel",
          status:
            (order as { cancelStatus?: string }).cancelStatus === "Requested"
              ? "pending"
              : String(
                  (order as { cancelStatus?: string }).cancelStatus || ""
                ).toLowerCase(),
        }
      : (order as { returnRequested?: boolean }).returnRequested
        ? {
            type: "exchange",
            status:
              (order as { returnStatus?: string }).returnStatus === "Requested"
                ? "pending"
                : String(
                    (order as { returnStatus?: string }).returnStatus || ""
                  ).toLowerCase(),
          }
        : null,
  }));
};

const buildDailyOrdersChart = (orders: DashboardOrder[]) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const counts = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    counts.set(d.toDateString(), 0);
  }

  orders.forEach((order) => {
    if (!order.createdAt) return;
    const cd = new Date(order.createdAt);
    cd.setHours(0, 0, 0, 0);
    const key = cd.toDateString();
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });

  const result: { name: string; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    result.push({
      name: dayNames[d.getDay()],
      orders: counts.get(d.toDateString()) || 0,
    });
  }
  return result;
};

const normalizeRevenuePayload = (data: unknown) => {
  if (Array.isArray(data)) return data;
  const o = data as { revenue?: unknown };
  return Array.isArray(o?.revenue) ? o.revenue : [];
};

const normalizeTopProductsPayload = (data: unknown) => {
  if (Array.isArray(data)) return data;
  const o = data as { topProducts?: unknown };
  return Array.isArray(o?.topProducts) ? o.topProducts : [];
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [revenueData, setRevenueData] = useState<
    { name: string; revenue: number }[]
  >([]);
  const [topProductsData, setTopProductsData] = useState<
    { name: string; value: number }[]
  >([]);
  const [sellerOrders, setSellerOrders] = useState<DashboardOrder[]>([]);

  const sellerId = useMemo(
    () => {
      const fromContext = getSellerIdFromUser(
        user as unknown as Record<string, unknown>
      );
      if (fromContext) return fromContext;

      const rawStored = (() => {
        try {
          return JSON.parse(localStorage.getItem("banacrafts_user") || "{}");
        } catch {
          return {};
        }
      })();
      const normalizedStored = normalizeUserFromPayload(rawStored);
      return getSellerIdFromUser(
        (normalizedStored ?? rawStored) as Record<string, unknown>
      );
    },
    [user]
  );

  useEffect(() => {
    if (!sellerId) return;

    const load = async () => {
      try {
        const [statsRes, revenueRes, topRes, ordersRes] = await Promise.all([
          fetch(`${API}/seller/dashboard/stats/${sellerId}`),
          fetch(`${API}/seller/dashboard/revenue/${sellerId}`),
          fetch(`${API}/seller/dashboard/top-products/${sellerId}`),
          fetch(`${API}/api/orders/seller/${sellerId}`),
        ]);

        if (statsRes.ok) {
          setStats((await statsRes.json()) as Record<string, unknown>);
        }

        if (revenueRes.ok) {
          const revJson = normalizeRevenuePayload(await revenueRes.json());
          setRevenueData(
            revJson.map((row: Record<string, unknown>) => ({
              name: String(row.name ?? ""),
              revenue: Number(row.revenue) || 0,
            }))
          );
        }

        if (topRes.ok) {
          const topJson = normalizeTopProductsPayload(await topRes.json());
          setTopProductsData(
            topJson.map((row: Record<string, unknown>) => ({
              name: String(row.name ?? "Product"),
              value: Number(row.value) || 0,
            }))
          );
        }

        if (ordersRes.ok) {
          const raw = await ordersRes.json();
          setSellerOrders(transformSellerOrders(raw));
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    load();
  }, [sellerId]);

  const ordersChartData = useMemo(
    () => buildDailyOrdersChart(sellerOrders),
    [sellerOrders]
  );

  const awaitingConfirmation = sellerOrders.filter(
    (o) => !["confirmed", "dispatched", "delivered", "cancelled"].includes(o.status)
  ).length;

  const paymentPending = sellerOrders.filter(
    (o) => o.paymentStatus === "pending"
  ).length;

  const customerRequestsPending = sellerOrders.filter(
    (o) => o.customerRequest?.status === "pending"
  ).length;

  const recentOrders = sellerOrders.slice(0, 5);

  const totalRevenue = Number(stats?.totalRevenue) || 0;
  const totalOrders = Number(stats?.totalOrders) || 0;
  const totalProducts = Number(stats?.totalProducts) || 0;
  const avgProductRating = Number(stats?.avgProductRating) || 0;
  const totalProductRatings = Number(stats?.totalProductRatings) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "Seller"}! Here's your store overview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<IndianRupee className="h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingBag className="h-4 w-4" />}
            trend={{ value: 8, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Active Products"
            value={totalProducts}
            icon={<Package className="h-4 w-4" />}
            description="Listed on store"
          />
          <StatsCard
            title="Avg. product rating"
            value={
              totalProductRatings > 0 ? avgProductRating.toFixed(1) : "—"
            }
            icon={<Star className="h-4 w-4" />}
            description={
              totalProductRatings > 0
                ? `${totalProductRatings} rating${totalProductRatings === 1 ? "" : "s"} across products`
                : "No ratings yet"
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/seller/products">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-4"
            >
              <Package className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Products</div>
                <div className="text-xs text-muted-foreground">
                  Add or edit listings
                </div>
              </div>
            </Button>
          </Link>
          <Link to="/seller/orders">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-4"
            >
              <ShoppingBag className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View Orders</div>
                <div className="text-xs text-muted-foreground">
                  {awaitingConfirmation} awaiting action
                </div>
              </div>
            </Button>
          </Link>
          <Link to="/seller/discounts">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-4"
            >
              <TrendingUp className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Discounts</div>
                <div className="text-xs text-muted-foreground">Create offers</div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart title="Weekly Revenue" data={revenueData} />
          </div>
          <TopProductsChart
            title="Top Selling Products"
            data={topProductsData}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OrdersChart title="Daily Orders" data={ordersChartData} />

          <Card className="heritage-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="font-medium text-yellow-800">
                  {awaitingConfirmation} order
                  {awaitingConfirmation !== 1 ? "s" : ""} need confirmation
                </div>
                <p className="text-sm text-yellow-700">
                  Confirm or manage from Orders
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="font-medium text-orange-800">
                  {paymentPending} payment
                  {paymentPending !== 1 ? "s" : ""} pending
                </div>
                <p className="text-sm text-orange-700">
                  Orders awaiting payment completion
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-medium text-blue-800">
                  {customerRequestsPending === 0
                    ? "No pending customer requests"
                    : `${customerRequestsPending} customer request${
                        customerRequestsPending !== 1 ? "s" : ""
                      } pending`}
                </div>
                <p className="text-sm text-blue-700">
                  {customerRequestsPending === 0
                    ? "No pending cancel or exchange requests."
                    : "Follow up on cancel or exchange requests from Orders."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="heritage-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Recent Orders</CardTitle>
            <Link to="/seller/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No orders yet. When customers place orders, they will show up
                here.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium font-mono text-xs">
                        {order.id.slice(-8)}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        ₹{order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to="/seller/orders" aria-label="View orders">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;

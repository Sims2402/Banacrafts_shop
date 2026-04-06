import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatsCard from "@/components/common/StatsCard";
import RevenueChart from "@/components/charts/RevenueChart";
import TopProductsChart from "@/components/charts/TopProductsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, ShoppingBag, Package, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API = "http://localhost:5000/api";
const DEFAULT_WEEKLY_REVENUE = [
  { name: "Week 1", revenue: 0 },
  { name: "Week 2", revenue: 0 },
  { name: "Week 3", revenue: 0 },
  { name: "Week 4", revenue: 0 },
];

const SellerDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      user?.token ??
      JSON.parse(localStorage.getItem("banacrafts_user") || "{}").token ??
      "";
    const sellerId =
      user?.id ??
      JSON.parse(localStorage.getItem("banacrafts_user") || "{}")?.user?._id ??
      "";

    if (!token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [ordersRes, productsRes, revenueRes] = await Promise.all([
          fetch(`${API}/orders/seller`, { headers }),
          fetch(`${API}/products/seller/me`, { headers }),
          fetch(`${API}/dashboard/seller/dashboard/revenue/${sellerId}`, { headers }),
        ]);

        if (!ordersRes.ok) throw new Error("Failed to fetch orders");
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        if (!revenueRes.ok) throw new Error("Failed to fetch revenue");

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const revenueResponse = await revenueRes.json();

        /* ✅ FIX: CALCULATE RATING */
        const avgRating =
          productsData.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) /
          (productsData.length || 1);

        /* STATS */
        setStats({
          totalRevenue: ordersData.reduce(
            (sum: number, o: any) => sum + (o.totalPrice || 0),
            0
          ),
          totalOrders: ordersData.length,
          totalProducts: productsData.length,
          avgRating: avgRating.toFixed(1),
        });

        /* ORDERS */
        setOrders(ordersData);

        /* REVENUE (last 4 weeks from dashboard API) */
        setRevenue(
          Array.isArray(revenueResponse?.revenue)
            ? revenueResponse.revenue
            : DEFAULT_WEEKLY_REVENUE
        );

        /* TOP PRODUCTS */
        console.log("ORDERS:", ordersData);
        
        const productMap: Record<string, number> = {};
        ordersData.forEach((order: any) => {
          if (!order.orderItems) return;

          order.orderItems.forEach((item: any) => {
            const name = item.name || item.product?.name || "Unknown";
            const qty = item.qty || item.quantity || 0;

            productMap[name] = (productMap[name] || 0) + qty;
          });
        });

        const topProductsData = Object.entries(productMap).map(([name, value]) => ({
          name,
          value,
        }));

        console.log("TOP PRODUCTS:", topProductsData);
        setTopProducts(topProductsData);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            {/* ✅ FIXED STATS */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Revenue" value={`₹${stats?.totalRevenue ?? 0}`} icon={<IndianRupee />} />
              <StatsCard title="Orders" value={stats?.totalOrders ?? 0} icon={<ShoppingBag />} />
              <StatsCard title="Products" value={stats?.totalProducts ?? 0} icon={<Package />} />
              <StatsCard title="Rating" value={stats?.avgRating ?? "0"} icon={<Star />} />
            </div>

            {/* CHARTS */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart title="Revenue (Last 4 Weeks)" data={revenue} />
              </div>
              <TopProductsChart title="Top Products" data={topProducts} />
            </div>

            {/* RECENT ORDERS */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((o: any) => (
                        <TableRow key={o._id}>
                          <TableCell>{o._id.slice(-6)}</TableCell>
                          <TableCell>{o.user?.name || "Unknown"}</TableCell>
                          <TableCell>₹{o.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
import { useState } from "react";
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
  Users,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Package,
  Tag,
  Eye,
  FileText,
} from "lucide-react";
import { mockOrders, getTotalRevenue } from "@/data/orders";
import { mockUsers, getTotalSellers, getTotalCustomers } from "@/data/users";
import { mockDiscounts, getActiveDiscounts } from "@/data/discounts";
import { useAuth } from "@/context/AuthContext";

// Mock chart data for admin
const monthlyRevenueData = [
  { name: "Aug", revenue: 45000 },
  { name: "Sep", revenue: 52000 },
  { name: "Oct", revenue: 68000 },
  { name: "Nov", revenue: 85000 },
  { name: "Dec", revenue: 92000 },
  { name: "Jan", revenue: 78000 },
];

const weeklyOrdersData = [
  { name: "Week 1", orders: 28 },
  { name: "Week 2", orders: 35 },
  { name: "Week 3", orders: 42 },
  { name: "Week 4", orders: 38 },
];

const topProductsData = [
  { name: "Silk Saree", value: 45 },
  { name: "Embroidered Clutch", value: 32 },
  { name: "Block Print Dupatta", value: 28 },
  { name: "Brass Diya Set", value: 22 },
  { name: "Handmade Jewelry", value: 18 },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders] = useState(mockOrders);
  
  const totalRevenue = getTotalRevenue(orders);
  const totalSellers = getTotalSellers(mockUsers);
  const totalCustomers = getTotalCustomers(mockUsers);
  const activeDiscounts = getActiveDiscounts(mockDiscounts).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "Admin"}! Here's your platform overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<IndianRupee className="h-4 w-4" />}
            trend={{ value: 18, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingBag className="h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Active Sellers"
            value={totalSellers}
            icon={<Package className="h-4 w-4" />}
            description="Registered sellers"
          />
          <StatsCard
            title="Customers"
            value={totalCustomers}
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 24, isPositive: true }}
            description="vs last month"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/users">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Users</div>
                <div className="text-xs text-muted-foreground">{mockUsers.length} total users</div>
              </div>
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <ShoppingBag className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">All Orders</div>
                <div className="text-xs text-muted-foreground">View & manage orders</div>
              </div>
            </Button>
          </Link>
          <Link to="/admin/discounts">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Tag className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Discounts</div>
                <div className="text-xs text-muted-foreground">{activeDiscounts} active</div>
              </div>
            </Button>
          </Link>
          <Link to="/admin/awareness">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Awareness</div>
                <div className="text-xs text-muted-foreground">Manage articles</div>
              </div>
            </Button>
          </Link>
        </div>

        {/* Customer Service Section */}
        <Card className="heritage-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-display">Customer Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/support/track-order">
                <Button variant="ghost" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm">Track Order</span>
                </Button>
              </Link>
              <Link to="/support/returns-refunds">
                <Button variant="ghost" className="w-full h-auto py-4 flex flex-col gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm">Returns & Refunds</span>
                </Button>
              </Link>
              <Link to="/support/shipping-info">
                <Button variant="ghost" className="w-full h-auto py-4 flex flex-col gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span className="text-sm">Shipping Info</span>
                </Button>
              </Link>
              <Link to="/support/faqs">
                <Button variant="ghost" className="w-full h-auto py-4 flex flex-col gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm">FAQs</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart title="Monthly Revenue Trends" data={monthlyRevenueData} />
          </div>
          <TopProductsChart title="Top Selling Products" data={topProductsData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OrdersChart title="Weekly Order Volume" data={weeklyOrdersData} />
          
          <Card className="heritage-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="font-medium text-green-800">
                  ₹{orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-green-700">Total Paid Revenue</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="font-medium text-yellow-800">
                  {orders.filter(o => o.status === "pending").length} Orders
                </div>
                <p className="text-sm text-yellow-700">Pending Confirmation</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="font-medium text-orange-800">
                  {orders.filter(o => o.paymentStatus === "pending").length} Orders
                </div>
                <p className="text-sm text-orange-700">Payment Pending</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="font-medium text-purple-800">
                  {orders.filter(o => o.status === "dispatched").length} Orders
                </div>
                <p className="text-sm text-purple-700">In Transit</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="heritage-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Recent Orders</CardTitle>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.sellerName}</TableCell>
                    <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

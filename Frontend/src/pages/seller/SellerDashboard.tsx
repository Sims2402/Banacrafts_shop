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
  Package,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Star,
  Clock,
  Eye,
} from "lucide-react";
import { mockOrders, getOrdersBySeller, getTotalRevenue } from "@/data/orders";
import { products } from "@/data/products";
import { useAuth } from "@/context/AuthContext";

// Mock chart data for seller
const revenueData = [
  { name: "Week 1", revenue: 12000 },
  { name: "Week 2", revenue: 18500 },
  { name: "Week 3", revenue: 14200 },
  { name: "Week 4", revenue: 22000 },
];

const ordersData = [
  { name: "Mon", orders: 4 },
  { name: "Tue", orders: 6 },
  { name: "Wed", orders: 3 },
  { name: "Thu", orders: 8 },
  { name: "Fri", orders: 5 },
  { name: "Sat", orders: 9 },
  { name: "Sun", orders: 7 },
];

const topProductsData = [
  { name: "Silk Saree", value: 12 },
  { name: "Clutch Bag", value: 8 },
  { name: "Block Print Dupatta", value: 6 },
  { name: "Brass Diya", value: 5 },
];

const SellerDashboard = () => {
  const { user } = useAuth();
  const [sellerOrders] = useState(() => getOrdersBySeller(mockOrders, "seller1"));
  
  const totalRevenue = getTotalRevenue(sellerOrders);
  const pendingOrders = sellerOrders.filter(o => o.status === "pending").length;
  const totalProducts = products.length;
  const avgRating = 4.5;

  const recentOrders = sellerOrders.slice(0, 5);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<IndianRupee className="h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Total Orders"
            value={sellerOrders.length}
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
            title="Average Rating"
            value={avgRating}
            icon={<Star className="h-4 w-4" />}
            description="Based on 48 reviews"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/seller/products">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Package className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Products</div>
                <div className="text-xs text-muted-foreground">Add or edit listings</div>
              </div>
            </Button>
          </Link>
          <Link to="/seller/orders">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <ShoppingBag className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View Orders</div>
                <div className="text-xs text-muted-foreground">{pendingOrders} pending</div>
              </div>
            </Button>
          </Link>
          <Link to="/seller/discounts">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <TrendingUp className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Discounts</div>
                <div className="text-xs text-muted-foreground">Create offers</div>
              </div>
            </Button>
          </Link>
          <Link to="/seller/reviews">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Star className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Reviews</div>
                <div className="text-xs text-muted-foreground">Customer feedback</div>
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
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-sm">FAQs</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart title="Weekly Revenue" data={revenueData} />
          </div>
          <TopProductsChart title="Top Selling Products" data={topProductsData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OrdersChart title="Daily Orders" data={ordersData} />
          
          <Card className="heritage-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="font-medium text-yellow-800">2 Orders Pending</div>
                <p className="text-sm text-yellow-700">Awaiting confirmation</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="font-medium text-orange-800">1 Payment Pending</div>
                <p className="text-sm text-orange-700">Cash on delivery</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-medium text-blue-800">3 New Reviews</div>
                <p className="text-sm text-blue-700">Respond to customers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="heritage-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Recent Orders</CardTitle>
            <Link to="/seller/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
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

export default SellerDashboard;

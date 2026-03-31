import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminNav from "@/components/layout/AdminNav"; // Direct Navigation integrated
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import PaymentStatusBadge from "@/components/common/PaymentStatusBadge";
import { Search, Eye, IndianRupee, ShoppingBag, CreditCard, Download } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

/* ================= TYPES ================= */

interface OrderItem {
  product: {
    _id: string;
    title: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  deliveryMethod: string;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalPrice: number;
  createdAt: string;
}

/* ================= STATUS NORMALIZERS ================= */

const normalizePaymentStatus = (status: string) =>
  status.toLowerCase() as "pending" | "paid" | "failed" | "refunded";

const normalizeOrderStatus = (status: string) =>
  status.toLowerCase() as
    | "pending"
    | "confirmed"
    | "dispatched"
    | "delivered"
    | "cancelled";

/* ================= COMPONENT ================= */

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    try {
      const data = await fetchWithAuth("/admin/orders");
      setOrders(data.orders || []);
    } catch (err) {
      console.log("Orders fetch error:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= FILTER LOGIC ================= */

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter(o => o.paymentStatus.toLowerCase() === "paid")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter(o => o.orderStatus.toLowerCase() === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />
      <AdminNav />

      <main className="flex-1 container mx-auto px-8 py-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#3d1a11]">Orders Management</h1>
            <p className="text-gray-500 mt-1 italic">Track and process customer purchases</p>
          </div>
          <button className="bg-white hover:bg-[#FAF3F0] text-[#722F37] border border-[#722F37] rounded-[12px] h-[45px] px-6 transition-all font-medium flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="text-[15px]">Export Report</span>
          </button>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            icon={<IndianRupee className="text-green-600" size={24} />} 
            bgColor="bg-green-100" 
          />
          <StatCard 
            title="Pending Orders" 
            value={pendingOrders} 
            icon={<ShoppingBag className="text-orange-600" size={24} />} 
            bgColor="bg-orange-100" 
          />
          <StatCard 
            title="Total Orders" 
            value={orders.length} 
            icon={<CreditCard className="text-[#722F37]" size={24} />} 
            bgColor="bg-[#FAF3F0]" 
          />
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl p-3 flex gap-4 mb-8 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="Search by Order ID or Customer Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-2.5 pl-11 pr-4 focus:outline-none text-sm placeholder:text-gray-400"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#E8DCCF] rounded-xl px-5 py-2 text-sm font-medium outline-none text-gray-500 shadow-sm min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-sm">
          <table className="w-full text-sm text-[#4A3728]">
            <thead className="text-left bg-transparent border-b border-[#E8DCCF]">
              <tr className="text-gray-500 font-medium">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCF]">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-[#F2EAE0] transition-colors group">
                  <td className="px-6 py-5 font-bold text-[#6B240C]">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold">{order.user?.name}</div>
                    <div className="text-[11px] text-gray-400">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-5 font-bold">
                    ₹{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <PaymentStatusBadge status={normalizePaymentStatus(order.paymentStatus)} />
                  </td>
                  <td className="px-6 py-5">
                    <OrderStatusBadge status={normalizeOrderStatus(order.orderStatus)} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-gray-400 hover:text-[#722F37] transition-colors">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center text-gray-400 italic">No orders found.</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

/* ================= HELPER COMPONENT ================= */

const StatCard = ({ title, value, icon, bgColor }: { title: string, value: any, icon: any, bgColor: string }) => (
  <div className="bg-white border border-[#E8DCCF] p-8 rounded-[24px] flex items-center gap-6 shadow-sm">
    <div className={`${bgColor} w-16 h-16 rounded-full flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-bold text-[#3d1a11] leading-none">{value}</p>
    </div>
  </div>
);

export default AdminOrders;
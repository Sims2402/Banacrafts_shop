import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminNav from "@/components/layout/AdminNav";
import RevenueChart from "@/components/charts/RevenueChart";
import OrdersChart from "@/components/charts/OrdersChart";
import TopProductsChart from "@/components/charts/TopProductsChart";
import {
  Users, ShoppingBag, IndianRupee, Package,
  TrendingUp, ArrowUpRight, Activity,
} from "lucide-react";

/* ── Animated counter hook ── */
const useCountUp = (target: number, duration = 1200) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(ease * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [target, duration]);

  return value;
};

/* ── Live clock ── */
const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const time = useClock();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalSellers: 0,
    totalCustomers: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const getDashboard = async () => {
    try {
      // DEBUG: Check token
      const storedUser = localStorage.getItem("banacrafts_user");
      const token = storedUser ? JSON.parse(storedUser).token : null;
      console.log("TOKEN FROM STORAGE:", token ? "✓ Found" : "✗ Missing");
      console.log("USER DATA:", storedUser ? JSON.parse(storedUser) : "✗ No user");

      const data = await fetchWithAuth("/admin/dashboard");
      console.log("ADMIN DASHBOARD DATA:", data);

      const ordersData = data.orders || [];
      console.log("ORDERS COUNT:", ordersData.length);
      console.log("ORDERS DATA:", ordersData);

      /* ── TOP PRODUCTS ── */
      const productMap: Record<string, number> = {};

      ordersData.forEach((order: any) => {
        if (!order.orderItems) return;

        order.orderItems.forEach((item: any) => {
          const name =
            item.name ||
            item.product?.name ||
            item.product?.title ||
            "Unknown";

          const qty = item.qty || item.quantity || 1;

          productMap[name] = (productMap[name] || 0) + qty;
        });
      });

      const topProductsData = Object.entries(productMap).map(([name, value]) => ({
        name,
        value,
      }));

      console.log("TOP PRODUCTS:", topProductsData);

      /* ── WEEKLY REVENUE ── */
      const weeklyMap: Record<string, number> = {};

      ordersData.forEach((order: any) => {
        const date = new Date(order.createdAt);
        const week = Math.ceil(date.getDate() / 7);
        const label = `Week ${week}`;

        weeklyMap[label] = (weeklyMap[label] || 0) + (order.totalPrice || 0);
      });

      const weeklyRevenue = Object.entries(weeklyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, revenue]) => ({ name, revenue }));

      console.log("WEEKLY REVENUE:", weeklyRevenue);

      setStats(data.stats);
      setMonthlyRevenue(weeklyRevenue);
      setWeeklyOrders(data.weeklyOrders);
      setTopProducts(topProductsData);
      setLoaded(true);
    } catch (err: any) {
      console.error("Dashboard Error:", err);
      console.error("Error message:", err.message);
    }
  };

  useEffect(() => { getDashboard(); }, []);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const dateStr = time.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const timeStr = time.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />
      <AdminNav />

      <main className="flex-1 container mx-auto px-8 py-10 space-y-10">

        {/* ── HEADER BAND ── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#3d1a11] px-10 py-9 flex items-center justify-between shadow-xl">
          {/* decorative circles */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#722F37]/40 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-[#c9856b]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[#c9856b] text-sm font-semibold tracking-widest uppercase mb-1">
              {greeting}
            </p>
            <h1 className="text-white text-4xl font-serif font-bold leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-white/50 text-sm mt-2">{dateStr}</p>
          </div>

          <div className="relative z-10 text-right hidden md:block">
            <div className="text-white text-3xl font-mono font-bold tracking-wider tabular-nums">
              {timeStr}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-xs">Live</span>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            prefix="₹"
            icon={<IndianRupee size={20} />}
            color="emerald"
            delay={0}
            loaded={loaded}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingBag size={20} />}
            color="amber"
            delay={100}
            loaded={loaded}
          />
          <StatCard
            title="Active Sellers"
            value={stats.totalSellers}
            icon={<Package size={20} />}
            color="violet"
            delay={200}
            loaded={loaded}
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Users size={20} />}
            color="rose"
            delay={300}
            loaded={loaded}
          />
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <SectionLabel icon={<Activity size={14} />} text="Quick Actions" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            {[
              { label: "Manage Users",  path: "/admin/users",     emoji: "👥" },
              { label: "All Orders",    path: "/admin/orders",    emoji: "📦" },
              { label: "Discounts",     path: "/admin/discounts", emoji: "🏷️" },
              { label: "Awareness",     path: "/admin/awareness", emoji: "📖" },
            ].map(({ label, path, emoji }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="group relative overflow-hidden bg-white border border-[#E8DCCF] rounded-2xl px-6 py-5 text-left hover:border-[#722F37] hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#722F37]/0 to-[#722F37]/0 group-hover:from-[#722F37]/5 group-hover:to-[#722F37]/10 transition-all duration-300" />
                <span className="text-2xl mb-3 block">{emoji}</span>
                <p className="font-serif font-bold text-[#3d1a11] text-base relative z-10">{label}</p>
                <ArrowUpRight
                  size={16}
                  className="absolute top-4 right-4 text-gray-300 group-hover:text-[#722F37] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div>
          <SectionLabel icon={<TrendingUp size={14} />} text="Analytics Overview" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DCCF] p-7 shadow-sm hover:shadow-md transition-shadow">
              <RevenueChart title="Weekly Revenue Trends" data={monthlyRevenue} />
            </div>
            <div className="bg-white rounded-3xl border border-[#E8DCCF] p-7 shadow-sm hover:shadow-md transition-shadow">
              <TopProductsChart title="Top Selling Products" data={topProducts} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8DCCF] p-7 shadow-sm hover:shadow-md transition-shadow">
          <OrdersChart title="Weekly Order Volume" data={weeklyOrders} />
        </div>

      </main>

      <Footer />
    </div>
  );
};

/* ── Section Label ── */
const SectionLabel = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-[#722F37]">
    {icon}
    <span className="text-xs font-bold uppercase tracking-widest">{text}</span>
    <div className="flex-1 h-px bg-[#E8DCCF]" />
  </div>
);

/* ── Stat Card ── */
const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  emerald: { bg: "bg-emerald-50",  text: "text-emerald-600", ring: "ring-emerald-200", bar: "bg-emerald-400" },
  amber:   { bg: "bg-amber-50",    text: "text-amber-600",   ring: "ring-amber-200",   bar: "bg-amber-400"   },
  violet:  { bg: "bg-violet-50",   text: "text-violet-600",  ring: "ring-violet-200",  bar: "bg-violet-400"  },
  rose:    { bg: "bg-rose-50",     text: "text-rose-600",    ring: "ring-rose-200",    bar: "bg-rose-400"    },
};

const StatCard = ({
  title, value, prefix = "", icon, color, delay, loaded,
}: {
  title: string; value: number; prefix?: string;
  icon: React.ReactNode; color: string; delay: number; loaded: boolean;
}) => {
  const animated = useCountUp(loaded ? value : 0, 1400);
  const c = colorMap[color] ?? colorMap.rose;

  return (
    <div
      className="bg-white border border-[#E8DCCF] rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className={`w-11 h-11 rounded-2xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center mb-5 ${c.text} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      {/* Value */}
      <p className="text-[32px] font-bold text-[#3d1a11] leading-none tabular-nums">
        {prefix}{animated.toLocaleString("en-IN")}
      </p>

      {/* Label */}
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mt-2">
        {title}
      </p>

      {/* Decorative bar */}
      <div className="mt-5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: loaded ? "65%" : "0%" }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
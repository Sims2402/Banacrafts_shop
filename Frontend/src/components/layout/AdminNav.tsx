import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, Ticket, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users",     path: "/admin/users",      icon: Users           },
  { name: "Orders",    path: "/admin/orders",      icon: ShoppingBag     },
  { name: "Discounts", path: "/admin/discounts",   icon: Ticket          },
  { name: "Awareness", path: "/admin/awareness",   icon: BookOpen        },
];

const AdminNav = () => {
  const location = useLocation();
  const [indicatorY, setIndicatorY] = useState(0);
  const [mounted, setMounted] = useState(false);

  const activeIndex = navItems.findIndex(item => location.pathname === item.path);

  /* slide the pill to the active item */
  useEffect(() => {
    // each item is w-12 h-12 (48px) + gap-2 (8px) = 56px per step
    setIndicatorY(activeIndex >= 0 ? activeIndex * 56 : 0);
    setMounted(true);
  }, [activeIndex]);

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 select-none">

      {/* ── pill container ── */}
      <div className="relative bg-white/60 backdrop-blur-2xl border border-[#E8DCCF]/60 rounded-[28px] p-2 shadow-[0_12px_40px_rgba(61,26,17,0.12)] flex flex-col gap-2">

        {/* sliding active background pill */}
        {activeIndex >= 0 && (
          <div
            className="absolute left-2 w-12 h-12 rounded-[20px] bg-[#722F37] shadow-lg shadow-[#722F37]/35 pointer-events-none"
            style={{
              top: `${8 + indicatorY}px`,
              transition: mounted
                ? "top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "none",
            }}
          />
        )}

        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="group relative flex items-center justify-center w-12 h-12"
              aria-label={item.name}
            >
              {/* icon — sits above the sliding pill */}
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-white scale-110"
                      : "text-[#722F37]/45 group-hover:text-[#722F37] group-hover:scale-110"
                  }`}
                />
              </div>

              {/* hover tooltip */}
              <div
                className="
                  absolute left-[calc(100%+14px)] z-50
                  opacity-0 group-hover:opacity-100
                  -translate-x-2 group-hover:translate-x-0
                  transition-all duration-200 ease-out
                  pointer-events-none
                "
              >
                <div className="relative flex items-center">
                  {/* arrow */}
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#3d1a11]" />
                  {/* label */}
                  <div className="bg-[#3d1a11] text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3.5 py-2 rounded-xl shadow-xl whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* bottom subtle brand dot */}
        <div className="mt-1 mb-0.5 flex justify-center">
          <div className="w-1 h-1 rounded-full bg-[#722F37]/25" />
        </div>
      </div>

      {/* outer glow when something is active */}
      {activeIndex >= 0 && (
        <div className="absolute inset-0 rounded-[28px] ring-1 ring-[#722F37]/15 pointer-events-none" />
      )}
    </nav>
  );
};

export default AdminNav;
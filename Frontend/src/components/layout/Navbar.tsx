import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart, Heart, Menu, X,
  LayoutDashboard, LogOut, ChevronDown, Package, UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home",      path: "/" },
  { name: "Products",  path: "/products" },
  { name: "Artisans",  path: "/artisans" },
  { name: "Awareness", path: "/awareness" },
  { name: "About",     path: "/about" },
];

const getDashboardLink = (role?: string | null) => {
  switch (role) {
    case "admin":    return "/admin/dashboard";
    case "seller":   return "/seller/dashboard";
    case "customer": return "/customer/dashboard";
    default:         return "/login";
  }
};

/* ── Badge ── */
const Badge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-[#722F37] text-[9px] font-black text-white leading-none px-1 shadow-md shadow-[#722F37]/30">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

/* ── UserAvatar — shows uploaded photo OR gradient initials ── */
const UserAvatar = ({
  name, avatar, size = "sm",
}: {
  name?: string; avatar?: string | null; size?: "sm" | "md";
}) => {
  const sizeClass = size === "sm" ? "w-7 h-7 text-[11px]" : "w-9 h-9 text-sm";
  const initials = (name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 border border-white/60`}>
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gradient-to-br from-[#722F37] to-[#c9856b] flex items-center justify-center text-white font-black">{initials}</div>
      }
    </div>
  );
};

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, wishlist } = useCart();
  const location = useLocation();

  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const userMenuRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#FDF8F4]/98 backdrop-blur-xl shadow-[0_2px_24px_rgba(61,26,17,0.08)] border-b border-[#E8DCCF]/80"
          : "bg-[#FDF8F4]/95 backdrop-blur-md border-b border-[#E8DCCF]"
      }`}>
        <div className={`container flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? "h-14" : "h-16 md:h-20"}`}>

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <img src={logo} alt="BanaCrafts"
                className={`rounded-full object-cover border border-[#E8DCCF] transition-all duration-300 ${scrolled ? "h-8 w-8" : "h-10 w-10 md:h-11 md:w-11"}`}
              />
              <div className="absolute inset-0 rounded-full ring-2 ring-[#722F37]/0 group-hover:ring-[#722F37]/30 transition-all duration-300" />
            </div>
            <span className={`font-serif font-bold text-[#3d1a11] tracking-tight group-hover:text-[#722F37] transition-all duration-300 ${scrolled ? "text-lg" : "text-xl md:text-2xl"}`}>
              BanaCrafts
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path}
                  className="relative group text-[12px] uppercase tracking-[0.12em] font-bold transition-colors duration-200"
                >
                  <span className={isActive ? "text-[#722F37]" : "text-gray-400 group-hover:text-[#722F37]"}>
                    {link.name}
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#722F37] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-1">

            {/* Wishlist */}
            <Link to="/customer/wishlist" className="relative p-2.5 text-gray-400 hover:text-[#722F37] transition-colors rounded-xl hover:bg-[#722F37]/5">
              <Heart className="h-[18px] w-[18px]" />
              <Badge count={wishlist.length} />
            </Link>

            {/* Cart */}
            <Link to="/customer/cart" className="relative p-2.5 text-gray-400 hover:text-[#722F37] transition-colors rounded-xl hover:bg-[#722F37]/5">
              <ShoppingCart className="h-[18px] w-[18px]" />
              <Badge count={totalItems} />
            </Link>

            {/* User area — desktop */}
            <div className="hidden md:block ml-1">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>

                  {/* trigger button */}
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl border border-[#E8DCCF] bg-white hover:border-[#722F37]/40 hover:shadow-sm transition-all duration-200"
                  >
                    {/* ✅ shows photo if uploaded, else initials */}
                    <UserAvatar name={user?.name} avatar={user?.avatar} size="sm" />
                    <span className="text-[11px] font-bold text-[#3d1a11] max-w-[80px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl border border-[#E8DCCF] shadow-[0_8px_32px_rgba(61,26,17,0.12)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                      {/* header with avatar */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#FDF8F4] border-b border-[#E8DCCF]">
                        <UserAvatar name={user?.name} avatar={user?.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-[#3d1a11] uppercase tracking-widest truncate">{user?.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize mt-0.5">{user?.role}</p>
                        </div>
                      </div>

                      <div className="py-1.5">
                        <DropdownItem to={getDashboardLink(user?.role)} icon={<LayoutDashboard size={14} />} label="Dashboard" />
                        {/* ✅ Edit Profile link */}
                        <DropdownItem to="/profile/edit"                icon={<UserCog size={14} />}         label="Edit Profile" />
                        <DropdownItem to="/customer/orders"             icon={<Package size={14} />}         label="My Orders" />
                        <DropdownItem to="/customer/wishlist"           icon={<Heart size={14} />}           label="Wishlist" badge={wishlist.length} />
                      </div>

                      <div className="border-t border-[#E8DCCF] py-1.5">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-[12px] font-bold uppercase tracking-widest"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="ml-1">
                  <Button className="bg-[#722F37] hover:bg-[#3d1a11] text-white rounded-2xl px-5 h-9 font-bold text-[11px] uppercase tracking-widest shadow-md shadow-[#722F37]/20 transition-all duration-200">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 ml-1 rounded-xl text-[#3d1a11] hover:bg-[#722F37]/5 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <Menu size={20} className={`absolute inset-0 transition-all duration-200 ${mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
                <X    size={20} className={`absolute inset-0 transition-all duration-200 ${mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#FDF8F4] shadow-2xl md:hidden transition-transform duration-300 ease-out flex flex-col ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DCCF]">
          <span className="font-serif font-bold text-[#3d1a11] text-lg">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl hover:bg-[#722F37]/10 text-[#3d1a11] transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4 gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all ${isActive ? "bg-[#722F37] text-white shadow-md shadow-[#722F37]/30" : "text-gray-500 hover:bg-[#722F37]/8 hover:text-[#722F37]"}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E8DCCF] px-4 py-5">
          {isAuthenticated ? (
            <div className="space-y-2">
              {/* user card with avatar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#E8DCCF]">
                <UserAvatar name={user?.name} avatar={user?.avatar} size="md" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#3d1a11] truncate">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <Link to={getDashboardLink(user?.role)} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#722F37] hover:bg-[#722F37]/8 transition-colors">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              {/* ✅ Edit Profile in mobile drawer */}
              <Link to="/profile/edit" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">
                <UserCog size={14} /> Edit Profile
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#722F37] hover:bg-[#3d1a11] text-white rounded-2xl h-11 font-bold text-[11px] uppercase tracking-widest shadow-md">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

/* ── Dropdown item ── */
const DropdownItem = ({ to, icon, label, badge }: {
  to: string; icon: React.ReactNode; label: string; badge?: number;
}) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#722F37] hover:bg-[#722F37]/5 transition-colors">
    <span className="text-gray-400">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge != null && badge > 0 && (
      <span className="text-[9px] font-black bg-[#722F37] text-white rounded-full px-1.5 py-0.5 leading-none">{badge}</span>
    )}
  </Link>
);

export default Navbar;
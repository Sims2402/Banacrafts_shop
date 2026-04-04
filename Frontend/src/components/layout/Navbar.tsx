import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, Menu, X,
  LayoutDashboard, LogOut, ChevronDown, Package, UserCog, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { isSellerPortalContext } from "@/lib/sellerPortal";
import logo from "@/assets/logo.png";

/* ---------------- NAV LINKS ---------------- */
const publicNavLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Artisans", path: "/artisans" },
  { name: "Awareness", path: "/awareness" },
  { name: "About", path: "/about" },
];

const sellerNavLinks = [
  { name: "Dashboard", path: "/seller/dashboard" },
  { name: "My Products", path: "/seller/products" },
  { name: "Orders", path: "/seller/orders" },
  { name: "Discounts", path: "/seller/discounts" },
];

/* ---------------- HELPERS ---------------- */
const getDashboardLink = (role?: string | null) => {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "seller": return "/seller/dashboard";
    case "customer": return "/customer/dashboard";
    default: return "/login";
  }
};

/* Badge */
const Badge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-[#722F37] text-[9px] text-white">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

/* Avatar */
const UserAvatar = ({ name, avatar }: { name?: string; avatar?: string | null }) => {
  const initials = (name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden">
      {avatar
        ? <img src={avatar} className="w-full h-full object-cover" />
        : <div className="bg-[#722F37] text-white flex items-center justify-center w-full h-full text-sm font-bold">{initials}</div>}
    </div>
  );
};

/* ================= NAVBAR ================= */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, wishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const sellerPortal = isSellerPortalContext(location.pathname, user?.role);
  const navLinks = sellerPortal ? sellerNavLinks : publicNavLinks;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showCustomerCommerce =
    !sellerPortal &&
    (!isAuthenticated || user?.role === "customer");

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#FDF8F4] border-b">
        <div className="container flex items-center justify-between px-6 h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} className="h-10 w-10 rounded-full" />
            <span className="font-bold text-[#3d1a11] text-xl">BanaCrafts</span>
          </Link>

          {/* NAV */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`text-sm ${location.pathname === link.path ? "text-[#722F37]" : "text-gray-500"}`}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            {/* Search */}
            {!sellerPortal && (
              <Search className="hidden md:block text-gray-500" size={18} />
            )}

            {/* Wishlist + Cart */}
            {showCustomerCommerce && (
              <>
                <Link to="/customer/wishlist" className="relative">
                  <Heart size={18} />
                  <Badge count={wishlist.length} />
                </Link>
                <Link to="/customer/cart" className="relative">
                  <ShoppingCart size={18} />
                  <Badge count={totalItems} />
                </Link>
              </>
            )}

            {/* USER */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
                  <UserAvatar name={user?.name} avatar={user?.avatar} />
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-white border rounded-lg shadow-md">
                    <Link to={getDashboardLink(user?.role)} className="block px-4 py-2">Dashboard</Link>
                    <Link to="/profile/edit" className="block px-4 py-2">Edit Profile</Link>
                    <button
                      onClick={() => { logout(); navigate("/login"); }}
                      className="block w-full text-left px-4 py-2 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}

            {/* MOBILE */}
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
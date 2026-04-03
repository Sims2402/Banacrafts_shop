import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Menu, X, Heart, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { isSellerPortalContext } from "@/lib/sellerPortal";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, wishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const sellerPortal = isSellerPortalContext(location.pathname, user?.role);

  const publicNavLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Artisans", path: "/artisans" },
    { name: "About", path: "/about" },
    { name: "Awareness", path: "/awareness" },
  ];

  const sellerNavLinks = [
    { name: "Dashboard", path: "/seller/dashboard" },
    { name: "My Products", path: "/seller/products" },
    { name: "Orders", path: "/seller/orders" },
    { name: "Discounts", path: "/seller/discounts" },
    { name: "Artisans", path: "/artisans" },
    { name: "Awareness", path: "/awareness" },
  ];

  const navLinks = sellerPortal ? sellerNavLinks : publicNavLinks;

  const homePath = sellerPortal
    ? "/seller/dashboard"
    : user?.role === "customer"
      ? "/customer/dashboard"
      : "/";

  const getDashboardLink = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/dashboard";
      case "seller":
        return "/seller/dashboard";
      case "customer":
        return "/customer/dashboard";
      default:
        return "/login";
    }
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const showCustomerCommerce =
    !sellerPortal &&
    !isAdmin &&
    (!isAuthenticated || user?.role === "customer");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to={homePath} className="flex items-center gap-2">
          <img
            src={logo}
            alt="BanaCrafts"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
          />
          <span className="font-heading text-xl font-bold text-primary md:text-2xl">
            BanaCrafts
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActivePath(link.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {!sellerPortal && (
            <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
          )}

          {showCustomerCommerce && (
            <>
              <Link to="/customer/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <span className="sr-only">Wishlist</span>
                  <Heart className="h-5 w-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {wishlist.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/customer/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <span className="sr-only">Cart</span>
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="relative hidden md:flex items-center">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user?.name}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-44 bg-white border rounded-lg shadow-md z-50">
                  <Link
                    to={getDashboardLink()}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile/edit"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="default" size="sm">
                <User className="h-4 w-4 mr-1" />
                Login
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container flex flex-col py-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActivePath(link.path)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {showCustomerCommerce && (
              <div className="flex gap-2 pt-2 border-t border-border mt-2">
                <Link
                  to="/customer/wishlist"
                  className="flex-1 text-center py-2 text-sm border rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  to="/customer/cart"
                  className="flex-1 text-center py-2 text-sm border rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart
                </Link>
              </div>
            )}
            <div className="border-t border-border pt-4 mt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block py-2 text-sm font-medium text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile/edit"
                    className="block py-2 text-sm font-medium text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="py-2 text-sm font-medium text-muted-foreground w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block py-2 text-sm font-medium text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

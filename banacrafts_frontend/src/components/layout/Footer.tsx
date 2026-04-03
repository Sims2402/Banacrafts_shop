import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { isSellerPortalContext } from "@/lib/sellerPortal";

const Footer = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sellerPortal = isSellerPortalContext(location.pathname, user?.role);
  const isAdmin = user?.role === "admin";

  const publicQuickLinks = [
    { name: "Products", path: "/products" },
    { name: "Artisans", path: "/artisans" },
    { name: "About Us", path: "/about" },
    { name: "Awareness", path: "/awareness" },
  ];

  const sellerQuickLinks = [
    { name: "Dashboard", path: "/seller/dashboard" },
    { name: "My Products", path: "/seller/products" },
    { name: "Orders", path: "/seller/orders" },
    { name: "Discounts", path: "/seller/discounts" },
    { name: "Artisans", path: "/artisans" },
    { name: "Awareness", path: "/awareness" },
    { name: "Edit Profile", path: "/profile/edit" },
  ];

  const adminQuickLinks = [
    { name: "Admin Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Awareness", path: "/admin/awareness" },
  ];

  const quickLinks = sellerPortal
    ? sellerQuickLinks
    : isAdmin
      ? adminQuickLinks
      : publicQuickLinks;

  const brandHref =
    sellerPortal ? "/seller/dashboard" : isAdmin ? "/admin/dashboard" : "/";

  return (
    <footer className="bg-heritage-brown text-heritage-cream">
      <div className="container py-12 md:py-16">
        <div
          className={`grid gap-8 md:grid-cols-2 ${
            sellerPortal ? "lg:grid-cols-3" : isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-4"
          }`}
        >
          <div className="space-y-4">
            <Link to={brandHref} className="flex items-center gap-3">
              <img src={logo} alt="BanaCrafts" className="h-12 w-12 rounded-full" />
              <span className="font-heading text-2xl font-bold">BanaCrafts</span>
            </Link>
            <p className="text-sm text-heritage-cream/80 leading-relaxed">
              {sellerPortal
                ? "Manage your store and orders from your seller portal."
                : "Empowering women artisans of Banasthali through authentic handcrafted treasures. Every purchase supports traditional crafts and sustainable livelihoods."}
            </p>
            {!sellerPortal && (
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-heritage-cream/60 hover:text-heritage-gold transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-heritage-cream/60 hover:text-heritage-gold transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-heritage-cream/60 hover:text-heritage-gold transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">
              {sellerPortal || isAdmin ? "Portal" : "Quick Links"}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path + link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-heritage-cream/80 hover:text-heritage-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {!sellerPortal && (
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">
                Customer Service
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Track Order", path: "/support/track-order" },
                  { name: "Returns & Refunds", path: "/support/returns-refunds" },
                  { name: "Shipping Info", path: "/support/shipping-info" },
                  { name: "FAQs", path: "/support/faqs" },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.path}
                      className="text-sm text-heritage-cream/80 hover:text-heritage-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-heritage-cream/80">
                <MapPin className="h-5 w-5 flex-shrink-0 text-heritage-gold" />
                <span>Banasthali Vidyapith, Tonk District, Rajasthan - 304022</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-heritage-cream/80">
                <Phone className="h-5 w-5 text-heritage-gold" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-heritage-cream/80">
                <Mail className="h-5 w-5 text-heritage-gold" />
                <span>contact@banacrafts.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-heritage-cream/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-heritage-cream/60">
              © 2024 BanaCrafts. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                to="#"
                className="text-sm text-heritage-cream/60 hover:text-heritage-gold transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-sm text-heritage-cream/60 hover:text-heritage-gold transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

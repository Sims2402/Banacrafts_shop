import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-heritage-brown text-heritage-cream">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="BanaCrafts" className="h-12 w-12 rounded-full" />
              <span className="font-heading text-2xl font-bold">BanaCrafts</span>
            </Link>
            <p className="text-sm text-heritage-cream/80 leading-relaxed">
              Empowering women artisans of Banasthali through authentic handcrafted treasures.
              Every purchase supports traditional crafts and sustainable livelihoods.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-heritage-cream/60 hover:text-heritage-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-heritage-cream/60 hover:text-heritage-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-heritage-cream/60 hover:text-heritage-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Products", path: "/products" },
                { name: "Artisans", path: "/artisans" },
                { name: "About Us", path: "/about" },
                { name: "Awareness", path: "/awareness" },
              ].map((link) => (
                <li key={link.path}>
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

          {/* Customer Service */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Customer Service</h3>
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

          {/* Contact */}
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

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-heritage-cream/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-heritage-cream/60">
              © 2024 BanaCrafts. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-sm text-heritage-cream/60 hover:text-heritage-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-heritage-cream/60 hover:text-heritage-gold transition-colors">
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import Products from "./pages/public/Products";
import ProductDetail from "./pages/public/ProductDetail";
import Artisans from "./pages/public/Artisans";
import ArtisanDetail from "./pages/public/ArtisanDetail";
import About from "./pages/public/About";
import Awareness from "./pages/public/Awareness";
import AwarenessArticle from "./pages/public/AwarenessArticle";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ForgotPassword from "./pages/public/ForgotPassword";
import VerifyOTP from "./pages/public/VerifyOTP";
import ResetPassword from "./pages/public/ResetPassword";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Cart from "./pages/customer/Cart";
import Wishlist from "./pages/customer/Wishlist";
import Checkout from "./pages/customer/Checkout";
import OrderSuccess from "./pages/customer/OrderSuccess";
import CustomerOrders from "./pages/customer/CustomerOrders";

// Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerDiscounts from "./pages/seller/SellerDiscounts";
import SellerReviews from "./pages/seller/SellerReviews";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminAwareness from "./pages/admin/AdminAwareness";

// Support Pages
import ReturnsRefunds from "./pages/support/ReturnsRefunds";
import ShippingInfo from "./pages/support/ShippingInfo";
import FAQs from "./pages/support/FAQs";
import TrackOrder from "./pages/support/TrackOrder";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/artisans" element={<Artisans />} />
              <Route path="/artisans/:id" element={<ArtisanDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/awareness/:id" element={<AwarenessArticle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Support Routes (Public) */}
              <Route path="/support/returns-refunds" element={<ReturnsRefunds />} />
              <Route path="/support/shipping-info" element={<ShippingInfo />} />
              <Route path="/support/faqs" element={<FAQs />} />
              <Route path="/support/track-order" element={<TrackOrder />} />

              {/* Customer Routes */}
              <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/customer/cart" element={<Cart />} />
              <Route path="/customer/wishlist" element={<Wishlist />} />
              <Route path="/customer/checkout" element={<ProtectedRoute allowedRoles={["customer", "seller", "admin"]}><Checkout /></ProtectedRoute>} />
              <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={["customer", "seller", "admin"]}><CustomerOrders /></ProtectedRoute>} />
              <Route
  path="/order/success/:id"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <OrderSuccess />
    </ProtectedRoute>
  }
/>


              {/* Seller Routes */}
              <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={["seller"]}><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/products" element={<ProtectedRoute allowedRoles={["seller"]}><SellerProducts /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={["seller"]}><SellerOrders /></ProtectedRoute>} />
              <Route path="/seller/discounts" element={<ProtectedRoute allowedRoles={["seller"]}><SellerDiscounts /></ProtectedRoute>} />
              <Route path="/seller/reviews" element={<ProtectedRoute allowedRoles={["seller"]}><SellerReviews /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/discounts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDiscounts /></ProtectedRoute>} />
              <Route path="/admin/awareness" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAwareness /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

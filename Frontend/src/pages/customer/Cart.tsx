import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
const getProductId = (product: any) => product._id || product.id;

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-heading text-2xl font-bold">Your Cart is Empty</h1>
            <p className="text-muted-foreground mt-2">Discover our handcrafted collection</p>
            <Link to="/products"><Button variant="heritage" className="mt-6">Shop Now</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
<div
  key={getProductId(product)
}
  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
>
                 <img
  src={product.images?.[0]?.url || "/placeholder.png"}
  alt={product.name}
  className="h-24 w-24 rounded-lg object-cover"
/>
                  <div className="flex-1">
                    <Link to={`/products/${getProductId(product)
}`} className="font-heading font-semibold hover:text-primary">{product.name}</Link>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="font-semibold text-primary mt-1">₹{product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(getProductId(product)
)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    <div className="flex items-center border border-border rounded">
<button onClick={() => updateQuantity(getProductId(product)
, quantity - 1)} className="p-1 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                      <span className="px-3 text-sm">{quantity}</span>
<button onClick={() => updateQuantity(getProductId(product)
, quantity + 1)} className="p-1 hover:bg-muted"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card p-6 rounded-xl border border-border h-fit sticky top-24">
              <h2 className="font-heading text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600">Free</span></div>
              </div>
              <div className="border-t border-border my-4 pt-4 flex justify-between font-semibold text-lg">
                <span>Total</span><span className="text-primary">₹{totalPrice.toLocaleString()}</span>
              </div>
              <Link to="/customer/checkout"><Button variant="heritage" size="lg" className="w-full gap-2">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

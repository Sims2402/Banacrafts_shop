import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
const getProductId = (product: any) => product._id || product.id;
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-heading text-2xl font-bold">Your Wishlist is Empty</h1>
            <p className="text-muted-foreground mt-2">Save items you love for later</p>
            <Link to="/products"><Button variant="heritage" className="mt-6">Browse Products</Button></Link>
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
          <h1 className="font-heading text-3xl font-bold mb-8">My Wishlist ({wishlist.length} items)</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((product) => (
              <div key={product.id} className="heritage-card">
                <div className="aspect-square overflow-hidden">
                  <Link to={`/products/${product.id}`}><img
  src={product.images?.[0]?.url || "/placeholder.png"}
  alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform" /></Link>
                </div>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}><h3 className="font-heading font-semibold line-clamp-1 hover:text-primary">{product.name}</h3></Link>
                  <p className="font-semibold text-primary mt-1">₹{product.price.toLocaleString()}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="heritage" size="sm" className="flex-1 gap-1" onClick={() => addToCart(product)}><ShoppingCart className="h-4 w-4" />Add</Button>
                    <Button variant="outline" size="sm" onClick={() => removeFromWishlist(getProductId(product))}><Heart className="h-4 w-4 fill-primary text-primary" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;

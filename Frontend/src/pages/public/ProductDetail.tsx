import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import { api } from "@/api/api";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
const [product, setProduct] = useState<any | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const data = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error("Failed to fetch product", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchProduct();
}, [id]);

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading product...</p>
    </div>
  );
}

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold">Product Not Found</h1>
            <Link to="/products" className="text-primary hover:underline mt-2 inline-block">
              Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
//const artisan = getArtisanById(product.artisanId);

  const artisan = null;
  // const relatedProducts = products
  //   .filter((p) => p.category === product.category && p.id !== product.id)
  //   .slice(0, 4);
    const relatedProducts: any[] = [];

  const inWishlist = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          {/* Product Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className="h-full w-full object-cover"
              />

              {discount > 0 && (
                <span className="absolute left-4 top-4 px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {product.category}
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl font-bold text-primary">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="heritage-badge">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Material */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Material:</span>
                <span className="text-sm text-muted-foreground">{product.material}</span>
              </div>

              {/* Artisan */}
              {/*{artisan && (
                <Link
                  to={`/artisans/${artisan.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
                >
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Crafted by</p>
                    <p className="font-medium text-foreground">{artisan.name}</p>
                    <p className="text-sm text-secondary">{artisan.specialty}</p>
                  </div>
                </Link>
              )}
                */}
              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-lg hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-lg hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button
                  variant="heritage"
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => addToCart(product, quantity)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                >
                  <Heart className={inWishlist ? "fill-primary text-primary" : ""} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, text: "Free Shipping" },
                  { icon: Shield, text: "Secure Payment" },
                  { icon: RotateCcw, text: product.returnPolicy },
                ].map((feature, idx) => (
                  <div key={idx} className="text-center">
                    <feature.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {/*{relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="font-heading text-2xl font-bold mb-8">
                You May Also Like
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
            */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

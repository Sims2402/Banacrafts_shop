import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import type { Product } from "@/data/products";
import type { Artisan } from "@/data/artisans";
import { mapMongoDocToProduct } from "@/lib/mapMongoProduct";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const API = "http://localhost:5000";

type SellerShape = {
  _id: string;
  name?: string;
  profilePicture?: string;
  role?: string;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } =
    useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState("");

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await fetch(`${API}/api/products/${id}`);
        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setProduct(null);
          }
          return;
        }
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as Record<string, unknown>;
        if (cancelled) return;

        const mapped = mapMongoDocToProduct(data);
        setProduct(mapped);

        const sellerRaw = data.seller;
        if (
          sellerRaw &&
          typeof sellerRaw === "object" &&
          "_id" in sellerRaw &&
          (sellerRaw as SellerShape).role === "seller"
        ) {
          const s = sellerRaw as SellerShape;
          setArtisan({
            id: String(s._id),
            name: s.name || "Seller",
            specialty: mapped.category || "Handmade products",
            experience: 0,
            location: "",
            image: s.profilePicture || "",
            bio: "",
            achievements: [],
            productsCount: 0,
          });
        } else if (mapped.artisanId) {
          setArtisan({
            id: mapped.artisanId,
            name: "Seller",
            specialty: mapped.category || "Handmade products",
            experience: 0,
            location: "",
            image: "",
            bio: "",
            achievements: [],
            productsCount: 0,
          });
        } else {
          setArtisan(null);
        }

        const listRes = await fetch(`${API}/api/products`);
        if (listRes.ok && !cancelled) {
          const json = await listRes.json();
          const raw = Array.isArray(json?.products) ? json.products : [];
          const related = raw
            .filter(
              (p: { _id?: string; category?: string }) =>
                String(p._id) !== id &&
                String(p.category || "") === mapped.category &&
                mapped.category !== ""
            )
            .slice(0, 4)
            .map((p: Record<string, unknown>) => mapMongoDocToProduct(p));
          setRelatedProducts(related);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
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

  const inWishlist = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const submitRating = async (value: number) => {
    if (!user?.id || !id) return;
    setRatingError("");
    setRatingBusy(true);
    try {
      const res = await fetch(`${API}/api/products/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, value }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        setRatingError(
          typeof data.error === "string" ? data.error : "Could not save rating"
        );
        return;
      }
      setProduct(mapMongoDocToProduct(data));
    } catch {
      setRatingError("Something went wrong");
    } finally {
      setRatingBusy(false);
    }
  };

  const canRate =
    isAuthenticated &&
    user?.role === "customer" &&
    Boolean(user?.id) &&
    String(product.artisanId) !== String(user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
              {discount > 0 && (
                <span className="absolute left-4 top-4 px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {product.category}
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.rating)
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating > 0 ? product.rating.toFixed(1) : "—"} ·{" "}
                  {product.numRatings} rating{product.numRatings === 1 ? "" : "s"}
                </span>
              </div>

              {canRate && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Rate this product
                  </p>
                  <div className="flex flex-wrap items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        disabled={ratingBusy}
                        onClick={() => submitRating(n)}
                        className="p-1 rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                        aria-label={`Rate ${n} out of 5`}
                      >
                        <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                      </button>
                    ))}
                  </div>
                  {ratingError ? (
                    <p className="text-sm text-destructive">{ratingError}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Tap a star to submit or update your rating.
                  </p>
                </div>
              )}

              {!isAuthenticated ? (
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>{" "}
                  as a customer to rate this product.
                </p>
              ) : null}

              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl font-bold text-primary">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice != null && product.originalPrice > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="heritage-badge">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Material:</span>
                <span className="text-sm text-muted-foreground">{product.material}</span>
              </div>

              {artisan && (
                <Link
                  to={`/artisans/${artisan.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
                >
                  {artisan.image ? (
                    <img
                      src={artisan.image}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      Seller
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Crafted by</p>
                    <p className="font-medium text-foreground">{artisan.name}</p>
                    <p className="text-sm text-secondary">{artisan.specialty}</p>
                  </div>
                </Link>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-lg hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    type="button"
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
                  onClick={() =>
                    inWishlist
                      ? removeFromWishlist(product.id)
                      : addToWishlist(product)
                  }
                >
                  <Heart className={inWishlist ? "fill-primary text-primary" : ""} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, text: "Shipping per store policy" },
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

          {relatedProducts.length > 0 && (
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Award, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import type { Artisan } from "@/data/artisans";
import type { Product } from "@/data/products";

const API = "http://localhost:5000";

function mapMongoProductToCard(p: Record<string, unknown>, artisanId: string): Product {
  const images = Array.isArray(p.images)
    ? (p.images as { url?: string }[]).map((i) => i?.url).filter(Boolean)
    : [];
  const primary =
    (typeof images[0] === "string" && images[0]) || "";

  return {
    id: String(p._id),
    name: String(p.name || "Product"),
    description: String(p.description || ""),
    price: Number(p.price) || 0,
    originalPrice:
      p.originalPrice != null ? Number(p.originalPrice) : undefined,
    image: primary,
    images: images.length ? (images as string[]) : primary ? [primary] : [],
    category: String(p.category || ""),
    material: String(p.material || ""),
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    artisanId,
    inStock: p.inStock !== false && p.available !== false,
    isReturnable: p.returnable === true,
    rating: 0,
    reviews: 0,
    returnPolicy: "",
  };
}

const ArtisanDetail = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [artisanProducts, setArtisanProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        const res = await fetch(`${API}/api/artisans/${id}`);
        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setArtisan(null);
          }
          return;
        }
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (cancelled) return;
        setArtisan(data.artisan as Artisan);
        const rawProducts = Array.isArray(data.products) ? data.products : [];
        setArtisanProducts(
          rawProducts.map((p: Record<string, unknown>) =>
            mapMongoProductToCard(p, String(id))
          )
        );
        setNotFound(false);
      } catch {
        if (!cancelled) setNotFound(true);
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

  if (notFound || !artisan) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold">
              Artisan not found
            </h1>
            <Link
              to="/artisans"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Back to Artisans
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          <Link
            to="/artisans"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Artisans
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted sticky top-24">
                {artisan.image ? (
                  <img
                    src={artisan.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground p-6 text-center">
                    No profile photo
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-heading text-4xl font-bold text-foreground">
                  {artisan.name}
                </h1>
                <p className="text-xl text-secondary font-medium mt-2">
                  {artisan.specialty}
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                {artisan.location ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{artisan.location}</span>
                  </div>
                ) : null}
                {artisan.experience > 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-5 w-5 text-accent" />
                    <span>
                      {artisan.experience} year
                      {artisan.experience !== 1 ? "s" : ""} on BanaCrafts
                    </span>
                  </div>
                ) : null}
              </div>

              {artisan.bio ? (
                <div>
                  <h2 className="font-heading text-xl font-semibold mb-3">
                    About
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {artisan.bio}
                  </p>
                </div>
              ) : null}

              {artisan.achievements && artisan.achievements.length > 0 ? (
                <div>
                  <h2 className="font-heading text-xl font-semibold mb-4">
                    Achievements
                  </h2>
                  <ul className="space-y-3">
                    {artisan.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground">
                          {achievement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {artisanProducts.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-semibold mb-6">
                    Products by {artisan.name}
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {artisanProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanDetail;

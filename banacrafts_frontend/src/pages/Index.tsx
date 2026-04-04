import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Heart, Users, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import ArtisanCard from "@/components/common/ArtisanCard";
import type { Artisan } from "@/data/artisans";
import type { Product } from "@/data/products";
import { mapMongoDocToProduct } from "@/lib/mapMongoProduct";
import { fetchJsonArray } from "@/lib/fetchJsonArray";
import { normalizeArtisansList } from "@/lib/normalizeArtisan";
import {
  normalizeAwarenessList,
  type AwarenessArticleClient,
} from "@/lib/normalizeAwareness";
import heroBanner from "@/assets/hero-banner.jpg";
import { apiUrl } from "@/lib/apiBase";

const Index = () => {
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [awarenessPreview, setAwarenessPreview] = useState<AwarenessArticleClient[]>(
    []
  );
  const [loadingArtisans, setLoadingArtisans] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingAwareness, setLoadingAwareness] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingArtisans(true);
        const raw = await fetchJsonArray(apiUrl("/api/artisans")).catch(() => []);
        if (!cancelled) {
          setFeaturedArtisans(normalizeArtisansList(raw).slice(0, 3));
        }
      } catch {
        if (!cancelled) setFeaturedArtisans([]);
      } finally {
        if (!cancelled) setLoadingArtisans(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingAwareness(true);
        const raw = await fetchJsonArray(apiUrl("/api/awareness")).catch(() => []);
        if (!cancelled) {
          setAwarenessPreview(normalizeAwarenessList(raw).slice(0, 3));
        }
      } catch {
        if (!cancelled) setAwarenessPreview([]);
      } finally {
        if (!cancelled) setLoadingAwareness(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProducts(true);
        const res = await fetch(apiUrl("/api/products"));
        if (!res.ok) throw new Error("products");
        const json = await res.json();
        const raw = Array.isArray(json?.products) ? json.products : [];
        const mapped = raw
          .slice(0, 8)
          .map((p: Record<string, unknown>) => mapMongoDocToProduct(p));
        if (!cancelled) setFeaturedProducts(mapped.slice(0, 4));
      } catch {
        if (!cancelled) setFeaturedProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const features = [
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable materials and natural dyes",
    },
    {
      icon: Heart,
      title: "Handcrafted with Love",
      description: "Every piece tells a unique story",
    },
    {
      icon: Users,
      title: "Women Empowerment",
      description: "Supporting artisan communities",
    },
  ];

  const storyImage = featuredArtisans[0]?.image;
  const maxSellerYears = featuredArtisans.length
    ? Math.max(...featuredArtisans.map((a) => a.experience || 0))
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroBanner}
              alt="Artisan weaving"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-heritage-brown/90 via-heritage-brown/70 to-transparent" />
          </div>

          <div className="container relative py-24 md:py-32 lg:py-40">
            <div className="max-w-2xl space-y-6 animate-fade-in">
              <span className="heritage-badge-accent">
                Authentic Handcrafted Treasures
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-heritage-cream leading-tight">
                Threads of Tradition,
                <br />
                <span className="text-heritage-gold">Woven with Love</span>
              </h1>
              <p className="text-lg text-heritage-cream/90 leading-relaxed max-w-xl">
                Discover exquisite handmade crafts from the talented women artisans of
                Banasthali. Each piece carries centuries of tradition and a promise of sustainability.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/products">
                  <Button variant="hero" size="xl">
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/artisans">
                  <Button variant="outline" size="xl" className="border-heritage-cream text-heritage-cream hover:bg-heritage-cream hover:text-heritage-brown">
                    Meet Our Artisans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-card border-y border-border">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="heritage-section">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                  Featured Products
                </h2>
                <p className="text-muted-foreground mt-2">
                  From our live catalog
                </p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="hidden md:flex gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loadingProducts && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Loading products…
              </p>
            )}
            {!loadingProducts && featuredProducts.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground">
                  No products are listed yet. Check back soon.
                </p>
              </div>
            )}
            {!loadingProducts && featuredProducts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link to="/products">
                <Button variant="outline" className="gap-2">
                  View All Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-heritage-maroon text-heritage-cream">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <span className="text-heritage-gold font-medium">Our Story</span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
                  Preserving Heritage,
                  <br />
                  Empowering Artisans
                </h2>
                <p className="text-heritage-cream/90 leading-relaxed">
                  BanaCrafts is born from the rich tradition of Banasthali Vidyapith, where
                  generations of women have mastered the art of handcrafting. We bring their
                  extraordinary creations to you, ensuring fair wages and preserving ancient techniques.
                </p>
                <ul className="space-y-3">
                  {[
                    "Skilled women sellers on the platform",
                    "Traditional techniques passed down generations",
                    "Eco-friendly and sustainable practices",
                    "Fair trade and direct artisan support",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-heritage-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/about">
                  <Button variant="accent" size="lg" className="mt-4">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-elevated bg-heritage-brown/40">
                  {storyImage ? (
                    <img
                      src={storyImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-heritage-cream/70 text-sm px-8 text-center">
                      Artisan photos appear here when sellers upload profile pictures.
                    </div>
                  )}
                </div>
                {maxSellerYears > 0 && (
                  <div className="absolute -bottom-6 -left-6 bg-heritage-gold text-heritage-brown p-6 rounded-xl shadow-elevated max-w-[200px]">
                    <div className="text-4xl font-heading font-bold">{maxSellerYears}+</div>
                    <div className="text-sm font-medium">Years since earliest featured seller joined</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="heritage-section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Meet Our Artisans
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Sellers on BanaCrafts — profiles from live store data.
              </p>
            </div>

            {loadingArtisans && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Loading artisans…
              </p>
            )}
            {!loadingArtisans && featuredArtisans.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground">
                  No artisan profiles yet. When sellers register, they will appear here.
                </p>
              </div>
            )}
            {!loadingArtisans && featuredArtisans.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredArtisans.map((artisan, idx) => (
                  <div
                    key={artisan.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <ArtisanCard artisan={artisan} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link to="/artisans">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Artisans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                  Awareness
                </h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Stories and updates from BanaCrafts (live articles from the database).
                </p>
              </div>
              <Link to="/awareness">
                <Button variant="outline" className="gap-2">
                  View all articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loadingAwareness && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Loading articles…
              </p>
            )}
            {!loadingAwareness && awarenessPreview.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-12 px-4 rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground text-sm">
                  No awareness articles yet. Published articles from the admin tools will
                  appear here.
                </p>
              </div>
            )}
            {!loadingAwareness && awarenessPreview.length > 0 && (
              <div className="grid gap-8 md:grid-cols-3">
                {awarenessPreview.map((article) => (
                  <Link
                    key={article.id}
                    to={`/awareness/${article.id}`}
                    className="block group"
                  >
                    <article className="heritage-card h-full flex flex-col overflow-hidden">
                      <div className="aspect-video overflow-hidden bg-muted">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt=""
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <span className="heritage-badge text-xs w-fit">
                          {article.category}
                        </span>
                        <h3 className="font-heading text-lg font-semibold mt-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {(article.excerpt || article.content) ? (
                          <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                            {article.excerpt ||
                              article.content.slice(0, 180)}
                          </p>
                        ) : null}
                        <div className="mt-auto pt-4 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {article.readTime} min read
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-r from-secondary to-heritage-rust text-secondary-foreground">
          <div className="container text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Join the BanaCrafts Community
            </h2>
            <p className="text-secondary-foreground/90 max-w-2xl mx-auto mb-8">
              Be part of a movement that celebrates traditional craftsmanship, supports women
              artisans, and promotes sustainable living.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button variant="default" size="xl" className="bg-background text-foreground hover:bg-background/90">
                  Create Account
                </Button>
              </Link>
              <Link to="/awareness">
                <Button variant="outline" size="xl" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                  Learn About Our Mission
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

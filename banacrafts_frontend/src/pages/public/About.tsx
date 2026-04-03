import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Target, Eye } from "lucide-react";
import type { Artisan } from "@/data/artisans";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchJsonArray } from "@/lib/fetchJsonArray";
import { normalizeArtisansList } from "@/lib/normalizeArtisan";

const API = "http://localhost:5000";

const About = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [artisanRaw, pRes] = await Promise.all([
          fetchJsonArray(`${API}/api/artisans`).catch(() => []),
          fetch(`${API}/api/products`),
        ]);
        if (!cancelled) setArtisans(normalizeArtisansList(artisanRaw));

        if (pRes.ok) {
          const json = await pRes.json();
          const list = Array.isArray(json?.products) ? json.products : [];
          if (!cancelled) setProductCount(list.length);
        } else if (!cancelled) setProductCount(null);
      } catch {
        if (!cancelled) {
          setArtisans([]);
          setProductCount(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const storyImage = artisans[0]?.image;
  const artisanCount = artisans.length;
  const categories = new Set(
    artisans.map((a) => a.specialty).filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-heritage-maroon text-heritage-cream py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Preserving Heritage,
                <br />
                <span className="text-heritage-gold">Empowering Women</span>
              </h1>
              <p className="mt-6 text-lg text-heritage-cream/90 leading-relaxed">
                BanaCrafts is more than a marketplace—it's a bridge between
                ancient craftsmanship and modern appreciation, connecting
                skilled artisans of Banasthali with a global audience.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                  Our Story
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Born from the rich tradition of Banasthali Vidyapith, one of India's
                    most prestigious women's universities, BanaCrafts emerged from a
                    simple yet powerful vision: to bring the extraordinary craftsmanship
                    of rural women artisans to the world.
                  </p>
                  <p>
                    For generations, the women of Banasthali have been masters of
                    traditional crafts—weaving, embroidery, pottery, and metalwork. Their
                    skills, passed down through centuries, represent an irreplaceable
                    cultural heritage that deserves to be celebrated and preserved.
                  </p>
                  <p>
                    Today, BanaCrafts serves as a platform that not only showcases these
                    incredible creations but also ensures that artisans receive fair
                    compensation and recognition for their work.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                  {storyImage ? (
                    <img
                      src={storyImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground px-6 text-center">
                      Profile imagery from registered sellers will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: "Our Mission",
                  content:
                    "To digitally empower women artisans by providing them with a platform to showcase and sell their handcrafted products to a global audience, ensuring fair trade and sustainable livelihoods.",
                },
                {
                  icon: Eye,
                  title: "Our Vision",
                  content:
                    "To become India's leading platform for authentic handcrafted products, preserving traditional crafts while fostering economic independence for rural women artisans.",
                },
                {
                  icon: Heart,
                  title: "Our Values",
                  content:
                    "Authenticity, sustainability, fair trade, women empowerment, and cultural preservation guide everything we do. Each product tells a story of heritage and hope.",
                },
              ].map((item, idx) => (
                <div key={idx} className="heritage-card p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-6">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-heritage-maroon text-heritage-cream">
          <div className="container text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">
              Platform snapshot
            </h2>
            {loading ? (
              <p className="text-heritage-cream/80 text-sm">Loading live figures…</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
                <div>
                  <div className="font-heading text-5xl md:text-6xl font-bold text-heritage-gold">
                    {artisanCount}
                  </div>
                  <p className="text-heritage-cream/80 mt-2">Registered sellers</p>
                </div>
                <div>
                  <div className="font-heading text-5xl md:text-6xl font-bold text-heritage-gold">
                    {productCount ?? "—"}
                  </div>
                  <p className="text-heritage-cream/80 mt-2">Products in catalog</p>
                </div>
                <div>
                  <div className="font-heading text-5xl md:text-6xl font-bold text-heritage-gold">
                    {categories}
                  </div>
                  <p className="text-heritage-cream/80 mt-2">Specialty categories (from listings)</p>
                </div>
              </div>
            )}
            <p className="text-xs text-heritage-cream/60 mt-8 max-w-xl mx-auto">
              Figures are loaded from the live database. Order totals and revenue are not shown here because they require a dedicated reporting API.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Sellers on BanaCrafts
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Everyone below is a registered seller with a live profile from our API.
              </p>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
            )}
            {!loading && artisans.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground mb-4">
                  No sellers to display yet.
                </p>
                <Button asChild variant="outline">
                  <Link to="/artisans">Open artisans directory</Link>
                </Button>
              </div>
            )}
            {!loading && artisans.length > 0 && (
              <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
                {artisans.map((artisan) => (
                  <div key={artisan.id} className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 bg-muted">
                      {artisan.image ? (
                        <img
                          src={artisan.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground px-2">
                          No photo
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-lg">{artisan.name}</h3>
                    <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

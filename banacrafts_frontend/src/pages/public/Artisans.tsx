import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArtisanCard from "@/components/common/ArtisanCard";
import type { Artisan } from "@/data/artisans";
import { fetchJsonArray } from "@/lib/fetchJsonArray";
import { normalizeArtisansList } from "@/lib/normalizeArtisan";

const API = "http://localhost:5000";

const Artisans = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await fetchJsonArray(`${API}/api/artisans`);
        if (!cancelled) setArtisans(normalizeArtisansList(raw));
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load artisans");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-heritage-maroon text-heritage-cream py-12 md:py-16">
          <div className="container">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Meet Our Artisans
            </h1>
            <p className="mt-3 text-heritage-cream/80 max-w-2xl">
              Sellers on BanaCrafts — real makers from our community. Profiles and
              listings come from live store data.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Loading artisans…
              </p>
            )}
            {error && !loading && (
              <p className="text-sm text-destructive text-center py-12">
                {error}
              </p>
            )}
            {!loading && !error && artisans.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground">
                  No artisan profiles are available yet. When sellers join the
                  platform, they will appear here automatically.
                </p>
              </div>
            )}
            {!loading && !error && artisans.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {artisans.map((artisan, idx) => (
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Artisans;

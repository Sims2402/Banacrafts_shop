import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArtisanCard from "@/components/common/ArtisanCard";

interface Artisan {
  _id: string;
  name: string;
  craft: string;
  specialty: string;
  location: string;
  experience: number;
  description: string;
  bio: string;
  image: string;
  productsCount: number;
  achievements: string[];
}

const Artisans = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/artisans");
        const data = await res.json();
        if (data.success) {
          setArtisans(data.data);
        } else {
          setError("Failed to load artisans");
        }
      } catch (err) {
        setError("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-heritage-maroon text-heritage-cream py-12 md:py-16">
          <div className="container">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Meet Our Artisans
            </h1>
            <p className="mt-3 text-heritage-cream/80 max-w-2xl">
              The talented hands behind every masterpiece. Each artisan brings decades of
              skill, passion, and heritage to their craft.
            </p>
          </div>
        </section>

        {/* Artisans Grid */}
        <section className="py-12 md:py-16">
          <div className="container">
            {loading && (
              <p className="text-center text-muted-foreground">Loading artisans...</p>
            )}
            {error && (
              <p className="text-center text-red-500">{error}</p>
            )}
            {!loading && !error && artisans.length === 0 && (
              <p className="text-center text-muted-foreground">No artisans found.</p>
            )}
            {!loading && !error && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {artisans.map((artisan, idx) => (
                  <div
                    key={artisan._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <ArtisanCard artisan={{ ...artisan, id: artisan._id }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-12 md:py-16 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Our Impact
              </h2>
              <p className="text-muted-foreground mt-2">
                Together, we're making a difference
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { number: "200+", label: "Artisans Empowered" },
                { number: "5000+", label: "Products Sold" },
                { number: "₹50L+", label: "Income Generated" },
                { number: "15+", label: "Craft Traditions" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="font-heading text-4xl md:text-5xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Artisans;
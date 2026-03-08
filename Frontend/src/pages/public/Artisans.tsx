import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArtisanCard from "@/components/common/ArtisanCard";
import { artisans } from "@/data/artisans";

const Artisans = () => {
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

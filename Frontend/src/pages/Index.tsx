import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Heart, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import ArtisanCard from "@/components/common/ArtisanCard";
import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { artisans } from "@/data/artisans";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const featuredArtisans = artisans.slice(0, 3);
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await api.get<any[]>("/products");

      setFeaturedProducts(data.slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
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
if (loading) {
  return (
    <div className="container py-20 text-center">
      Loading featured products...
    </div>
  );
}
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
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

        {/* Features */}
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

        {/* Featured Products */}
        <section className="heritage-section">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                  Featured Products
                </h2>
                <p className="text-muted-foreground mt-2">
                  Handpicked treasures from our collection
                </p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="hidden md:flex gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

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

        {/* Story Section */}
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
                    "100+ skilled women artisans",
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
                <div className="aspect-square rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src={artisans[0].image}
                    alt="Our artisan"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-heritage-gold text-heritage-brown p-6 rounded-xl shadow-elevated">
                  <div className="text-4xl font-heading font-bold">25+</div>
                  <div className="text-sm font-medium">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Our Artisans */}
        <section className="heritage-section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Meet Our Artisans
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                The talented hands behind every masterpiece. Each artisan brings decades of
                skill and passion to their craft.
              </p>
            </div>

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

        {/* CTA Section */}
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

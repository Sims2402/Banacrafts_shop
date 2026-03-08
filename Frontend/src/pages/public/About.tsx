import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Target, Eye, Users } from "lucide-react";
import { artisans } from "@/data/artisans";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
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

        {/* Story */}
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
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={artisans[0].image}
                    alt="Our artisan"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
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

        {/* Impact */}
        <section className="py-16 md:py-24 bg-heritage-maroon text-heritage-cream">
          <div className="container text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">
              Our Impact
            </h2>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { number: "200+", label: "Artisans Empowered" },
                { number: "5000+", label: "Products Sold" },
                { number: "₹50L+", label: "Income Generated" },
                { number: "15+", label: "Craft Traditions" },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="font-heading text-5xl md:text-6xl font-bold text-heritage-gold">
                    {stat.number}
                  </div>
                  <p className="text-heritage-cream/80 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                The Faces Behind BanaCrafts
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                A dedicated team of students, faculty, and artisans working together
                to make a difference.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {artisans.map((artisan) => (
                <div key={artisan.id} className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                    <img
                      src={artisan.image}
                      alt={artisan.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-lg">{artisan.name}</h3>
                  <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
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

export default About;

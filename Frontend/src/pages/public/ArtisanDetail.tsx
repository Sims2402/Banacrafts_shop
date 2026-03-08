import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Award, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import { getArtisanById } from "@/data/artisans";
import { getProductsByArtisan } from "@/data/products";

const ArtisanDetail = () => {
  const { id } = useParams();
  const artisan = getArtisanById(id || "");
  const artisanProducts = getProductsByArtisan(id || "");

  if (!artisan) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold">Artisan Not Found</h1>
            <Link to="/artisans" className="text-primary hover:underline mt-2 inline-block">
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
          {/* Breadcrumb */}
          <Link
            to="/artisans"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Artisans
          </Link>

          {/* Artisan Profile */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Image */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted sticky top-24">
                <img
                  src={artisan.image}
                  alt={artisan.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{artisan.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-5 w-5 text-accent" />
                  <span>{artisan.experience} Years Experience</span>
                </div>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {artisan.bio}
                </p>
              </div>

              {/* Achievements */}
              <div>
                <h2 className="font-heading text-xl font-semibold mb-4">Achievements</h2>
                <ul className="space-y-3">
                  {artisan.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Products */}
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

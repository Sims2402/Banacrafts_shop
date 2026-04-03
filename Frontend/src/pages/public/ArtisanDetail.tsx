import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Award, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";

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

const ArtisanDetail = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/artisans/${id}`);
        const data = await res.json();
        if (data.success) {
          setArtisan(data.data);
        } else {
          setError("Artisan not found");
        }
      } catch (err) {
        setError("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchArtisan();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
      <Footer />
    </div>
  );

  if (error || !artisan) return (
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
                  {artisan.specialty || artisan.craft}
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
                  {artisan.bio || artisan.description}
                </p>
              </div>

              {artisan.achievements?.length > 0 && (
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
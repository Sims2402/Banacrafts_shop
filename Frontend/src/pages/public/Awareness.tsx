import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { awarenessArticles } from "@/data/awareness";
import { Clock, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Awareness = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-heritage-maroon text-heritage-cream py-12 md:py-16">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold">Awareness</h1>
                <p className="mt-3 text-heritage-cream/80 max-w-2xl">
                  Learn about handcrafted traditions, sustainability, and women empowerment.
                </p>
              </div>
              {isAdmin && (
                <Link to="/admin/awareness">
                  <Button className="bg-heritage-cream text-heritage-maroon hover:bg-heritage-cream/90">
                    <Plus className="mr-2 h-4 w-4" />
                    New Article
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {awarenessArticles.map((article) => (
                <Link key={article.id} to={`/awareness/${article.id}`} className="block">
                  <article className="heritage-card group cursor-pointer">
                    <div className="aspect-video overflow-hidden">
                      <img src={article.image} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <span className="heritage-badge text-xs">{article.category}</span>
                      <h3 className="font-heading text-xl font-semibold mt-3 group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min read</span>
                        <span className="text-primary text-sm font-medium flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Awareness;

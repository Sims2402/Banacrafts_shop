import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Clock, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { fetchJsonArray } from "@/lib/fetchJsonArray";
import {
  normalizeAwarenessList,
  type AwarenessArticleClient,
} from "@/lib/normalizeAwareness";

const API = "http://localhost:5000";

const Awareness = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [articles, setArticles] = useState<AwarenessArticleClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await fetchJsonArray(`${API}/api/awareness`);
        if (!cancelled) setArticles(normalizeAwarenessList(raw));
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load articles");
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold">
                  Awareness
                </h1>
                <p className="mt-3 text-heritage-cream/80 max-w-2xl">
                  Articles published by BanaCrafts — traditions, sustainability,
                  and maker stories.
                </p>
              </div>
              {isAdmin && (
                <Link to="/admin/awareness">
                  <Button className="bg-heritage-cream text-heritage-maroon hover:bg-heritage-cream/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Manage articles
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Loading articles…
              </p>
            )}
            {error && !loading && (
              <p className="text-sm text-destructive text-center py-12">
                {error}
              </p>
            )}
            {!loading && !error && articles.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground">
                  No articles have been published yet. Check back later, or
                  contact an administrator if you expect to see content here.
                </p>
              </div>
            )}
            {!loading && !error && articles.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/awareness/${article.id}`}
                    className="block"
                  >
                    <article className="heritage-card group cursor-pointer h-full flex flex-col">
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
                        <span className="heritage-badge text-xs">
                          {article.category}
                        </span>
                        <h3 className="font-heading text-xl font-semibold mt-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {(article.excerpt || article.content) ? (
                          <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                            {article.excerpt || article.content.slice(0, 200)}
                          </p>
                        ) : null}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min read
                          </span>
                          <span className="text-primary text-sm font-medium flex items-center gap-1">
                            Read more{" "}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
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

export default Awareness;

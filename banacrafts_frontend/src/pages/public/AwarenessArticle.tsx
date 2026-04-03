import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  normalizeAwarenessArticle,
  type AwarenessArticleClient,
} from "@/lib/normalizeAwareness";

const API = "http://localhost:5000";

const AwarenessArticle = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<AwarenessArticleClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/awareness/${id}`);
        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setArticle(null);
          }
          return;
        }
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const normalized = normalizeAwarenessArticle(data);
        if (!cancelled) {
          if (normalized) {
            setArticle(normalized);
            setNotFound(false);
          } else {
            setNotFound(true);
            setArticle(null);
          }
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setArticle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold mb-4">
              Article not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This article may have been removed or is not published.
            </p>
            <Link to="/awareness">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Awareness
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-muted">
          {article.image ? (
            <img
              src={article.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No cover image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <article className="container max-w-3xl mx-auto px-4 -mt-24 relative z-10">
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-10">
            <Link
              to="/awareness"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Awareness
            </Link>

            <Badge className="mb-4">{article.category}</Badge>

            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
              {publishedDate && !Number.isNaN(publishedDate.getTime()) ? (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {publishedDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime} min read
              </span>
            </div>

            {article.excerpt ? (
              <p className="text-lg text-muted-foreground italic mb-6">
                {article.excerpt}
              </p>
            ) : null}

            <div className="prose prose-slate dark:prose-invert max-w-none">
              {article.content
                ? article.content.split("\n\n").map((paragraph, index) => {
                    if (
                      paragraph.startsWith("**") &&
                      paragraph.endsWith("**")
                    ) {
                      return (
                        <h2
                          key={index}
                          className="text-xl font-heading font-semibold mt-8 mb-4"
                        >
                          {paragraph.replace(/\*\*/g, "")}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith("- ")) {
                      const items = paragraph.split("\n").filter(Boolean);
                      return (
                        <ul
                          key={index}
                          className="list-disc list-inside space-y-2 my-4"
                        >
                          {items.map((item, i) => (
                            <li key={i} className="text-foreground/80">
                              {item.replace("- ", "")}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p
                        key={index}
                        className="text-foreground/80 leading-relaxed mb-4"
                      >
                        {paragraph.replace(/\*\*/g, "")}
                      </p>
                    );
                  })
                : (
                  <p className="text-muted-foreground">No body content.</p>
                )}
            </div>
          </div>
        </article>

        <div className="py-12" />
      </main>
      <Footer />
    </div>
  );
};

export default AwarenessArticle;

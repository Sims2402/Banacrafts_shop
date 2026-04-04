import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/common/ProductCard";
import { products as staticProducts, categories as staticCategories } from "@/data/products";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mapMongoDocToProduct } from "@/lib/mapMongoProduct";
import { apiUrl } from "@/lib/apiBase";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [apiProducts, setApiProducts] = useState<Product[] | null>(null);
  const [loadingApi, setLoadingApi] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingApi(true);
        const res = await fetch(apiUrl("/api/products"));
        if (!res.ok) throw new Error("products");
        const json = (await res.json()) as { products?: unknown[] };
        const raw = Array.isArray(json?.products) ? json.products : [];
        const mapped = raw.map((p) =>
          mapMongoDocToProduct(p as Record<string, unknown>)
        );
        if (!cancelled) setApiProducts(mapped);
      } catch {
        if (!cancelled) setApiProducts(null);
      } finally {
        if (!cancelled) setLoadingApi(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceProducts = apiProducts ?? staticProducts;

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    staticCategories.forEach((c) => {
      if (c !== "All") set.add(c);
    });
    sourceProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [sourceProducts]);

  const filteredProducts =
    selectedCategory === "All"
      ? sourceProducts
      : sourceProducts.filter((p) => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-heritage-maroon text-heritage-cream py-12 md:py-16">
          <div className="container">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Our Collection
            </h1>
            <p className="mt-3 text-heritage-cream/80 max-w-2xl">
              Explore our handpicked collection of authentic handcrafted products made by
              skilled artisans of Banasthali.
            </p>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-8 md:py-12">
          <div className="container">
            {loadingApi ? (
              <p className="text-sm text-muted-foreground mb-6">Loading products…</p>
            ) : apiProducts === null ? (
              <p className="text-sm text-muted-foreground mb-6">
                Could not load live catalog — showing sample products. Ensure the backend is
                running on port 5000.
              </p>
            ) : null}

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "heritage" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      selectedCategory !== category && "text-muted-foreground"
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {sortedProducts.length} products
            </p>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;

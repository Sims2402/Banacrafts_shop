import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { normalizeProductTags } from "@/lib/normalizeProductTags";
const getProductId = (product: any) => product._id || product.id;

function cardImageSrc(product: any) {
  if (product.image) return product.image;

  const first = product.images?.[0];

  if (!first) return "/placeholder.png";

  if (typeof first === "string") return first;

  return first.url || "/placeholder.png";
}

interface ProductCardProps {
  product: Product;
  className?: string;
}


const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(getProductId(product));

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(getProductId(product));
    } else {
      addToWishlist(product);
    }
  };

  const hasNumericStock =
    product.quantity != null && Number.isFinite(product.quantity);
  const stockQty = hasNumericStock
    ? Math.max(0, Math.floor(Number(product.quantity)))
    : null;
  const canAdd = hasNumericStock ? stockQty! > 0 : product.inStock !== false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    addToCart(product, 1);
  };

  const tags = normalizeProductTags(product.tags);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
<Link
  to={`/products/${getProductId(product)}`}
  className={cn("block group", className)}
>
      <div className="heritage-card">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={cardImageSrc(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded">
                {discount}% OFF
              </span>
            )}
            {tags.includes("Limited Edition") && (
              <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded">
                Limited Edition
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute right-3 top-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                inWishlist ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Quick Add Button */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="heritage"
              className="w-full rounded-none"
              disabled={!canAdd}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              {canAdd ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="font-heading font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
  {(() => {
    const list = Number(product.price);
    const final =
      product.finalPrice !== undefined
        ? Number(product.finalPrice)
        : list;

    const hasDiscount = final < list;

    return (
      <>
            <span className="font-heading text-lg font-bold text-primary">
              ₹{final.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{list.toLocaleString()}
              </span>
            )}

            {!hasDiscount &&
              product.originalPrice &&
              product.originalPrice > list && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
          </>
        );
      })()}
    </div>

          <p className="text-xs text-muted-foreground mt-1">
            {!canAdd
              ? "Out of stock"
              : hasNumericStock
                ? `${stockQty} available`
                : "In stock"}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 2).map((tag, i) => (
              <span key={`${i}-${tag}`} className="heritage-badge text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;

import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Award } from "lucide-react";
import type { Artisan } from "@/data/artisans";
import { cn } from "@/lib/utils";

interface ArtisanCardProps {
  artisan: Artisan;
  className?: string;
}

const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan, className }) => {
  return (
    <Link
      to={`/artisans/${artisan.id}`}
      className={cn("block group", className)}
    >
      <div className="heritage-card">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {artisan.image ? (
            <img
              src={artisan.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              No profile photo
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-heritage-brown/80 via-transparent to-transparent" />

          {artisan.experience > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-heritage-cream">
                <Award className="h-4 w-4 text-heritage-gold" />
                <span className="text-sm font-medium">
                  {artisan.experience} year
                  {artisan.experience !== 1 ? "s" : ""} on BanaCrafts
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {artisan.name}
          </h3>

          <p className="text-sm font-medium text-secondary mt-1">
            {artisan.specialty}
          </p>

          {artisan.location ? (
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">{artisan.location}</span>
            </div>
          ) : null}

          {artisan.bio ? (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {artisan.bio}
            </p>
          ) : null}

          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-primary font-medium">
              {artisan.productsCount} product
              {artisan.productsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtisanCard;

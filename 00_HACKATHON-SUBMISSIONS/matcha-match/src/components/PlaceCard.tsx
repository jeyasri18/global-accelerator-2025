import { Star, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchaPlace } from "@/data/mockMatcha";

// Helpers to avoid runtime crashes
const text = (v: unknown, max = 999) => String(v ?? "").slice(0, max);
const dollars = (n?: number | null) =>
  typeof n === "number" && n > 0 ? "$".repeat(Math.min(4, n)) : "—";

interface PlaceCardProps {
  place: MatchaPlace | any; // allow backend shape too
}

export default function PlaceCard({ place }: PlaceCardProps) {
  // normalize fields (works for mock + backend)
  const rating =
    typeof place.rating === "number" ? place.rating : 0;

  const openInGoogleMaps = () => {
    try {
      // Priority 1: Use place_id if available (shows full business profile)
      if (place.id && place.id.startsWith('ChIJ')) {
        const url = `https://www.google.com/maps/place/?q=place_id:${place.id}`;
        window.open(url, '_blank');
        return;
      }
      
      // Priority 2: Use place_id from backend if available
      if (place.place_id && place.place_id.startsWith('ChIJ')) {
        const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        window.open(url, '_blank');
        return;
      }
      
      // Priority 3: Search by name + address (better than coordinates)
      if (place.name && (place.address || place.vicinity)) {
        const searchQuery = encodeURIComponent(`${place.name} ${place.address || place.vicinity}`);
        const url = `https://www.google.com/maps/search/${searchQuery}`;
        window.open(url, '_blank');
        return;
      }
      
      // Priority 4: Fallback to coordinates (least preferred)
      if (place.lat && place.lng) {
        const url = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
        window.open(url, '_blank');
        return;
      }
      
      // Last resort: open Google Maps homepage
      window.open('https://www.google.com/maps', '_blank');
      
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      window.open('https://www.google.com/maps', '_blank');
    }
  };

  const priceRange =
    place.priceRange ?? dollars(place.price_level);

  const distanceKm =
    typeof place.distance === "number"
      ? place.distance.toFixed(1)
      : typeof place.distance === "string"
      ? place.distance
      : "—";

  const address = text(place.address ?? place.vicinity, 80);

  const matchScore =
    typeof place.matchScore === "number"
      ? place.matchScore
      : typeof place.match_score === "number"
      ? place.match_score
      : 0;

  const tags: string[] = Array.isArray(place.tags) ? place.tags : [];

  // Handle photos array from backend or single photo URL
  const imageSrc = (() => {
    if (place.image) return place.image;
    if (place.photoUrl) return place.photoUrl;
    if (Array.isArray(place.photos) && place.photos.length > 0) {
      return place.photos[0]; // Use first photo from array
    }
    return "https://placehold.co/800x400?text=Matcha";
  })();

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-matcha-dark text-white";
    if (score >= 80) return "bg-matcha-medium text-white";
    return "bg-matcha-light text-matcha-forest";
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50 cursor-pointer"
      onClick={openInGoogleMaps}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={text(place.name)}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/800x400?text=Matcha";
          }}
        />
        <Badge className={`absolute top-3 right-3 ${getMatchScoreColor(matchScore)}`}>
          {matchScore}% match
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {text(place.name)}
          </h3>
          <div className="flex items-center space-x-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{place.priceRange || "$$"}</span>

          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{distanceKm} km</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 truncate">
          {address}
        </p>

        <div className="flex flex-wrap gap-1">
          {(tags ?? []).slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Click hint */}
        <div className="mt-3 pt-3 border-t border-border/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Click to open in Google Maps</span>
            <span className="text-green-600">→</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

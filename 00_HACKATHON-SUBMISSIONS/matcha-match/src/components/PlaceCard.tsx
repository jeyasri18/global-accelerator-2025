import { Star, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchaPlace } from "@/data/mockMatcha";

interface PlaceCardProps {
  place: MatchaPlace;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-matcha-dark text-white";
    if (score >= 80) return "bg-matcha-medium text-white";
    return "bg-matcha-light text-matcha-forest";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50">
      <div className="relative">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-48 object-cover"
        />
        <Badge 
          className={`absolute top-3 right-3 ${getMatchScoreColor(place.matchScore)}`}
        >
          {place.matchScore}% match
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {place.name}
          </h3>
          <div className="flex items-center space-x-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{place.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{place.priceRange}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{place.distance} mi</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 truncate">
          {place.address}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {place.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
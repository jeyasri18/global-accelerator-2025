import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MatchaPlace } from "@/data/mockMatcha";
import { Star, MapPin } from "lucide-react";

declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: any);
      }
      class LatLng {
        constructor(lat: number, lng: number);
      }
      namespace marker {
        class AdvancedMarkerElement {
          constructor(options: any);
        }
      }
      namespace places {
        class PlacesService {
          constructor(map: Map);
          nearbySearch(request: any, callback: (results: any[], status: any) => void): void;
        }
        enum PlacesServiceStatus {
          OK = "OK"
        }
        interface PlaceSearchRequest {
          location: LatLng;
          radius: number;
          keyword?: string;
          type?: string;
        }
        interface PlaceResult {
          place_id?: string;
          name?: string;
          rating?: number;
          price_level?: number;
          vicinity?: string;
          geometry?: {
            location?: {
              lat(): number;
              lng(): number;
            };
          };
          types?: string[];
          photos?: Array<{
            getUrl(options: { maxWidth: number; maxHeight: number }): string;
          }>;
        }
      }
    }
  }
}

interface MapViewProps {
  places: MatchaPlace[];
}

export default function MapView({ places }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<MatchaPlace | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo-key", // Will use demo mode if no key
        version: "weekly",
      });

      try {
        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: 13,
            mapId: "matcha-map",
          });

          setMap(mapInstance);

          // Add markers for each place
          places.forEach((place) => {
            const markerElement = document.createElement("div");
            markerElement.className = "custom-marker";
            markerElement.innerHTML = `
              <div style="
                background: linear-gradient(135deg, #22c55e, #16a34a);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                ${place.matchScore}
              </div>
            `;

            const marker = new AdvancedMarkerElement({
              map: mapInstance,
              position: { lat: place.lat, lng: place.lng },
              content: markerElement,
            });

            // Add hover events
            markerElement.addEventListener("mouseenter", (e) => {
              setHoveredPlace(place);
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            });

            markerElement.addEventListener("mouseleave", () => {
              setHoveredPlace(null);
            });

            markerElement.addEventListener("mousemove", (e) => {
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            });
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        // Fallback: show a simple placeholder
      }
    };

    initMap();
  }, [places]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-matcha-forest";
    if (score >= 80) return "text-matcha-dark";
    return "text-matcha-medium";
  };

  return (
    <div className="relative h-[600px] w-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
      
      {/* Fallback content when Maps doesn't load */}
      {!map && (
        <div className="absolute inset-0 bg-matcha-light/20 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-dark mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading map...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your Google Maps API key to see the interactive map
            </p>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredPlace && (
        <div
          className="fixed z-50 bg-white p-4 rounded-lg shadow-xl border border-border max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 100,
          }}
        >
          <h4 className="font-semibold text-foreground mb-2">
            {hoveredPlace.name}
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{hoveredPlace.rating}</span>
              </div>
              <span className="text-muted-foreground">{hoveredPlace.priceRange}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{hoveredPlace.distance} miles away</span>
            </div>
            
            <div className={`font-semibold ${getMatchScoreColor(hoveredPlace.matchScore)}`}>
              {hoveredPlace.matchScore}% match
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
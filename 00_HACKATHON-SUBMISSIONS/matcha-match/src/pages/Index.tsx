import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ViewToggle from "@/components/ViewToggle";
import ListView from "@/components/ListView";
import MapView from "@/components/MapView";
import { mockMatchaPlaces, MatchaPlace } from "@/data/mockMatcha";
import { PlacesService, getCurrentLocation, UserLocation } from "@/services/placesService";
import { Loader } from "@googlemaps/js-api-loader";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const [places, setPlaces] = useState<MatchaPlace[]>(mockMatchaPlaces);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializePlaces();
  }, []);

  const initializePlaces = async () => {
    setLoading(true);

    try {
      // Get user location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Check if we have a valid Google Maps API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey || apiKey === "demo-key") {
        toast({
          title: "Using Demo Data",
          description: "Add your Google Maps API key to see real nearby places",
        });
        setLoading(false);
        return;
      }

      // Initialize Google Maps and search for places
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places", "marker"]
      });

      const { Map } = await loader.importLibrary("maps");

      // Create a temporary map for the places service
      const tempMapDiv = document.createElement("div");
      const tempMap = new Map(tempMapDiv, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 13,
      });

      const placesService = new PlacesService(tempMap);
      const nearbyPlaces = await placesService.searchNearbyMatcha(location);

      if (nearbyPlaces.length > 0) {
        setPlaces(nearbyPlaces);
        toast({
          title: "Found Nearby Places",
          description: `Discovered ${nearbyPlaces.length} matcha places near you!`,
        });
      } else {
        toast({
          title: "No Places Found",
          description: "Using demo data - try a different location or search term",
        });
      }
    } catch (error) {
      console.error("Error loading places:", error);
      toast({
        title: "Error Loading Places",
        description: "Using demo data instead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center mb-6 space-x-4">
          <ViewToggle
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          <button
            onClick={() => navigate("/calendar")}
            className="bg-matcha-medium hover:bg-matcha-dark text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            View Matcha Calendar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-dark mx-auto mb-4"></div>
              <p className="text-muted-foreground">Finding nearby matcha places...</p>
            </div>
          </div>
        ) : (
          <>
            {currentView === "list" ? (
              <ListView places={places} />
            ) : (
              <MapView places={places} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;

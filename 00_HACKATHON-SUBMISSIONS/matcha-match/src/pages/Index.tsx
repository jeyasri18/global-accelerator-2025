import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ViewToggle from "@/components/ViewToggle";
import ListView from "@/components/ListView";
import MapView from "@/components/MapView";
import { mockMatchaPlaces, MatchaPlace } from "@/data/mockMatcha";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const [places, setPlaces] = useState<MatchaPlace[]>(mockMatchaPlaces);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializePlaces();
  }, []);

  const initializePlaces = async () => {
    setLoading(true);
    try {
      // Fetch places from Django backend API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/places/`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: MatchaPlace[] = await response.json();
      setPlaces(data);
      toast({
        title: "Loaded Places",
        description: `Found ${data.length} matcha places from backend.`,
      });
    } catch (error) {
      console.error("Failed to fetch places from backend:", error);
      toast({
        title: "Error Fetching Places",
        description: "Using demo data instead",
        variant: "destructive",
      });
      setPlaces(mockMatchaPlaces);
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
              <p className="text-muted-foreground">Loading matcha places...</p>
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

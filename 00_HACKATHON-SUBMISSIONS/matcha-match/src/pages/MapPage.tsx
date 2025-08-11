import MapView from "@/components/MapView";

export default function MapPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Matcha Finder</h1>
      <p className="text-sm text-muted-foreground">
        We’ll use your location (or Sydney as a fallback) to find nearby matcha spots.
      </p>
      <MapView />
    </div>
  );
}

// src/lib/loadMaps.ts
import { Loader } from "@googlemaps/js-api-loader";

export const loadMaps = () =>
  new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY, // your FRONTEND key
    libraries: ["places"],
  }).load();

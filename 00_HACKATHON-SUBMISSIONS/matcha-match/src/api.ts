import axios from "axios";

// This reads the backend API base URL from the .env file you created
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// Define a TypeScript interface describing the shape of a matcha place object
export interface Place {
  name: string;
  rating?: number;
  vicinity?: string;
  [key: string]: any; // This means it can have other extra properties too
}

// This function makes an HTTP GET request to your backend to get matcha places near the lat/lng given
export async function fetchMatchaPlaces(lat: number, lng: number, radius = 2000): Promise<{ results: Place[] }> {
  const response = await axios.get(`${API_BASE}/places/`, {
    params: { lat, lng, radius }, // sending lat, lng, and radius as query parameters
  });
  return response.data; // returning the data (list of places) from the backend
}
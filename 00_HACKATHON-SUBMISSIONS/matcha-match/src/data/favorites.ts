export interface Favorite {
  placeId: string;
  placeName: string;
  heartsCount: number;
  lastHearted: Date;
}

export interface FavoritesData {
  [placeId: string]: Favorite;
}

// Mock initial favorites data
export const mockFavorites: FavoritesData = {
  "1": {
    placeId: "1",
    placeName: "Zen Matcha House",
    heartsCount: 42,
    lastHearted: new Date("2024-01-15")
  },
  "2": {
    placeId: "2",
    placeName: "Emerald Tea Lounge",
    heartsCount: 35,
    lastHearted: new Date("2024-01-14")
  },
  "3": {
    placeId: "3",
    placeName: "Green Leaf Cafe",
    heartsCount: 28,
    lastHearted: new Date("2024-01-10")
  },
  "4": {
    placeId: "4",
    placeName: "Traditional Matcha Studio",
    heartsCount: 67,
    lastHearted: new Date("2024-01-12")
  },
  "5": {
    placeId: "5",
    placeName: "Modern Matcha Co.",
    heartsCount: 19,
    lastHearted: new Date("2024-01-13")
  }
};

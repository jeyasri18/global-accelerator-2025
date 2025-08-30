import { useState, useEffect, useCallback } from 'react';
import { Favorite, FavoritesData, mockFavorites } from '@/data/favorites';
import { mockMatchaPlaces } from '@/data/mockMatcha';

const STORAGE_KEY = 'mm_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritesData>({});
  const [userHearts, setUserHearts] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      } catch (error) {
        console.error('Failed to parse stored favorites:', error);
        setFavorites(mockFavorites);
      }
    } else {
      // Initialize with mock favorites data
      setFavorites(mockFavorites);
    }

    // Load user's personal heart status
    const storedHearts = localStorage.getItem('mm_user_hearts');
    if (storedHearts) {
      try {
        const parsed = JSON.parse(storedHearts);
        setUserHearts(new Set(parsed));
      } catch (error) {
        console.error('Failed to parse stored user hearts:', error);
        setUserHearts(new Set());
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Save user hearts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mm_user_hearts', JSON.stringify(Array.from(userHearts)));
  }, [userHearts]);

  // Toggle heart for a place
  const toggleHeart = useCallback((placeId: string, placeName: string) => {
    setFavorites(prev => {
      const current = prev[placeId];
      
      // Get the base heart count from mock data
      const basePlace = mockMatchaPlaces.find(p => p.id === placeId);
      const baseHeartsCount = basePlace?.heartsCount || 0;
      
      // Calculate new heart count based on user interaction
      const currentUserHearts = current?.heartsCount || baseHeartsCount;
      const newHeartsCount = currentUserHearts + (userHearts.has(placeId) ? -1 : 1);
      
      // Don't allow heart count to go below base count
      const finalHeartsCount = Math.max(baseHeartsCount, newHeartsCount);
      
      if (finalHeartsCount <= baseHeartsCount && userHearts.has(placeId)) {
        // Remove user's heart but keep base count
        const { [placeId]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [placeId]: {
          placeId,
          placeName,
          heartsCount: finalHeartsCount,
          lastHearted: new Date()
        }
      };
    });

    // Toggle user's personal heart status
    setUserHearts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  }, [userHearts]);

  // Check if a place is hearted by current user
  const isHearted = useCallback((placeId: string) => {
    return userHearts.has(placeId);
  }, [userHearts]);

  // Get heart count for a place
  const getHeartCount = useCallback((placeId: string) => {
    // Get the base heart count from mock data
    const basePlace = mockMatchaPlaces.find(p => p.id === placeId);
    const baseHeartsCount = basePlace?.heartsCount || 0;
    
    // Get any additional hearts from user interactions
    const userAddedHearts = favorites[placeId]?.heartsCount || 0;
    
    // Return the higher of the two (base count or user-modified count)
    return Math.max(baseHeartsCount, userAddedHearts);
  }, [favorites]);

  // Get all favorited places sorted by heart count
  const getFavoritedPlaces = useCallback(() => {
    // Merge mock data with user favorites
    const allPlaces = mockMatchaPlaces.map(place => {
      const userFavorite = favorites[place.id];
      return {
        placeId: place.id,
        placeName: place.name,
        heartsCount: Math.max(place.heartsCount || 0, userFavorite?.heartsCount || 0),
        lastHearted: userFavorite?.lastHearted || new Date()
      };
    });
    
    // Filter to only places with hearts and sort by count
    return allPlaces
      .filter(place => place.heartsCount > 0)
      .sort((a, b) => b.heartsCount - a.heartsCount);
  }, [favorites]);

  // Get total number of places with hearts
  const getTotalFavoritedPlaces = useCallback(() => {
    // Count places that have hearts (either from mock data or user interactions)
    return mockMatchaPlaces.filter(place => {
      const baseHearts = place.heartsCount || 0;
      const userHearts = favorites[place.id]?.heartsCount || 0;
      return Math.max(baseHearts, userHearts) > 0;
    }).length;
  }, [favorites]);

  // Get total heart count across all places
  const getTotalHeartCount = useCallback(() => {
    return mockMatchaPlaces.reduce((total, place) => {
      const baseHearts = place.heartsCount || 0;
      const userHearts = favorites[place.id]?.heartsCount || 0;
      return total + Math.max(baseHearts, userHearts);
    }, 0);
  }, [favorites]);

  return {
    favorites,
    userHearts,
    toggleHeart,
    isHearted,
    getHeartCount,
    getFavoritedPlaces,
    getTotalFavoritedPlaces,
    getTotalHeartCount
  };
};

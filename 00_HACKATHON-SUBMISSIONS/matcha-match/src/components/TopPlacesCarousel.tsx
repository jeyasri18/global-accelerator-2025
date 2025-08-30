import React, { useState, useEffect } from 'react';
import { Star, MapPin, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopPlace {
  id: string;
  place_id: string;
  name: string;
  address: string;
  rating: number;
  price_level: string;
  distance: number;
  photos?: string[];
  lat?: number;
  lng?: number;
}

const TopPlacesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [topPlaces, setTopPlaces] = useState<TopPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got user location:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a default location (Sydney)
          console.log('Using fallback location: Sydney');
          setUserLocation({ lat: -33.8688, lng: 151.2093 });
        }
      );
    } else {
      console.log('Geolocation not supported, using fallback location: Sydney');
      // Fallback to a default location (Sydney)
      setUserLocation({ lat: -33.8688, lng: 151.2093 });
    }
  }, []);

  // Fetch real top places from your API
  useEffect(() => {
    if (!userLocation) return;

    const fetchTopPlaces = async () => {
      try {
        console.log('Fetching places for location:', userLocation);
        const response = await fetch(`http://localhost:8001/api/places/?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const places = await response.json();
          console.log('Got places from API:', places.length);
          console.log('First place data:', places[0]);
          
          // Take top 4 places by rating
          const topRated = places
            .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4)
            .map((place: any) => {
              console.log('Processing place:', place.name, 'Photos:', place.photos);
              return {
                id: place.id || place.place_id,
                place_id: place.place_id || place.id,
                name: place.name,
                address: place.vicinity || 'Address not available',
                rating: place.rating || 0,
                price_level: place.price_range || '$$',
                distance: place.distance || 0,
                photos: place.photos || [],
                lat: place.lat,
                lng: place.lng
              };
            });
          
          console.log('Processed top places:', topRated);
          setTopPlaces(topRated);
        } else {
          console.error('API returned error:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching top places:', error);
        // Fallback to sample data if API fails
        setTopPlaces([
          {
            id: '1',
            place_id: '1',
            name: 'Matcha-Ya',
            address: 'NW.05/10 Steam Mill La, Haymarket',
            rating: 4.8,
            price_level: '$$',
            distance: 0.8,
            lat: -33.8688,
            lng: 151.2093
          },
          {
            id: '2',
            place_id: '2',
            name: 'Zensation Tea House',
            address: 'Shop 82/788 Bourke St, Waterloo',
            rating: 4.9,
            price_level: '$$',
            distance: 2.0,
            lat: -33.9014,
            lng: 151.2076
          },
          {
            id: '3',
            place_id: '3',
            name: 'Oh!Matcha',
            address: 'Shop 11/501 George St, Sydney',
            rating: 4.7,
            price_level: '$',
            distance: 0.4,
            lat: -33.8728,
            lng: 151.2062
          },
          {
            id: '4',
            place_id: '4',
            name: 'Cafe Maru',
            address: '189 Kent St, Sydney',
            rating: 4.9,
            price_level: '$$',
            distance: 0.5,
            lat: -33.8705,
            lng: 151.2047
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlaces();
  }, [userLocation]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying || topPlaces.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % topPlaces.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, topPlaces.length]);

  const nextPlace = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % topPlaces.length);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevPlace = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + topPlaces.length) % topPlaces.length);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const openInGoogleMaps = (place: TopPlace) => {
    try {
      // Priority 1: Use place_id if available (shows full business profile)
      if (place.place_id && place.place_id.startsWith('ChIJ')) {
        const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        window.open(url, '_blank');
        return;
      }
      
      // Priority 2: Search by name + address (better than coordinates)
      if (place.name && place.address) {
        const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
        const url = `https://www.google.com/maps/search/${searchQuery}`;
        window.open(url, '_blank');
        return;
      }
      
      // Priority 3: Use coordinates if available
      if (place.lat && place.lng) {
        const url = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
        window.open(url, '_blank');
        return;
      }
      
      // Fallback: open Google Maps
      window.open('https://www.google.com/maps', '_blank');
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      window.open('https://www.google.com/maps', '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Loading top places...</p>
          {userLocation && (
            <p className="text-xs text-gray-500 mt-2">
              Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (topPlaces.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No places available at the moment.</p>
        {userLocation && (
          <p className="text-xs text-gray-500 mt-2">
            Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
      </div>
    );
  }

  const currentPlace = topPlaces[currentIndex];

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Location Info */}
      {userLocation && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            📍 Showing places near your location
          </p>
          <div className="flex justify-center space-x-2 mt-2">
            <button
              onClick={() => {
                setUserLocation({ lat: -33.8688, lng: 151.2093 }); // Sydney
                setLoading(true);
              }}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Test Sydney
            </button>
            <button
              onClick={() => {
                setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco
                setLoading(true);
              }}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            >
              Test SF
            </button>
          </div>
        </div>
      )}

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mb-6">
        {topPlaces.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-appaccent w-8' : 'bg-appprimary'
            }`}
          />
        ))}
      </div>

      {/* Main Card - Fixed Dimensions */}
      <div 
        className="bg-card rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 w-full h-[500px] flex flex-col"
        onClick={() => openInGoogleMaps(currentPlace)}
      >
        {/* Photo Section - Fixed Height */}
        <div className="relative h-64 w-full overflow-hidden">
          {currentPlace.photos && currentPlace.photos.length > 0 ? (
            <img
              src={currentPlace.photos && currentPlace.photos.length > 0 ? currentPlace.photos[0] : `http://localhost:8001/api/ai/placeholder/400/256/`}
              alt={currentPlace.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const fallbackColors = ['FFFDF6', 'FAF6E9', 'DDEB9D', 'A0C878'];
                const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
                (e.currentTarget as HTMLImageElement).src =
                  `http://localhost:8001/api/ai/placeholder/400/256/`;
              }}
              onLoad={() => console.log('Image loaded successfully:', currentPlace.photos?.[0])}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-appprimary to-appaccent flex items-center justify-center">
              <div className="text-center">
                <Coffee className="w-20 h-20 text-appaccent mx-auto mb-3" />
                <p className="text-xl font-semibold text-foreground">{currentPlace.name}</p>
                <p className="text-sm text-appprimary mt-2">No photo available</p>
              </div>
            </div>
          )}
          {/* Price Badge - Top Right */}
          <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
            <span className="text-sm font-semibold text-appprimary">{currentPlace.price_level}</span>
          </div>
          {/* Rating Badge - Top Left */}
          <div className="absolute top-4 left-4 bg-appaccent/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-appprimary fill-current" />
              <span className="text-sm font-semibold text-white">{currentPlace.rating}</span>
            </div>
          </div>
        </div>
        {/* Content Section - Fixed Height */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          {/* Top Content */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-3 line-clamp-2">{currentPlace.name}</h3>
            <div className="flex items-center space-x-2 text-foreground mb-3">
              <MapPin className="w-4 h-4 text-appaccent flex-shrink-0" />
              <span className="text-sm line-clamp-2">{currentPlace.address}</span>
            </div>
          </div>
          {/* Bottom Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground bg-appprimary/40 px-3 py-1 rounded-full">
                {currentPlace.distance} km away
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs text-appaccent font-medium bg-card px-3 py-2 rounded-full">
                Click to open in Google Maps →
              </span>
            </div>
          </div>
        </div>
        {/* Navigation Arrows */}
        <button
          onClick={prevPlace}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-card/95 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-card transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-appaccent" />
        </button>
        <button
          onClick={nextPlace}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-card/95 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-card transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-appaccent" />
        </button>
      </div>
    </div>
  );
};

export default TopPlacesCarousel;

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopPlace {
  id: string;
  name: string;
  address: string;
  rating: number;
  price_level: string;
  distance: number;
  photo_url?: string;
  lat?: number;
  lng?: number;
}

const TopPlacesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample top places data (you can replace this with real API data)
  const topPlaces: TopPlace[] = [
    {
      id: '1',
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
      name: 'Cafe Maru',
      address: '189 Kent St, Sydney',
      rating: 4.9,
      price_level: '$$',
      distance: 0.5,
      lat: -33.8705,
      lng: 151.2047
    }
  ];

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

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
      if (place.id && place.id.startsWith('ChIJ')) {
        const url = `https://www.google.com/maps/place/?q=place_id:${place.id}`;
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
      
      // Priority 3: Fallback to coordinates (least preferred)
      if (place.lat && place.lng) {
        const url = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
        window.open(url, '_blank');
        return;
      }
      
      // Last resort: open Google Maps homepage
      window.open('https://www.google.com/maps', '_blank');
      
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      window.open('https://www.google.com/maps', '_blank');
    }
  };

  const currentPlace = topPlaces[currentIndex];

  return (
    <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg border border-green-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
          <h3 className="text-2xl font-bold text-gray-800">Top Rated Places</h3>
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
        </div>
        <p className="text-gray-600">Discover Sydney's finest matcha experiences</p>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Main Place Card */}
        <div 
          className="p-6 cursor-pointer transform transition-all duration-500 hover:scale-105"
          onClick={() => openInGoogleMaps(currentPlace)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{currentPlace.name}</h4>
              <p className="text-gray-600 flex items-center mb-3">
                <MapPin className="w-4 h-4 mr-2 text-green-600" />
                {currentPlace.address}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="font-semibold">{currentPlace.rating}</span>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <span className="font-semibold">{currentPlace.price_level}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{currentPlace.distance}km away</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Coffee className="w-4 h-4" />
                <span className="text-sm font-medium">Matcha Specialists</span>
              </div>
            </div>
            <div className="text-green-600 text-sm font-medium">
              Click to open in Maps →
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2 p-4 bg-gray-50">
          {topPlaces.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-green-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevPlace}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-green-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextPlace}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-green-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Auto-play Indicator */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            isAutoPlaying ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span>{isAutoPlaying ? 'Auto-rotating' : 'Manual control'}</span>
        </div>
      </div>
    </div>
  );
};

export default TopPlacesCarousel;

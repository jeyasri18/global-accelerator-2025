# import os, googlemaps
# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# @api_view(["GET"])
# def matcha_places(request):
#     try:
#         lat = float(request.GET.get("lat", "-33.8688"))
#         lng = float(request.GET.get("lng", "151.2093"))
#     except ValueError:
#         lat, lng = -33.8688, 151.2093
#     radius = int(request.GET.get("radius", "3000"))

#     api_key = os.getenv("GOOGLE_MAPS_API_KEY")
#     if not api_key:
#         return Response([
#             {"id":1,"name":"Matcha House","address":"123 Tea St","rating":4.5,"price_level":2,"open_now":True},
#             {"id":2,"name":"Green Leaf Matcha","address":"456 Leaf Ave","rating":4.7,"price_level":3,"open_now":False},
#         ])

#     gmaps = googlemaps.Client(key=api_key)
#     res = gmaps.places_nearby(location=(lat, lng), radius=radius, keyword="matcha")
#     out = []
#     for i, p in enumerate(res.get("results", []), start=1):
#         out.append({
#             "id": i,
#             "name": p.get("name"),
#             "address": p.get("vicinity"),
#             "rating": p.get("rating"),
#             "price_level": p.get("price_level"),
#             "open_now": (p.get("opening_hours") or {}).get("open_now"),
#             "place_id": p.get("place_id"),
#         })
#     return Response(out)
# views.py
from django.http import JsonResponse
from django.views import View
import googlemaps
from django.conf import settings
import json

class PlacesView(View):
    def get(self, request):
        # Get user location from query parameters
        user_lat = request.GET.get('lat')
        user_lng = request.GET.get('lng')
        
        # Default to Sydney if no location provided
        if not user_lat or not user_lng:
            user_lat, user_lng = -33.8688, 151.2093
        else:
            user_lat, user_lng = float(user_lat), float(user_lng)
        
        # Initialize Google Maps client
        gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
        
        try:
            # Search for matcha cafes near user location
            places_result = gmaps.places_nearby(
                location=(user_lat, user_lng),
                radius=5000,  # 5km radius
                keyword='matcha cafe tea',
                type='cafe'
            )
            
            processed_places = []
            
            for place in places_result.get('results', []):
                # Extract location data
                geometry = place.get('geometry', {})
                location = geometry.get('location', {})
                
                if not location.get('lat') or not location.get('lng'):
                    continue  # Skip places without coordinates
                
                # Calculate match score based on rating and relevance
                match_score = self.calculate_match_score(place, user_lat, user_lng)
                
                # Calculate distance
                distance = self.calculate_distance(
                    user_lat, user_lng, 
                    location['lat'], location['lng']
                )
                
                # Format price range
                price_range = self.format_price_range(place.get('price_level'))
                
                processed_place = {
                    'id': place.get('place_id', ''),
                    'name': place.get('name', 'Unknown Place'),
                    'rating': place.get('rating', 0),
                    'price_level': place.get('price_level'),
                    'vicinity': place.get('vicinity', ''),
                    'lat': location['lat'],  # Required by frontend
                    'lng': location['lng'],  # Required by frontend
                    'match_score': match_score,  # Required by frontend
                    'distance': distance,
                    'price_range': price_range,
                    'photos': self.get_photo_urls(place.get('photos', []))
                }
                
                processed_places.append(processed_place)
            
            # Sort by match score (highest first)
            processed_places.sort(key=lambda x: x['match_score'], reverse=True)
            
            return JsonResponse(processed_places, safe=False)
            
        except Exception as e:
            return JsonResponse({
                'error': 'Failed to fetch places',
                'message': str(e)
            }, status=500)
    
    def calculate_match_score(self, place, user_lat, user_lng):
        """
        Calculate match score based on various factors
        This is where you can implement your matching algorithm
        """
        score = 0
        
        # Base score from rating (0-40 points)
        rating = place.get('rating', 0)
        if rating > 0:
            score += min(40, rating * 8)  # Max 40 points for 5-star rating
        
        # Bonus for matcha-related keywords in name (0-30 points)
        name = place.get('name', '').lower()
        matcha_keywords = ['matcha', 'green tea', 'tea house', 'tea room']
        for keyword in matcha_keywords:
            if keyword in name:
                score += 10
                break
        
        # Distance factor (0-20 points, closer is better)
        distance = self.calculate_distance(
            user_lat, user_lng,
            place['geometry']['location']['lat'],
            place['geometry']['location']['lng']
        )
        if distance <= 1:  # Within 1 mile
            score += 20
        elif distance <= 3:  # Within 3 miles
            score += 15
        elif distance <= 5:  # Within 5 miles
            score += 10
        
        # Price level factor (0-10 points, moderate prices preferred)
        price_level = place.get('price_level', 2)
        if price_level in [2, 3]:  # Moderate to expensive
            score += 10
        elif price_level in [1, 4]:  # Cheap or very expensive
            score += 5
        
        return min(100, max(0, int(score)))  # Ensure 0-100 range
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        """Calculate distance between two points in miles"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 3959  # Earth's radius in miles
        
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c
        
        return round(distance, 1)
    
    def format_price_range(self, price_level):
        """Convert price level to dollar signs"""
        if price_level is None:
            return "Price not available"
        
        price_map = {
            0: "Free",
            1: "$",
            2: "$$",
            3: "$$$",
            4: "$$$$"
        }
        
        return price_map.get(price_level, "Price not available")
    
    def get_photo_urls(self, photos):
        """Extract photo URLs from place photos"""
        photo_urls = []
        for photo in photos[:3]:  # Limit to first 3 photos
            photo_reference = photo.get('photo_reference')
            if photo_reference:
                # You can construct the photo URL using the photo reference
                # This is a simplified version - you might want to use the actual Google Places Photo API
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={settings.GOOGLE_MAPS_API_KEY}"
                photo_urls.append(photo_url)
        
        return photo_urls


# urls.py (add this to your urlpatterns)
from django.urls import path
from .views import PlacesView

urlpatterns = [
    # ... your existing URLs
    path('api/places/', PlacesView.as_view(), name='places'),
]


# settings.py (make sure you have this)
GOOGLE_MAPS_API_KEY = 'your-backend-google-maps-api-key'

# Add to CORS settings if not already there
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",  # Alternative React port
]

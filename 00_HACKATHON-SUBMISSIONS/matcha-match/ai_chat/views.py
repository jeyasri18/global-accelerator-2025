import json
import uuid
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import re
from .models import Conversation, Message, SentimentAnalysis, UserPreference, AIRecommendation
# Note: Using Google Maps API directly instead of Place model

@csrf_exempt
@require_http_methods(["POST"])
def chat_with_ai(request):
    """Main AI chat endpoint"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            session_id = data.get('session_id', '')
            
            if not user_message or not session_id:
                return JsonResponse({'error': 'Missing message or session_id'}, status=400)
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                session_id=session_id
            )
            
            # Save user message
            user_msg = Message.objects.create(
                conversation=conversation,
                role='user',
                content=user_message
            )
            
            # Analyze sentiment and extract preferences
            sentiment_result = analyze_sentiment_with_ollama(user_message)
            sentiment = sentiment_result.get('sentiment', 'neutral')
            preferences = sentiment_result.get('preferences', [])
            
            # Save sentiment analysis
            SentimentAnalysis.objects.create(
                message=user_msg,
                sentiment=sentiment,
                confidence=sentiment_result.get('confidence', 0.8),
                extracted_preferences=json.dumps(preferences)
            )
            
            # Save user preferences
            save_user_preferences(session_id, preferences, sentiment_result.get('confidence', 0.8))
            
            # Get café recommendations
            cafe_recommendations = get_cafe_recommendations(user_message, sentiment, preferences)
            
            # Generate AI response
            ai_message = generate_ai_response(user_message, sentiment, preferences, session_id)
            
            # Save AI message
            ai_msg = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=ai_message
            )
            
            # Save recommendations
            for cafe in cafe_recommendations:
                AIRecommendation.objects.create(
                    conversation=conversation,
                    place_id=cafe['id'],
                    place_name=cafe['name'],
                    recommendation_reason=f"Matches your {sentiment} mood and preferences",
                    sentiment_context=sentiment
                )
            
            return JsonResponse({
                'message': ai_message,
                'recommendations': cafe_recommendations,
                'sentiment': sentiment,
                'session_id': session_id
            })
            
        except Exception as e:
            print(f"Error in chat_with_ai: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def analyze_sentiment_with_ollama(text):
    """Use Ollama to analyze sentiment and extract preferences"""
    try:
        # Prompt for sentiment analysis and preference extraction
        prompt = f"""
        Analyze this café search request: "{text}"
        
        Respond with ONLY a JSON object in this exact format:
        {{
            "sentiment": "one_word_mood",
            "confidence": 0.85,
            "preferences": {{
                "budget": "low/medium/high",
                "vibe": "cozy/trendy/quiet/social/study",
                "location": "nearby/anywhere/specific_area",
                "special_needs": "wifi/outdoor_seating/quiet/accessible"
            }}
        }}
        
        Sentiment options: happy, excited, calm, stressed, sad, angry, neutral, social, focused
        """
        
        # Call Ollama API
        response = requests.post('http://localhost:11434/api/generate', {
            'model': 'llama2',
            'prompt': prompt,
            'stream': False,
        })
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get('response', '')
            
            # Try to parse JSON from response
            try:
                # Extract JSON from the response
                json_start = ai_response.find('{')
                json_end = ai_response.rfind('}') + 1
                if json_start != -1 and json_end != 0:
                    parsed_data = json.loads(ai_response[json_start:json_end])
                    return {
                        'sentiment': parsed_data.get('sentiment', 'neutral'),
                        'confidence': parsed_data.get('confidence', 0.5),
                        'preferences': parsed_data.get('preferences', {})
                    }
            except json.JSONDecodeError:
                pass
            
            # Fallback: keyword-based sentiment analysis
            return fallback_sentiment_analysis(text)
        else:
            return fallback_sentiment_analysis(text)
            
    except Exception as e:
        print(f"Ollama error: {e}")
        return fallback_sentiment_analysis(text)

def fallback_sentiment_analysis(text):
    """Fallback sentiment analysis when Ollama fails"""
    text_lower = text.lower()
    
    # Simple keyword-based sentiment analysis
    happy_words = ['happy', 'excited', 'great', 'awesome', 'love', 'enjoy']
    stressed_words = ['stressed', 'busy', 'work', 'study', 'quiet', 'peaceful']
    social_words = ['friends', 'meet', 'social', 'fun', 'party', 'group']
    focused_words = ['study', 'work', 'focus', 'quiet', 'concentration']
    
    if any(word in text_lower for word in happy_words):
        sentiment = 'happy'
    elif any(word in text_lower for word in stressed_words):
        sentiment = 'stressed'
    elif any(word in text_lower for word in social_words):
        sentiment = 'social'
    elif any(word in text_lower for word in focused_words):
        sentiment = 'focused'
    else:
        sentiment = 'neutral'
    
    # Extract basic preferences
    preferences = {
        'budget': 'medium',
        'vibe': 'neutral',
        'location': 'anywhere',
        'special_needs': 'none'
    }
    
    if any(word in text_lower for word in ['cheap', 'affordable', 'budget']):
        preferences['budget'] = 'low'
    elif any(word in text_lower for word in ['expensive', 'luxury', 'premium']):
        preferences['budget'] = 'high'
    
    if any(word in text_lower for word in ['cozy', 'quiet', 'peaceful']):
        preferences['vibe'] = 'quiet'
    elif any(word in text_lower for word in ['trendy', 'vibrant', 'lively']):
        preferences['vibe'] = 'trendy'
    
    return {
        'sentiment': sentiment,
        'confidence': 0.6,
        'preferences': preferences
    }

def generate_ai_response(user_message, sentiment, preferences, session_id):
    """Generate AI response with real café recommendations"""
    try:
        # Call Ollama for conversational response
        ollama_url = "http://localhost:11434/api/generate"
        prompt = f"""
        You are a friendly AI matcha guide. A user said: "{user_message}"
        Their mood is: {sentiment}
        Their preferences: {preferences}
        
        Respond in a friendly, helpful way and suggest what kind of café experience would be perfect for them.
        Keep it conversational and warm.
        """
        
        payload = {
            "model": "llama3.2:1b",
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(ollama_url, json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            ai_message = result.get('response', '').strip()
        else:
            ai_message = generate_fallback_response(sentiment, preferences)
            
    except Exception as e:
        print(f"Ollama error: {e}")
        ai_message = generate_fallback_response(sentiment, preferences)
    
    return ai_message

def generate_fallback_response(sentiment, preferences):
    """Generate fallback response when Ollama fails"""
    mood_responses = {
        'happy': "I can see you're in a great mood! Let me find you a vibrant, exciting matcha spot that matches your energy.",
        'excited': "Your enthusiasm is contagious! I'll look for a lively, fun café that can keep up with your excitement.",
        'calm': "I understand you're looking for a peaceful experience. Let me find you a serene, calming matcha café.",
        'stressed': "I can sense you need a peaceful place right now. Let me find you a quiet, relaxing café where you can unwind.",
        'social': "Perfect! You're looking for a great place to meet friends. I'll find you a social, welcoming café with great atmosphere.",
        'focused': "I see you need a place to concentrate. Let me find you a quiet, focused environment perfect for work or study.",
        'neutral': "I'd love to help you find the perfect matcha café! Let me search for some great options that might interest you."
    }
    
    return mood_responses.get(sentiment, mood_responses['neutral'])

def save_user_preferences(session_id, preferences, confidence):
    """Save extracted user preferences to database"""
    try:
        for pref_type, pref_value in preferences.items():
            if pref_value and pref_value != 'none':
                UserPreference.objects.update_or_create(
                    session_id=session_id,
                    preference_type=pref_type,
                    defaults={
                        'preference_value': pref_value,
                        'confidence': confidence,
                        'extracted_at': timezone.now()
                    }
                )
    except Exception as e:
        print(f"Error saving preferences: {e}")

def get_cafe_recommendations(user_message, sentiment, preferences):
    """Get real café recommendations from Google Maps - bulletproof version"""
    try:
        # Default location (Sydney)
        lat, lng = -33.8688, 151.2093
        
        # Get places from your existing API
        import requests
        
        try:
            response = requests.get(f'http://localhost:8000/api/places/?lat={lat}&lng={lng}', timeout=10)
            if response.status_code == 200:
                places = response.json()
                print(f"DEBUG: Got {len(places)} places from API")
            else:
                print(f"DEBUG: API returned status {response.status_code}")
                return []
        except Exception as e:
            print(f"DEBUG: Request failed: {e}")
            return []
        
        if not places or not isinstance(places, list):
            print(f"DEBUG: Places is not a valid list: {type(places)}")
            return []
        
        # Take first 3 places without complex sorting
        top_places = places[:3] if len(places) >= 3 else places
        
        # Format recommendations with minimal processing
        recommendations = []
        for place in top_places:
            try:
                # Get basic info with safe defaults
                place_id = place.get('id', 'unknown')
                place_name = place.get('name', 'Unknown Café')
                place_address = place.get('vicinity', 'Address not available')
                place_rating = place.get('rating', 0)
                place_price = place.get('price_level', 2)
                place_distance = place.get('distance', 0)
                
                # Simple price formatting
                if place_price == 1:
                    price_display = '$'
                elif place_price == 2:
                    price_display = '$$'
                elif place_price == 3:
                    price_display = '$$$'
                elif place_price == 4:
                    price_display = '$$$$'
                else:
                    price_display = '$$'
                
                # Create recommendation
                recommendation = {
                    'id': place_id,
                    'name': place_name,
                    'address': place_address,
                    'rating': place_rating,
                    'price_level': price_display,
                    'match_reason': f"Great matcha café in Sydney - perfect for your {sentiment} mood",
                    'distance': place_distance,
                    'photo_url': None  # Skip photos for now to avoid errors
                }
                
                recommendations.append(recommendation)
                print(f"DEBUG: Added recommendation for {place_name}")
                
            except Exception as e:
                print(f"DEBUG: Error processing place {place.get('name', 'unknown')}: {e}")
                continue
        
        print(f"DEBUG: Returning {len(recommendations)} recommendations")
        return recommendations
        
    except Exception as e:
        print(f"Error in get_cafe_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return []

def calculate_match_score(place, sentiment, preferences, user_message):
    """Calculate how well a place matches user sentiment and preferences"""
    score = 50  # Base score
    
    # Rating boost
    rating = place.get('rating', 0)
    if rating >= 4.5:
        score += 20
    elif rating >= 4.0:
        score += 10
    elif rating < 3.5:
        score -= 10
    
    # Sentiment matching
    place_name = place.get('name', '').lower()
    place_types = place.get('types', [])
    
    if sentiment == 'stressed' or sentiment == 'tired':
        if any(word in place_name for word in ['zen', 'quiet', 'peaceful', 'calm']):
            score += 15
        if 'park' in place_types:
            score += 10
    elif sentiment == 'excited' or sentiment == 'happy':
        if any(word in place_name for word in ['social', 'bar', 'rooftop', 'trendy']):
            score += 15
    
    # User message context
    if 'study' in user_message.lower():
        if any(word in place_name for word in ['library', 'quiet', 'study', 'work']):
            score += 20
    elif 'friends' in user_message.lower() or 'meeting' in user_message.lower():
        if any(word in place_name for word in ['social', 'lounge', 'bar']):
            score += 15
    
    # Price preferences
    price_level = place.get('price_level', 2)
    if 'affordable' in str(preferences).lower() or 'budget' in str(preferences).lower():
        if price_level <= 2:
            score += 10
        else:
            score -= 5
    elif 'premium' in str(preferences).lower() or 'luxury' in str(preferences).lower():
        if price_level >= 3:
            score += 10
    
    return max(0, min(100, score))

def get_price_display(price_level):
    """Convert price level to display format"""
    if price_level == 1:
        return '$'
    elif price_level == 2:
        return '$$'
    elif price_level == 3:
        return '$$$'
    elif price_level == 4:
        return '$$$$'
    return '$$'

def get_match_reason(sentiment, preferences, score):
    """Generate a reason why this place matches the user"""
    reasons = []
    
    if score >= 80:
        reasons.append("Perfect match for your mood")
    elif score >= 60:
        reasons.append("Great fit for what you're looking for")
    else:
        reasons.append("Good option to consider")
    
    if sentiment == 'stressed':
        reasons.append("peaceful atmosphere for relaxation")
    elif sentiment == 'excited':
        reasons.append("vibrant energy to match your mood")
    elif sentiment == 'happy':
        reasons.append("perfect spot to enjoy your good vibes")
    
    return " - ".join(reasons)

@require_http_methods(["GET"])
def get_conversation_history(request, session_id):
    """Get conversation history for a session"""
    try:
        conversation = Conversation.objects.get(session_id=session_id)
        messages = conversation.messages.all()
        
        history = []
        for msg in messages:
            history.append({
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'sentiment': getattr(msg.sentiment, 'sentiment', None) if msg.role == 'user' else None
            })
        
        return JsonResponse({'conversation': history})
        
    except Conversation.DoesNotExist:
        return JsonResponse({'conversation': []})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_user_preferences(request, session_id):
    """Get extracted user preferences for a session"""
    try:
        preferences = UserPreference.objects.filter(session_id=session_id)
        
        pref_data = {}
        for pref in preferences:
            pref_data[pref.preference_type] = {
                'value': pref.preference_value,
                'confidence': pref.confidence
            }
        
        return JsonResponse({'preferences': pref_data})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

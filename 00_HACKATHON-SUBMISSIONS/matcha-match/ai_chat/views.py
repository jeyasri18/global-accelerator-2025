import json
import uuid
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import Conversation, Message, SentimentAnalysis, UserPreference, AIRecommendation

@csrf_exempt
@require_http_methods(["POST"])
def chat_with_ai(request):
    """Main AI chat endpoint that processes user messages and returns AI responses"""
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
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
        sentiment_data = analyze_sentiment_with_ollama(user_message)
        
        # Save sentiment analysis
        SentimentAnalysis.objects.create(
            message=user_msg,
            sentiment=sentiment_data['sentiment'],
            confidence=sentiment_data['confidence'],
            extracted_preferences=sentiment_data['preferences']
        )
        
        # Extract and save user preferences
        save_user_preferences(conversation, sentiment_data['preferences'], session_id)
        
        # Generate AI response with café recommendations
        ai_response = generate_ai_response(user_message, sentiment_data, session_id)
        
        # Save AI response
        ai_msg = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response['message']
        )
        
        # Save recommendations if any
        for rec in ai_response.get('recommendations', []):
            AIRecommendation.objects.create(
                conversation=conversation,
                place_id=rec['place_id'],
                place_name=rec['place_name'],
                recommendation_reason=rec['reason'],
                sentiment_context=sentiment_data['sentiment'],
                confidence=rec['confidence']
            )
        
        return JsonResponse({
            'message': ai_response['message'],
            'recommendations': ai_response.get('recommendations', []),
            'sentiment': sentiment_data['sentiment'],
            'session_id': session_id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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

def generate_ai_response(user_message, sentiment_data, session_id):
    """Generate AI response with café recommendations"""
    try:
        # Build context-aware prompt
        sentiment = sentiment_data['sentiment']
        preferences = sentiment_data['preferences']
        
        prompt = f"""
        You are a friendly AI assistant helping someone find their perfect matcha café.
        
        User message: "{user_message}"
        User mood: {sentiment}
        User preferences: {json.dumps(preferences)}
        
        Respond in a friendly, conversational way. If you can recommend cafés, mention:
        - Why this café matches their mood and preferences
        - What makes it special
        - Any relevant details about atmosphere, pricing, or location
        
        Keep your response warm and helpful, like talking to a friend.
        """
        
        # Call Ollama for response generation
        response = requests.post('http://localhost:11434/api/generate', {
            'model': 'llama2',
            'prompt': prompt,
            'stream': False,
        })
        
        if response.status_code == 200:
            result = response.json()
            ai_message = result.get('response', 'I understand you\'re looking for a great matcha café! Let me help you find the perfect spot.')
        else:
            ai_message = generate_fallback_response(sentiment, preferences)
        
        # For now, return a simple response
        # In a full implementation, you'd query your café database here
        return {
            'message': ai_message,
            'recommendations': []  # Will be populated when you integrate with your café database
        }
        
    except Exception as e:
        return {
            'message': f"I'd love to help you find the perfect matcha café! Based on your message, I can see you're looking for something that matches your mood. Let me search for some great options for you.",
            'recommendations': []
        }

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

def save_user_preferences(conversation, preferences, session_id):
    """Save extracted user preferences to database"""
    try:
        for pref_type, pref_value in preferences.items():
            if pref_value and pref_value != 'none':
                UserPreference.objects.update_or_create(
                    user=conversation.user,
                    session_id=session_id,
                    preference_type=pref_type,
                    defaults={
                        'preference_value': pref_value,
                        'confidence': 0.8,
                        'extracted_at': timezone.now()
                    }
                )
    except Exception as e:
        print(f"Error saving preferences: {e}")

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

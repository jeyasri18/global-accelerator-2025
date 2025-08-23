import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Heart, Coffee, MapPin } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sentiment?: string;
  recommendations?: any[];
}

interface ChatResponse {
  message: string;
  recommendations: any[];
  sentiment: string;
  session_id: string;
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentSentiment, setCurrentSentiment] = useState<string>('neutral');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique session ID for this chat
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI matcha guide! 🍵 Tell me what kind of café experience you're looking for. For example: 'I want a peaceful place to study' or 'Looking for a fun spot to meet friends!'",
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSentimentEmoji = (sentiment: string) => {
    const emojiMap: { [key: string]: string } = {
      'happy': '😊',
      'excited': '🤩',
      'calm': '😌',
      'stressed': '😰',
      'sad': '😢',
      'angry': '😠',
      'neutral': '😐',
      'social': '👥',
      'focused': '🎯'
    };
    return emojiMap[sentiment] || '😐';
  };

  const getSentimentColor = (sentiment: string) => {
    const colorMap: { [key: string]: string } = {
      'happy': 'text-green-600',
      'excited': 'text-yellow-600',
      'calm': 'text-blue-600',
      'stressed': 'text-orange-600',
      'sad': 'text-gray-600',
      'angry': 'text-red-600',
      'neutral': 'text-gray-500',
      'social': 'text-purple-600',
      'focused': 'text-indigo-600'
    };
    return colorMap[sentiment] || 'text-gray-500';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: sessionId,
        }),
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        
        // Create AI message with recommendations
        const aiMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
          recommendations: data.recommendations || [], // Add recommendations
        };

        setMessages(prev => [...prev, aiMessage]);
        setCurrentSentiment(data.sentiment);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Coffee className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">MatchaMatch AI</h3>
            <p className="text-sm text-gray-600">Your personal matcha guide</p>
          </div>
        </div>
        
        {/* Sentiment Indicator */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Mood:</span>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 ${getSentimentColor(currentSentiment)}`}>
            <span className="text-lg">{getSentimentEmoji(currentSentiment)}</span>
            <span className="text-sm font-medium capitalize">{currentSentiment}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'user' && message.sentiment && (
                  <span className="text-sm opacity-75">
                    {getSentimentEmoji(message.sentiment)}
                  </span>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
              
              {/* Show recommendations if available */}
              {message.role === 'assistant' && message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">🍵 Here are your café recommendations:</p>
                  {message.recommendations.map((cafe, cafeIndex) => (
                    <div key={cafeIndex} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-800">{cafe.name}</h4>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {cafe.address}
                          </p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              ⭐ {cafe.rating}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {cafe.price_level}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {cafe.distance}km
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-green-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what kind of matcha experience you're looking for..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "I want a peaceful place to study",
            "Looking for a fun spot with friends",
            "Need something affordable",
            "Show me trendy cafés"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;

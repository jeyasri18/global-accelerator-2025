import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AIChatInterface from "@/components/AIChatInterface";
import TopPlacesCarousel from "@/components/TopPlacesCarousel";
import { Coffee, MessageCircle, MapPin, Sparkles, X } from "lucide-react";

export default function AIFinder() {
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Coffee className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-800">MatchaMatch</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  showChat 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">
                  {showChat ? 'Hide AI Chat' : 'Ask AI Guide'}
                </span>
              </button>
              
              <button
                onClick={() => navigate("/home")}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">View All Spots</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content - Centered */}
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Matching</span>
              </div>
            </div>
            
            <h2 className="text-4xl font-extrabold text-green-800 mb-4 tracking-wide">
              Your Matcha Match is Here!
            </h2>
            <p className="text-green-600 text-lg mb-6">
              Discover the perfect matcha café that matches your vibe and preferences
            </p>

            <button
              onClick={() => navigate("/home")}
              className="bg-green-600 hover:bg-green-700 transition text-white font-bold py-3 px-8 rounded-full shadow-lg"
            >
              View All Matcha Spots
            </button>
          </div>

          {/* Top Places Carousel - Centered */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-green-800 mb-6">Top Rated Places</h3>
            <TopPlacesCarousel />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">AI Chat Guide</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Tell our AI what you're looking for and get personalized recommendations
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Sentiment Analysis</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Our AI understands your mood and finds cafés that match your vibe
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">1</div>
                <span className="text-gray-700">Tell our AI what you're looking for</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">2</div>
                <span className="text-gray-700">AI analyzes your mood and preferences</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                <span className="text-gray-700">Get personalized café recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-green-700 font-light text-sm">
            Powered by your vibe & a sprinkle of AI magic ✨
          </p>
          <p className="text-green-600 text-xs mt-2">
            OpenxAI Global AI Accelerator 2025 Hackathon Submission
          </p>
        </div>
      </div>

      {/* AI Chat Popup - Bottom of Screen */}
      {showChat && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-white rounded-t-3xl shadow-2xl border-t-2 border-green-200 max-h-[80vh] overflow-hidden">
            {/* Chat Header */}
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">AI Matcha Guide</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Interface */}
            <div className="h-[60vh]">
              <AIChatInterface />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

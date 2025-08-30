import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import AIChatInterface from "@/components/AIChatInterface";
import TopPlacesCarousel from "@/components/TopPlacesCarousel";
import { MessageCircle, Sparkles, X } from "lucide-react";

export default function AIFinder() {
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if chat should be opened from URL parameter
  useEffect(() => {
    const openChat = searchParams.get('openChat');
    if (openChat === 'true') {
      setShowChat(true);
      // Remove the query parameter from URL without navigation
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full px-4 py-8">
        {/* AI Chat Button */}
        <div className="flex justify-end mb-6 max-w-7xl mx-auto">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              showChat 
                ? 'bg-primary text-foreground shadow-lg' 
                : 'bg-primary text-foreground border-2 border-background hover:bg-primary/80'
            } font-cute`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">
              {showChat ? 'Hide AI Chat' : 'Ask AI Guide'}
            </span>
          </button>
        </div>
        
        {/* Main Content - Centered */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="bg-appprimary rounded-3xl shadow-xl p-8">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-appbg text-foreground px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Matching</span>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-foreground mb-4 tracking-wide">
              Your Matcha Match is Here!
            </h2>
            <p className="text-foreground/90 text-lg mb-6">
              Discover the perfect matcha café that matches your vibe and preferences
            </p>
            <button
              onClick={() => navigate("/home")}
              className="bg-appbg hover:bg-appprimary transition text-foreground font-bold py-3 px-8 rounded-full shadow-lg"
            >
              View All Matcha Spots
            </button>
          </div>
        </div>
        
        {/* Top Places Carousel - Full Width */}
        <div className="w-full mt-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Top Rated Places</h3>
          <TopPlacesCarousel />
        </div>
        
        {/* Features - Centered */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-8">
          <div className="bg-appprimary/90 backdrop-blur-sm rounded-2xl p-6 border border-appbg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-appbg rounded-full">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">AI Chat Guide</h3>
            </div>
            <p className="text-foreground/80 text-sm">
              Tell our AI what you're looking for and get personalized recommendations
            </p>
          </div>
          <div className="bg-appprimary/90 backdrop-blur-sm rounded-2xl p-6 border border-appbg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-appbg rounded-full">
                <Sparkles className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Sentiment Analysis</h3>
            </div>
            <p className="text-foreground/80 text-sm">
              Our AI understands your mood and finds cafés that match your vibe
            </p>
          </div>
        </div>
        
        {/* How It Works - Centered */}
        <div className="bg-appprimary/90 backdrop-blur-sm rounded-2xl p-6 border border-appbg max-w-4xl mx-auto mt-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">How It Works</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-appbg rounded-full flex items-center justify-center text-foreground font-bold text-sm">1</div>
              <span className="text-foreground">Tell our AI what you're looking for</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-appbg rounded-full flex items-center justify-center text-foreground font-bold text-sm">2</div>
              <span className="text-foreground">AI analyzes your mood and preferences</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-appbg rounded-full flex items-center justify-center text-foreground font-bold text-sm">3</div>
              <span className="text-foreground">Get personalized café recommendations</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center max-w-4xl mx-auto">
          <p className="text-appbg font-light text-sm">
            Powered by your vibe & a sprinkle of AI magic ✨
          </p>
          <p className="text-appprimary text-xs mt-2">
            OpenxAI Global AI Accelerator 2025 Hackathon Submission
          </p>
        </div>
      </div>
      {/* AI Chat Popup - Bottom of Screen */}
      {showChat && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-appprimary rounded-t-3xl shadow-2xl border-t-2 border-appbg max-h-[80vh] overflow-hidden">
            {/* Chat Header */}
            <div className="bg-appbg text-foreground px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">AI Matcha Guide</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-appprimary rounded-full transition-colors"
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

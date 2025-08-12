import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Preferences() {
  const [preferences, setPreferences] = useState({
    matchaType: "",
    sweetness: [50],
    priceRange: "",
    atmosphere: [] as string[],
    experience: "",
    notes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAtmosphereChange = (atmosphere: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      atmosphere: checked 
        ? [...prev.atmosphere, atmosphere]
        : prev.atmosphere.filter(item => item !== atmosphere)
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    
    // TODO: Save to Supabase database
    // const { data, error } = await supabase
    //   .from('user_preferences')
    //   .insert([
    //     {
    //       user_id: user.id,
    //       matcha_type: preferences.matchaType,
    //       sweetness_level: preferences.sweetness[0],
    //       price_range: preferences.priceRange,
    //       preferred_atmosphere: preferences.atmosphere,
    //       experience_level: preferences.experience,
    //       notes: preferences.notes
    //     }
    //   ]);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences saved! 🌿",
        description: "We'll find the perfect matcha spots for you",
      });
      navigate("/");
    }, 1000);
  };

  const canProceed = preferences.matchaType && preferences.priceRange && preferences.experience;

  return (
    <div className="min-h-screen bg-gradient-matcha p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-matcha-800">🍃 Tell us about you</h1>
          <p className="text-matcha-600">Help us find your perfect matcha experience</p>
        </div>

        <Card className="border-matcha-200 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-matcha-800">Your Matcha Preferences</CardTitle>
            <CardDescription className="text-matcha-600">
              This helps us recommend the best spots for your taste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Matcha Type Preference */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What's your favorite type of matcha? ✨
              </Label>
              <RadioGroup 
                value={preferences.matchaType} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, matchaType: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="traditional" id="traditional" />
                  <Label htmlFor="traditional" className="text-matcha-700">Traditional ceremonial matcha</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="latte" id="latte" />
                  <Label htmlFor="latte" className="text-matcha-700">Matcha lattes & drinks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="desserts" id="desserts" />
                  <Label htmlFor="desserts" className="text-matcha-700">Matcha desserts & sweets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-matcha-700">All types - I love variety!</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sweetness Level */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                How sweet do you like it? 🍯
              </Label>
              <div className="px-4">
                <Slider
                  value={preferences.sweetness}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, sweetness: value }))}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-matcha-600 mt-2">
                  <span>Bitter & Pure</span>
                  <span className="font-medium">{preferences.sweetness[0]}% sweet</span>
                  <span>Very Sweet</span>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What's your budget range? 💰
              </Label>
              <RadioGroup 
                value={preferences.priceRange} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$" id="budget" />
                  <Label htmlFor="budget" className="text-matcha-700">$ - Budget-friendly (Under $10)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$$" id="moderate" />
                  <Label htmlFor="moderate" className="text-matcha-700">$$ - Moderate ($10-20)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$$$" id="upscale" />
                  <Label htmlFor="upscale" className="text-matcha-700">$$$ - Upscale ($20-35)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$$$$" id="luxury" />
                  <Label htmlFor="luxury" className="text-matcha-700">$$$$ - Luxury ($35+)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Atmosphere Preferences */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What atmosphere do you prefer? 🌸 (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "quiet", label: "Quiet & peaceful" },
                  { id: "social", label: "Social & lively" },
                  { id: "traditional", label: "Traditional Japanese" },
                  { id: "modern", label: "Modern & trendy" },
                  { id: "cozy", label: "Cozy & intimate" },
                  { id: "spacious", label: "Spacious & airy" }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={preferences.atmosphere.includes(item.id)}
                      onCheckedChange={(checked) => handleAtmosphereChange(item.id, checked as boolean)}
                    />
                    <Label htmlFor={item.id} className="text-matcha-700">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                How would you describe your matcha experience? 🎯
              </Label>
              <RadioGroup 
                value={preferences.experience} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, experience: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="text-matcha-700">New to matcha - show me the basics!</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="text-matcha-700">I enjoy matcha occasionally</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="text-matcha-700">I'm a matcha enthusiast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <Label htmlFor="expert" className="text-matcha-700">I'm a matcha connoisseur</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Notes */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                Anything else we should know? 📝
              </Label>
              <Textarea
                placeholder="Any dietary restrictions, special occasions, or specific requests..."
                value={preferences.notes}
                onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
                className="border-matcha-200 focus:border-matcha-400"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex-1 border-matcha-300 text-matcha-700 hover:bg-matcha-50"
              >
                Skip for now
              </Button>
              <Button 
                onClick={handleSavePreferences}
                disabled={!canProceed || isLoading}
                className="flex-1 bg-matcha-600 hover:bg-matcha-700 text-white"
              >
                {isLoading ? "Saving..." : "Save & Find Matcha! 🍃"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
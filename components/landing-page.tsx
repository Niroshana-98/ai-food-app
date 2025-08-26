'use client';

import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, MapPin, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { DishSuggestionScreen } from "./dish-suggestion-screen";
import { RestaurantSuggestionScreen } from "./restaurant-suggestion-screen";
import { UserDashboard } from "./user-dashboard";
import { AdminDashboard } from "./admin-dashboard";

export function LandingPage() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case "dish-suggestion":
        return <DishSuggestionScreen onNext={() => setCurrentScreen("restaurant-suggestion")} />;
      case "restaurant-suggestion":
        return <RestaurantSuggestionScreen onBack={() => setCurrentScreen("dish-suggestion")} />;
      case "user-dashboard":
        return <UserDashboard onBack={() => setCurrentScreen("landing")} />;
      case "admin-dashboard":
        return <AdminDashboard onBack={() => setCurrentScreen("landing")} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            
            <div className="container mx-auto px-6 py-20">
              <Hero onGetRecommendations={() => setCurrentScreen("dish-suggestion")} />

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                {siteConfig.features.map((feature) => (
                  <Card key={feature.title} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {feature.title.includes("AI") && <Utensils className="h-6 w-6 text-orange-600" />}
                        {feature.title.includes("Restaurants") && <MapPin className="h-6 w-6 text-blue-600" />}
                        {feature.title.includes("Dietary") && <Heart className="h-6 w-6 text-green-600" />}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cuisines */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8">Popular Cuisines</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {siteConfig.cuisines.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary" className="px-4 py-2 text-sm hover:bg-orange-100 cursor-pointer">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderScreen();
}

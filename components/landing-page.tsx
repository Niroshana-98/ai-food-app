"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, MapPin, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { DishSuggestionScreen } from "./dish-suggestion-screen";
import { RestaurantSuggestionScreen } from "./restaurant-suggestion-screen";
import { UserDashboard } from "./user-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { api } from "@/lib/api";
import { Dish } from "@/lib/types";

export function LandingPage() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cuisine + dishes state
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [cuisineDishes, setCuisineDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);

  // Default random dishes
  const [randomDishes, setRandomDishes] = useState<Dish[]>([]);
  const [randomLoading, setRandomLoading] = useState(true);

  // ✅ Fetch 6 random dishes
  const fetchRandomDishes = async () => {
    setRandomLoading(true);
    try {
      const dishes = await api.getDishes(); // fetch all dishes
      if (dishes.length > 0) {
        const shuffled = dishes.sort(() => 0.5 - Math.random());
        setRandomDishes(shuffled.slice(0, 6)); // take 6 random
      }
    } catch (err) {
      console.error("Error fetching random dishes:", err);
    } finally {
      setRandomLoading(false);
    }
  };

  // ✅ Run on mount + refresh every 1 minute
  useEffect(() => {
    fetchRandomDishes();
    const interval = setInterval(fetchRandomDishes, 60000); // 60 sec
    return () => clearInterval(interval);
  }, []);

  // ✅ Handle cuisine click
  const handleCuisineClick = async (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setLoading(true);
    try {
      const dishes = await api.getDishesByCuisine(cuisine);
      setCuisineDishes(dishes);
    } catch (err) {
      console.error("Error fetching dishes by cuisine:", err);
    } finally {
      setLoading(false);
    }
  };

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
                      <div
                        className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
                      >
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
                    <Badge
                      key={cuisine}
                      variant="secondary"
                      className="px-4 py-2 text-sm hover:bg-orange-100 cursor-pointer"
                      onClick={() => handleCuisineClick(cuisine)}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Default Random Dishes */}
              {!selectedCuisine && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    {randomLoading ? "Loading dishes..." : "Trending Dishes"}
                  </h3>
                  {randomLoading ? (
                    <p className="text-center text-gray-500">Fetching dishes...</p>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                      {randomDishes.map((dish) => (
                        <Card key={dish._id} className="p-4 hover:shadow-md">
                          {dish.photo && (
                            <img
                              src={dish.photo}
                              alt={dish.name}
                              className="w-full h-40 object-cover rounded-md mb-3"
                            />
                          )}
                          <h4 className="font-semibold">{dish.name}</h4>
                          <p className="text-sm text-gray-600">
                            {typeof dish.restaurant === "string" ? "Unknown" : dish.restaurant?.name}
                          </p>
                          <p className="font-medium text-orange-600">${dish.price}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cuisine Dishes */}
              {selectedCuisine && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    {loading ? `Loading ${selectedCuisine} dishes...` : `${selectedCuisine} Dishes`}
                  </h3>
                  {loading ? (
                    <p className="text-center text-gray-500">Fetching dishes...</p>
                  ) : cuisineDishes.length === 0 ? (
                    <p className="text-center text-gray-500">No dishes found for {selectedCuisine}.</p>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                      {cuisineDishes.map((dish) => (
                        <Card key={dish._id} className="p-4 hover:shadow-md">
                          {dish.photo && (
                            <img
                              src={dish.photo}
                              alt={dish.name}
                              className="w-full h-40 object-cover rounded-md mb-3"
                            />
                          )}
                          <h4 className="font-semibold">{dish.name}</h4>
                          <p className="text-sm text-gray-600">
                            {typeof dish.restaurant === "string" ? "Unknown" : dish.restaurant?.name}
                          </p>
                          <p className="font-medium text-orange-600">${dish.price}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return renderScreen();
}

"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, MapPin, Heart, ArrowRight, Tag, Star, Store, Search, Loader2, ChefHat, Sparkles, Users, Clock, TrendingUp, Flame } from "lucide-react";
import { siteConfig } from "@/config/site";
import { DishSuggestionScreen } from "./dish-suggestion-screen";
import { RestaurantSuggestionScreen } from "./restaurant-suggestion-screen";
import { UserDashboard } from "./user-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { api } from "@/lib/api";
import { Restaurant } from "@/lib/types"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingPage() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cuisine + restaurants state
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [cuisineRestaurants, setCuisineRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  // Default random restaurants
  const [randomRestaurants, setRandomRestaurants] = useState<Restaurant[]>([]);
  const [randomLoading, setRandomLoading] = useState(true);

  // ✅ Fetch 6 random restaurants
  const fetchRandomRestaurants = async () => {
    setRandomLoading(true);
    try {
      const restaurants = await api.getRestaurants(); // fetch all restaurants
      if (restaurants.length > 0) {
        const shuffled = restaurants.sort(() => 0.5 - Math.random());
        setRandomRestaurants(shuffled.slice(0, 6)); // take 6 random
      }
    } catch (err) {
      console.error("Error fetching random restaurants:", err);
    } finally {
      setRandomLoading(false);
    }
  };

  // ✅ Run on mount + refresh every 1 minute
  useEffect(() => {
    fetchRandomRestaurants();
    const interval = setInterval(fetchRandomRestaurants, 60000); // 60 sec
    return () => clearInterval(interval);
  }, []);

  // ✅ Handle cuisine click
  const handleCuisineClick = async (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setLoading(true);
    try {
      const restaurants = await api.getRestaurantsByCuisine(cuisine);
      setCuisineRestaurants(restaurants);
    } catch (err) {
      console.error("Error fetching restaurants by cuisine:", err);
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
              <Hero onGetRecommendations={() => setCurrentScreen("restaurant-suggestion")} />

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

              {/* Default Random Restaurants */}
              {!selectedCuisine && (
                <div className="mt-12">
                  {/* Header Section with Animation */}
                  <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
                    <h3 className="text-3xl font-bold text-orange-600 mb-2">
                      {randomLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                          <span>Discovering Amazing Restaurants...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <TrendingUp className="h-8 w-8 text-orange-600" />
                          <span>Trending Restaurants</span>
                          <Flame className="h-7 w-7 text-orange-500 animate-pulse" />
                        </div>
                      )}
                    </h3>
                    
                    {!randomLoading && randomRestaurants.length > 0 && (
                      <p className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                        Discover the hottest dining spots everyone's talking about
                      </p>
                    )}
                  </div>

                  {/* Loading State */}
                  {randomLoading ? (
                    <div className="flex flex-col items-center py-12 animate-in fade-in-0 duration-500">
                      <div className="relative mb-6">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-200 to-orange-300 animate-pulse" />
                        <Heart className="absolute inset-0 m-auto h-10 w-10 text-orange-600 animate-bounce" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">Finding the best restaurants for you...</p>
                    </div>
                  ) : (
                    /* Restaurant Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {randomRestaurants.map((restaurant, index) => (
                        <Card
                          key={restaurant._id}
                          className={cn(
                            "group overflow-hidden border-0 bg-background/60 backdrop-blur-sm shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.03] animate-in fade-in-0 slide-in-from-bottom-8 fill-mode-both",
                            `delay-[${index * 100}ms]`
                          )}
                        >
                          {/* Image Container */}
                          <div className="relative overflow-hidden">
                            <img
                              src={restaurant.photo || "/default-restaurant.png"}
                              alt={restaurant.name}
                              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/default-restaurant.png";
                              }}
                            />
                            
                            {/* Trending Badge */}
                            <Badge className="absolute top-3 left-3 bg-orange-600 text-white hover:bg-orange-700 shadow-lg animate-pulse">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Floating Rating Badge 
                            <Badge className="absolute top-3 right-3 bg-background/90 text-foreground hover:bg-background/90 shadow-lg translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {(Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)}
                            </Badge>*/}

                            {/* Heart Icon for Favorites */}
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer hover:bg-orange-50">
                              <Heart className="h-4 w-4 text-orange-600 hover:fill-orange-600 transition-all duration-200" />
                            </div>
                          </div>

                          {/* Content */}
                          <CardContent className="p-6 space-y-4">
                            {/* Restaurant Name with trending indicator */}
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300 line-clamp-1 flex-1">
                                {restaurant.name}
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-orange-600 font-medium">Hot</span>
                              </div>
                            </div>

                            {/* Cuisine Types */}
                            {restaurant.cuisineTypes && (
                              <div className="flex flex-wrap gap-2">
                                {restaurant.cuisineTypes.slice(0, 3).map((cuisine, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="secondary" 
                                    className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
                                  >
                                    <Utensils className="h-3 w-3 mr-1" />
                                    {cuisine}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Address with enhanced styling */}
                            <div className="flex items-start gap-2 text-muted-foreground bg-gradient-to-r from-gray-50 to-orange-50 p-3 rounded-lg border border-orange-100">
                              <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm line-clamp-2">{restaurant.address}</p>
                            </div>

                            {/* Stats Row 
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span>25-35 min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-orange-600" />
                                <span>{Math.floor(Math.random() * 500 + 100)}+ orders</span>
                              </div>
                            </div>*/}

                            {/* Action Button with enhanced design */}
                            <Link href={`/restaurants/${restaurant._id}`} className="block">
                              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <span className="relative z-10">Explore Restaurant</span>
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
                              </Button>
                            </Link>
                          </CardContent>

                          {/* Enhanced Decorative Background Elements */}
                          <div className="absolute -top-3 -right-3 h-20 w-20 bg-gradient-to-br from-orange-300/30 to-orange-400/30 rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                          <div className="absolute -bottom-5 -left-5 h-24 w-24 bg-gradient-to-br from-orange-200/20 to-orange-300/20 rounded-full -rotate-12 group-hover:-rotate-45 transition-transform duration-700" />
                          
                          {/* Floating particles effect */}
                          <div className="absolute top-1/2 left-1/2 h-1 w-1 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-100" />
                          <div className="absolute top-1/3 right-1/4 h-1 w-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200" />
                          <div className="absolute bottom-1/3 left-1/4 h-1 w-1 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-300" />
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cuisine Restaurants */}
              {selectedCuisine && (
                <div className="mt-12">
                  {/* Header Section with Animation */}
                  <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
                    <h3 className="text-3xl font-bold text-orange-600 mb-2">
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                          <span>Discovering {selectedCuisine} restaurants...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <ChefHat className="h-8 w-8 text-orange-600" />
                          <span>{selectedCuisine} Restaurants</span>
                          <Sparkles className="h-6 w-6 text-orange-500" />
                        </div>
                      )}
                    </h3>
                    
                    {!loading && cuisineRestaurants.length > 0 && (
                      <p className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                        Found {cuisineRestaurants.length} amazing {selectedCuisine.toLowerCase()} restaurants for you
                      </p>
                    )}
                  </div>

                  {/* Loading State */}
                  {loading ? (
                    <div className="flex flex-col items-center py-12 animate-in fade-in-0 duration-500">
                      <div className="relative mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-200 to-red-200 animate-pulse" />
                        <Search className="absolute inset-0 m-auto h-8 w-8 text-orange-600 animate-bounce" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">Searching for the best restaurants...</p>
                    </div>
                  ) : cuisineRestaurants.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12 animate-in fade-in-0 zoom-in-95 duration-500">
                      <Store className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No restaurants found</h4>
                      <p className="text-muted-foreground">No {selectedCuisine} restaurants available at the moment</p>
                    </div>
                  ) : (
                    /* Restaurant Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cuisineRestaurants.map((restaurant, index) => (
                        <Card
                          key={restaurant._id}
                          className={cn(
                            "group overflow-hidden border-0 bg-background/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-8 fill-mode-both",
                            `delay-[${index * 100}ms]`
                          )}
                        >
                          {/* Image Container */}
                          <div className="relative overflow-hidden">
                            <img
                              src={restaurant.photo || "/default-restaurant.png"}
                              alt={restaurant.name}
                              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/default-restaurant.png";
                              }}
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Floating Rating Badge 
                            <Badge className="absolute top-3 right-3 bg-background/90 text-foreground hover:bg-background/90 shadow-lg translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              4.5
                            </Badge>*/}
                          </div>

                          {/* Content */}
                          <CardContent className="p-6 space-y-4">
                            {/* Restaurant Name */}
                            <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                              {restaurant.name}
                            </CardTitle>

                            {/* Cuisine Types */}
                            {restaurant.cuisineTypes && (
                              <div className="flex flex-wrap gap-2">
                                {restaurant.cuisineTypes.slice(0, 3).map((cuisine, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="secondary" 
                                    className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {cuisine}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Address */}
                            <div className="flex items-start gap-2 text-muted-foreground bg-gradient-to-r from-gray-50 to-orange-50 p-3 rounded-lg border border-orange-100">
                              <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm line-clamp-2">{restaurant.address}</p>
                            </div>

                            {/* Action Button */}
                            <Link href={`/restaurants/${restaurant._id}`} className="block">
                              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <span>View Restaurant</span>
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </Button>
                            </Link>
                          </CardContent>

                          {/* Decorative Background Elements */}
                          <div className="absolute -top-2 -right-2 h-16 w-16 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                          <div className="absolute -bottom-4 -left-4 h-20 w-20 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full -rotate-12 group-hover:-rotate-45 transition-transform duration-700" />
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
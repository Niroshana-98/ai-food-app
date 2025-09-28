"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, MapPin, Heart, ArrowRight, Tag, Star, Store, Search, Loader2, ChefHat, Sparkles, Users, Clock, TrendingUp, Flame, X, Zap } from "lucide-react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setHasSearched(true);
    setSelectedCuisine(null); // Clear cuisine filter when searching
    
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || data || []); // Handle different response formats
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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

  // ✅ Run on mount + refresh every 5 minutes
  useEffect(() => {
    fetchRandomRestaurants();
    const interval = setInterval(fetchRandomRestaurants, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // ✅ Handle cuisine click
  const handleCuisineClick = async (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setHasSearched(false); // Clear search when selecting cuisine
    setSearchQuery(""); // Clear search query
    setSearchResults([]);
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
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer transition-all duration-200",
                        selectedCuisine === cuisine
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "hover:bg-orange-100"
                      )}
                      onClick={() => handleCuisineClick(cuisine)}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI-Powered Search Section */}
              <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-3">
                    <Zap className="h-8 w-8 text-orange-600" />
                    AI-Powered Restaurant Search
                    <Sparkles className="h-6 w-6 text-orange-500" />
                  </h2>
                  <p className="text-muted-foreground">
                    Discover restaurants using natural language. Try "romantic Italian dinner" or "spicy Asian food near downtown"
                  </p>
                </div>

                <div className="flex items-center gap-3 max-w-2xl mx-auto">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search for restaurants, cuisines, ambiance, or specific dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full border-2 border-orange-200 rounded-xl px-6 py-4 text-lg focus:border-orange-500 focus:outline-none transition-colors duration-200 pr-12"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={searchLoading || !searchQuery.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {searchLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                    <span className="ml-2">Search</span>
                  </Button>
                </div>

                {/* Search suggestions */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Try:</span>
                  {[
                    "romantic dinner with wine",
                    "family-friendly pizza",
                    "spicy Thai food",
                    "seafood with ocean views",
                    "vegetarian Indian cuisine"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        // Auto-search after setting suggestion
                        setTimeout(() => handleSearch(), 100);
                      }}
                      className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Search Results */}
              {hasSearched && (
                <div className="mt-12">
                  <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
                    <h3 className="text-3xl font-bold text-orange-600 mb-2">
                      {searchLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                          <span>AI is analyzing your request...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <Zap className="h-8 w-8 text-orange-600" />
                          <span>Search Results for "{searchQuery}"</span>
                          <Badge className="bg-orange-600 text-white">
                            {searchResults.length} found
                          </Badge>
                        </div>
                      )}
                    </h3>
                    
                    {!searchLoading && (
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <span>Powered by AI Vector Search</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Semantic Matching
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Search Loading State */}
                  {searchLoading ? (
                    <div className="flex flex-col items-center py-12 animate-in fade-in-0 duration-500">
                      <div className="relative mb-6">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-200 to-orange-300 animate-pulse" />
                        <Search className="absolute inset-0 m-auto h-10 w-10 text-orange-600 animate-bounce" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">AI is finding the perfect matches...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    /* No Results State */
                    <div className="text-center py-12 animate-in fade-in-0 zoom-in-95 duration-500">
                      <div className="relative mb-6">
                        <div className="h-20 w-20 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
                          <Search className="h-10 w-10 text-gray-400" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">No restaurants found</h4>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search terms or browse our popular cuisines above
                      </p>
                      <Button onClick={clearSearch} variant="outline">
                        Clear search and explore
                      </Button>
                    </div>
                  ) : (
                    /* Search Results Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.map((restaurant, index) => (
                        <Card
                          key={restaurant._id}
                          className={cn(
                            "group overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.03] animate-in fade-in-0 slide-in-from-bottom-8 fill-mode-both",
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
                            
                            {/* AI Match Badge */}
                            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg animate-pulse">
                              <Zap className="h-3 w-3 mr-1" />
                              AI Match
                            </Badge>
                            
                           
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Content */}
                          <CardContent className="p-6 space-y-4">
                            {/* Restaurant Name with AI indicator */}
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300 line-clamp-1 flex-1">
                                {restaurant.name}
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                                <span className="text-xs text-orange-600 font-medium">AI</span>
                              </div>
                            </div>

                            {/* Description snippet if available 
                            {restaurant.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-600">
                                {restaurant.description}
                              </p>
                            )}*/}

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

                            {/* Action Button with enhanced design */}
                            <Link href={`/restaurants/${restaurant._id}`} className="block">
                              <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <Sparkles className="mr-2 h-4 w-4 relative z-10" />
                                <span className="relative z-10">AI Recommended</span>
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
                              </Button>
                            </Link>
                          </CardContent>

                          {/* Enhanced AI-themed decorative elements */}
                          <div className="absolute -top-3 -right-3 h-20 w-20 bg-gradient-to-br from-orange-300/40 to-red-400/40 rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                          <div className="absolute -bottom-5 -left-5 h-24 w-24 bg-gradient-to-br from-orange-200/30 to-red-300/30 rounded-full -rotate-12 group-hover:-rotate-45 transition-transform duration-700" />
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Default Random Restaurants - Show only when no search or cuisine filter */}
              {!selectedCuisine && !hasSearched && (
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

              {/* Cuisine Restaurants - Show when cuisine is selected */}
              {selectedCuisine && !hasSearched && (
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
                      <Button 
                        onClick={() => setSelectedCuisine(null)} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Browse all restaurants
                      </Button>
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
                            
                            {/* Cuisine Badge */}
                            <Badge className="absolute top-3 left-3 bg-orange-600 text-white hover:bg-orange-700 shadow-lg">
                              <ChefHat className="h-3 w-3 mr-1" />
                              {selectedCuisine}
                            </Badge>
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Content */}
                          <CardContent className="p-6 space-y-4">
                            {/* Restaurant Name */}
                            <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                              {restaurant.name}
                            </CardTitle>

                            {/* Description if available */}
                            {restaurant.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {restaurant.description}
                              </p>
                            )}

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
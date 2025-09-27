"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  Users,
  Award,
  Utensils,
  Camera,
  Search,
} from "lucide-react";

interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  cuisineTypes: string[];
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>;
  status: string;
  photo?: string;
  createdAt: Date;
}

interface Dish {
  _id: string;
  restaurant: string;
  name: string;
  price: number;
  description: string;
  category: string;
  cuisineType: string;
  preparationTime: number;
  dietaryTags: string[];
  ingredients: string[];
  available: boolean;
  photo?: string;
}

const categories = ["All", "Appetizer", "Main Course", "Pizza", "Seafood", "Dessert"];

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params?.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { cart, addToCart, updateQuantity } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  // Fetch restaurant + dishes
  useEffect(() => {
    if (!restaurantId) return;

    const fetchData = async () => {
      try {
        // Fetch restaurant details
        const res = await fetch(`/api/restaurants/${restaurantId}`);
        const restaurantData = await res.json();
        if (restaurantData.success) {
          setRestaurant(restaurantData.restaurant);
        }

        // Fetch dishes for that restaurant
        const dishRes = await fetch(`/api/dishes?restaurant=${restaurantId}`);
        const dishData = await dishRes.json();
        if (dishData.success) {
          setDishes(dishData.dishes);
        }
      } catch (error) {
        console.error("Error loading restaurant:", error);
      }
    };

    fetchData();
  }, [restaurantId]);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === "All" || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpdateCart = (dish: Dish, quantity: number) => {
  if (quantity === 0) {
    // Remove item from cart when quantity is 0
    updateQuantity(dish._id, 0);
  } else {
    // Add or update item in cart
    const existingItem = cart.find(item => item.id === dish._id);
    
    if (existingItem) {
      // Update existing item quantity
      updateQuantity(dish._id, quantity);
    } else {
      // Add new item to cart
      addToCart({
        id: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: quantity,
        image: dish.photo,
        restaurantId: restaurantId,
        preparationTime: dish.preparationTime,
        restaurantName: restaurant?.name || "",
        category: dish.category,
        description: dish.description,
      });
    }
  }
  
  // Show visual feedback when item is added
  if (quantity === 1 && !cart.find(item => item.id === dish._id)) {
    setAddedItems(prev => ({ ...prev, [dish._id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [dish._id]: false }));
    }, 1500);
  }
};

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Restaurants
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`${isFavorite ? "text-red-500" : "text-gray-600"} hover:bg-red-50`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96">
        <img src={restaurant.photo || "/default-restaurant.png"} alt={restaurant.name} className="w-full h-full object-cover" /> 
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold">{restaurant.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {restaurant.cuisineTypes.map((cuisine, index) => (
              <Badge key={index} className="bg-orange-600 text-white">
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 bg-white border border-orange-200 mb-8">
            <TabsTrigger value="menu" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Utensils className="h-4 w-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <MapPin className="h-4 w-4 mr-2" />
              Info
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Camera className="h-4 w-4 mr-2" />
              Gallery
            </TabsTrigger>
          </TabsList>

          {/* Menu */}
          <TabsContent value="menu">
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-orange-100 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? "bg-orange-600 text-white" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Modern Dish Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDishes.map((dish) => (
                <div
                  key={dish._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={dish.photo || "/default-dish.png"} 
                      alt={dish.name} 
                      className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {dish.category}
                      </span>
                    </div>

                    {/* Dietary Tags */}
                    {dish.dietaryTags.length > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                          {dish.dietaryTags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs font-medium text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Availability indicator */}
                    {!dish.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                        {dish.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{dish.preparationTime}m</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {/* Ingredients Preview */}
                    {dish.ingredients.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {dish.ingredients.slice(0, 3).join(', ')}
                          {dish.ingredients.length > 3 && '...'}
                        </p>
                      </div>
                    )}

                    {/* Price and Cart Controls */}
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Cart Controls */}
                      {dish.available ? (() => {
                          const cartItem = cart.find((item) => item.id === dish._id);
                          const currentQuantity = cartItem ? cartItem.quantity : 0;

                          return currentQuantity > 0 ? (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateCart(dish, Math.max(0, currentQuantity - 1));
                                }}
                                className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                disabled={currentQuantity <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                                {currentQuantity}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateCart(dish, currentQuantity + 1);
                                }}
                                className="w-8 h-8 rounded-full bg-orange-600 text-white shadow-sm hover:shadow-md flex items-center justify-center hover:bg-orange-700 transform hover:scale-105 transition-all duration-200"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpdateCart(dish, 1);
                              }}
                              className={`
                                relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                                text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 
                                transform hover:scale-105 hover:shadow-lg flex items-center gap-2
                                ${addedItems[dish._id] ? 'animate-pulse scale-105' : ''}
                              `}
                            >
                              <div className={`transition-all duration-300 ${addedItems[dish._id] ? 'scale-125' : ''}`}>
                                {addedItems[dish._id] ? (
                                  <ShoppingCart className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </div>
                              <span className="text-sm">
                                {addedItems[dish._id] ? 'Added!' : 'Add to Cart'}
                              </span>
                              {addedItems[dish._id] && (
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                              )}
                            </button>
                          );
                        })() : (
                          <button
                            disabled
                            className="bg-gray-300 text-gray-500 px-6 py-3 rounded-full font-semibold cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Bottom Accent */}
                  <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              ))}
            </div>

            {/* No dishes found */}
            {filteredDishes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Utensils className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">No dishes found</p>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Info */}
          <TabsContent value="info">
            <Card className="p-6 bg-white shadow">
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurant.description && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                    <p className="text-gray-600">{restaurant.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Contact & Location</h4>
                  <div className="space-y-2">
                    <p className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                      {restaurant.address}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-orange-600" />
                      {restaurant.phone}
                    </p>
                    {restaurant.website && (
                      <p className="flex items-center text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-orange-600" />
                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                          {restaurant.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cuisine Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.cuisineTypes.map((cuisine, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>

                {restaurant.operatingHours && (
                  <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-indigo-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Operating Hours
                    </h4>
                    <div className="divide-y divide-gray-100">
                      {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between py-2 text-sm">
                          <span className="capitalize text-gray-500">{day}</span>
                          <span
                            className={`font-medium ${
                              hours.closed ? "text-red-500" : "text-gray-900"
                            }`}
                          >
                            {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery">
            <Card className="p-6 bg-white shadow">
              <CardContent className="text-center py-12">
                <Camera className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Gallery coming soon...</p>
                <p className="text-gray-400 text-sm mt-2">Photos of this restaurant will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Floating Cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 backdrop-blur-sm bg-white/95 mb-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {totalItems} item{totalItems > 1 ? 's' : ''} in cart
                </p>
                <p className="text-sm text-gray-600">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200" onClick={() => router.push("/cart")}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({totalItems})
          </Button>
        </div>
      )}
    </div>
  );
}
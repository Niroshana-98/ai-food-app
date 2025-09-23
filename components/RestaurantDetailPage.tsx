"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const updateCart = (dishId: string, quantity: number) => {
    if (quantity === 0) {
      const newCart = { ...cart };
      delete newCart[dishId];
      setCart(newCart);
    } else {
      setCart({ ...cart, [dishId]: quantity });
    }
  };

  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <Card key={dish._id} className="bg-white shadow hover:shadow-lg transition">
                  <img src={dish.photo} alt={dish.name} className="w-full h-48 object-cover" />
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <CardTitle>{dish.name}</CardTitle>
                      <span className="text-sm text-gray-500">{dish.preparationTime}m</span>
                    </div>
                    <p className="text-gray-600 text-sm">{dish.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-orange-600">$ {dish.price}</span>
                      {cart[dish._id] ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateCart(dish._id, cart[dish._id] - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{cart[dish._id]}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateCart(dish._id, cart[dish._id] + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => updateCart(dish._id, 1)}>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Info */}
          <TabsContent value="info">
            <Card className="p-6 bg-white shadow">
              <CardHeader>
                <CardTitle>Restaurant Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{restaurant.description}</p>
                <p className="mt-2">
                  <MapPin className="inline h-4 w-4 mr-1" /> {restaurant.address}
                </p>
                <p>
                  <Phone className="inline h-4 w-4 mr-1" /> {restaurant.phone}
                </p>
                {restaurant.website && (
                  <p>
                    <Globe className="inline h-4 w-4 mr-1" /> {restaurant.website}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery">
            <p className="text-center text-gray-500">Gallery coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button className="bg-orange-600 text-white px-6 py-4 rounded-full shadow-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({totalItems})
          </Button>
        </div>
      )}
    </div>
  );
}

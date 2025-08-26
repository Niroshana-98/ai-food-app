'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Clock, Star, Heart, MapPin, Repeat } from 'lucide-react'

interface UserDashboardProps {
  onBack: () => void
}

export function UserDashboard({ onBack }: UserDashboardProps) {
  const orderHistory = [
    {
      id: 1,
      dish: "Chicken Tikka Masala",
      restaurant: "Spice Garden",
      date: "2024-01-15",
      status: "Delivered",
      price: "$21.58",
      rating: 5
    },
    {
      id: 2,
      dish: "Pad Thai",
      restaurant: "Thai Basil",
      date: "2024-01-12",
      status: "Delivered",
      price: "$18.99",
      rating: 4
    },
    {
      id: 3,
      dish: "Margherita Pizza",
      restaurant: "Tony's Pizzeria",
      date: "2024-01-10",
      status: "Delivered",
      price: "$16.50",
      rating: 5
    }
  ]

  const favorites = [
    {
      id: 1,
      dish: "Chicken Tikka Masala",
      cuisine: "Indian",
      tags: ["Spicy", "Comfort Food"]
    },
    {
      id: 2,
      dish: "Ramen Bowl",
      cuisine: "Japanese",
      tags: ["Comfort Food", "Quick Bite"]
    },
    {
      id: 3,
      dish: "Caesar Salad",
      cuisine: "American",
      tags: ["Healthy", "Light"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b p-6">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <Card className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back, John!</h2>
              <p className="text-orange-100 mb-4">Ready to discover your next favorite dish?</p>
              <Button className="bg-white text-orange-600 hover:bg-gray-100">
                Get New Recommendations
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orderHistory.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{order.dish}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{order.restaurant}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{order.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                            className="bg-green-100 text-green-800"
                          >
                            {order.status}
                          </Badge>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold mb-2">{order.price}</div>
                        <Button variant="outline" size="sm">
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{favorite.dish}</h3>
                          <p className="text-gray-600 mb-3">{favorite.cuisine} Cuisine</p>
                          <div className="flex flex-wrap gap-2">
                            {favorite.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Heart className="h-5 w-5 text-red-500 fill-current" />
                        </Button>
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Find Restaurants
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

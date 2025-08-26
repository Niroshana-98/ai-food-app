'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Clock, Phone, ArrowLeft, ShoppingCart, Calendar } from 'lucide-react'

interface RestaurantSuggestionScreenProps {
  onBack: () => void
}

export function RestaurantSuggestionScreen({ onBack }: RestaurantSuggestionScreenProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null)

  const restaurants = [
    {
      id: 1,
      name: "Spice Garden",
      rating: 4.8,
      distance: "0.5 miles",
      deliveryTime: "25-35 min",
      price: "$$",
      image: "/indian-restaurant-interior.png",
      address: "123 Main St, Downtown",
      phone: "(555) 123-4567",
      specialties: ["Authentic Indian", "Vegetarian Options", "Takeout"],
      dishPrice: "$16.99"
    },
    {
      id: 2,
      name: "Mumbai Palace",
      rating: 4.6,
      distance: "1.2 miles",
      deliveryTime: "30-40 min",
      price: "$$$",
      image: "/upscale-indian-restaurant.png",
      address: "456 Oak Ave, Midtown",
      phone: "(555) 987-6543",
      specialties: ["Fine Dining", "Traditional Recipes", "Dine-in"],
      dishPrice: "$22.99"
    },
    {
      id: 3,
      name: "Curry Express",
      rating: 4.4,
      distance: "0.8 miles",
      deliveryTime: "20-30 min",
      price: "$",
      image: "/placeholder-xn9j3.png",
      address: "789 Pine St, Eastside",
      phone: "(555) 456-7890",
      specialties: ["Quick Service", "Lunch Specials", "Delivery"],
      dishPrice: "$12.99"
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
          <h1 className="text-2xl font-bold">Restaurants serving Chicken Tikka Masala</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">Found {restaurants.length} restaurants near you serving this dish</p>
          </div>

          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={restaurant.image || "/placeholder.svg"} 
                      alt={restaurant.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{restaurant.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{restaurant.distance}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                          <span>{restaurant.price}</span>
                        </div>
                        <p className="text-gray-600 mb-3">{restaurant.address}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                          {restaurant.dishPrice}
                        </div>
                        <p className="text-sm text-gray-600">Chicken Tikka Masala</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{restaurant.phone}</span>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        onClick={() => setSelectedRestaurant(restaurant.id)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Order Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Reserve Table
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary Modal (simplified) */}
          {selectedRestaurant && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Chicken Tikka Masala</span>
                      <span>$16.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>$1.60</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>$21.58</span>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedRestaurant(null)}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                        Proceed to Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

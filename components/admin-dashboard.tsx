'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Edit, Trash2, Users, ShoppingBag, TrendingUp, MapPin } from 'lucide-react'

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [showAddRestaurant, setShowAddRestaurant] = useState(false)
  const [showAddDish, setShowAddDish] = useState(false)

  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "bg-blue-500" },
    { title: "Total Orders", value: "5,678", icon: ShoppingBag, color: "bg-green-500" },
    { title: "Revenue", value: "$45,678", icon: TrendingUp, color: "bg-purple-500" },
    { title: "Restaurants", value: "89", icon: MapPin, color: "bg-orange-500" }
  ]

  const restaurants = [
    {
      id: 1,
      name: "Spice Garden",
      cuisine: "Indian",
      status: "Active",
      orders: 234,
      rating: 4.8
    },
    {
      id: 2,
      name: "Mumbai Palace",
      cuisine: "Indian",
      status: "Active",
      orders: 189,
      rating: 4.6
    },
    {
      id: 3,
      name: "Thai Basil",
      cuisine: "Thai",
      status: "Pending",
      orders: 0,
      rating: 0
    }
  ]

  const dishes = [
    {
      id: 1,
      name: "Chicken Tikka Masala",
      cuisine: "Indian",
      price: "$16.99",
      restaurant: "Spice Garden",
      status: "Available"
    },
    {
      id: 2,
      name: "Pad Thai",
      cuisine: "Thai",
      price: "$14.99",
      restaurant: "Thai Basil",
      status: "Available"
    },
    {
      id: 3,
      name: "Butter Chicken",
      cuisine: "Indian",
      price: "$18.99",
      restaurant: "Mumbai Palace",
      status: "Unavailable"
    }
  ]

  const recentOrders = [
    {
      id: 1,
      customer: "John Doe",
      dish: "Chicken Tikka Masala",
      restaurant: "Spice Garden",
      status: "Delivered",
      amount: "$21.58",
      time: "2 hours ago"
    },
    {
      id: 2,
      customer: "Jane Smith",
      dish: "Pad Thai",
      restaurant: "Thai Basil",
      status: "Preparing",
      amount: "$18.99",
      time: "30 minutes ago"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowAddRestaurant(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
            <Button variant="outline" onClick={() => setShowAddDish(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Dish
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="restaurants" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="dishes">Dishes</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {restaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{restaurant.name}</h3>
                          <p className="text-sm text-gray-600">{restaurant.cuisine} Cuisine</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant={restaurant.status === 'Active' ? 'default' : 'secondary'}>
                              {restaurant.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{restaurant.orders} orders</span>
                            <span className="text-sm text-gray-600">★ {restaurant.rating}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dishes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dish Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dishes.map((dish) => (
                      <div key={dish.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{dish.name}</h3>
                          <p className="text-sm text-gray-600">{dish.restaurant} • {dish.cuisine}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="font-medium text-orange-600">{dish.price}</span>
                            <Badge variant={dish.status === 'Available' ? 'default' : 'secondary'}>
                              {dish.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{order.customer}</h3>
                          <p className="text-sm text-gray-600">{order.dish} from {order.restaurant}</p>
                          <p className="text-sm text-gray-500">{order.time}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg">{order.amount}</div>
                          <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Restaurant Modal */}
      {showAddRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Restaurant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input id="restaurant-name" placeholder="Enter restaurant name" />
              </div>
              <div>
                <Label htmlFor="cuisine-type">Cuisine Type</Label>
                <Input id="cuisine-type" placeholder="e.g., Italian, Chinese" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Full address" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddRestaurant(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Add Restaurant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Dish Modal */}
      {showAddDish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Dish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dish-name">Dish Name</Label>
                <Input id="dish-name" placeholder="Enter dish name" />
              </div>
              <div>
                <Label htmlFor="dish-price">Price</Label>
                <Input id="dish-price" placeholder="$0.00" />
              </div>
              <div>
                <Label htmlFor="dish-description">Description</Label>
                <Textarea id="dish-description" placeholder="Describe the dish" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddDish(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Add Dish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

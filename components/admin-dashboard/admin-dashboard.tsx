'use client'

import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Edit, Trash2, Users, ShoppingBag, TrendingUp, MapPin } from 'lucide-react'
import { api } from "@/lib/api"
import AddRestaurantForm from "./add-restaurant-form"
import { useToast } from "@/components/ui/toast"
import AddDishForm from "./add-dish-form"

import { AddRestaurantModal } from "./modals/add-restaurant"
import { EditRestaurantModal } from "./modals/edit-restaurant"
import { AddDishModal } from "./modals/add-dish"
import { DeleteRestaurantModal } from "./modals/delete-restaurant"
import { EditDishModal } from "./modals/edit-dish"

interface AdminDashboardProps {
  onBack: () => void
  user?: any
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [showAddRestaurant, setShowAddRestaurant] = useState(false)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [showAddDish, setShowAddDish] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const { showToast, ToastContainer } = useToast()
  const [deleteRestaurant, setDeleteRestaurant] = useState<any>(null)
  const [editingDish, setEditingDish] = useState<any>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    restaurant: any
    loading: boolean
  }>({
    isOpen: false,
    restaurant: null,
    loading: false,
  })

   const [dishDeleteConfirmation, setDishDeleteConfirmation] = useState<{
    isOpen: boolean
    dish: any
    loading: boolean
  }>({
    isOpen: false,
    dish: null,
    loading: false,
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [restaurantsRes, usersRes, dishesRes] = await Promise.all([
        //api.getStats(),
        api.getRestaurants({ limit: 10 }),
        api.getUsers(),
        api.getDishes({ limit: 10 }),

        //api.getOrders({ limit: 5 }),
      ])

      //setStats(statsRes.stats || {})
      setRestaurants(restaurantsRes.restaurants || [])
      setDishes(dishesRes.dishes || [])
      setUsers(usersRes.users || [])
      console.log(users)
      console.log(restaurantsRes)
      console.log(dishesRes)
      //setRecentOrders(ordersRes.orders || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRestaurantSuccess = () => {
    fetchAdminData() // Refresh data
    showToast("Restaurant added successfully!", "success")
  }

  const handleEditSuccess = () => {
    fetchAdminData() // Refresh data
    showToast("Restaurant updated successfully!", "success")
  }

  const handleEditRestaurant = (restaurant: any) => {
    setEditingRestaurant(restaurant)
  }

  const handleAddDishSuccess = () => {
    // Refresh dishes data if needed
    showToast("Dish added successfully!", "success")
  }

  const handleDeleteSuccess = () => {
    fetchAdminData() // Refresh data
    showToast("Restaurant deleted successfully!", "success")
  }

  // Dish delete handler functions
  const handleDeleteDish = async () => {
    if (!dishDeleteConfirmation.dish) return

    setDishDeleteConfirmation((prev) => ({ ...prev, loading: true }))

    try {
      await api.deleteDish(dishDeleteConfirmation.dish._id)
      showToast("Dish deleted successfully!", "success")
      setDishDeleteConfirmation({ isOpen: false, dish: null, loading: false })
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("Error deleting dish:", error)
      showToast("Failed to delete dish. Please try again.", "error")
      setDishDeleteConfirmation((prev) => ({ ...prev, loading: false }))
    }
  }

   const openDishDeleteConfirmation = (dish: any) => {
    setDishDeleteConfirmation({
      isOpen: true,
      dish,
      loading: false,
    })
  }

  const closeDishDeleteConfirmation = () => {
    if (!dishDeleteConfirmation.loading) {
      setDishDeleteConfirmation({
        isOpen: false,
        dish: null,
        loading: false,
      })
    }
  }

  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "bg-blue-500" },
    { title: "Total Orders", value: "5,678", icon: ShoppingBag, color: "bg-green-500" },
    { title: "Revenue", value: "$45,678", icon: TrendingUp, color: "bg-purple-500" },
    { title: "Restaurants", value: "89", icon: MapPin, color: "bg-orange-500" }
  ]

  // const dishes = [
  //   {
  //     id: 1,
  //     name: "Chicken Tikka Masala",
  //     cuisine: "Indian",
  //     price: "$16.99",
  //     restaurant: "Spice Garden",
  //     status: "Available"
  //   },
  //   {
  //     id: 2,
  //     name: "Pad Thai",
  //     cuisine: "Thai",
  //     price: "$14.99",
  //     restaurant: "Thai Basil",
  //     status: "Available"
  //   },
  //   {
  //     id: 3,
  //     name: "Butter Chicken",
  //     cuisine: "Indian",
  //     price: "$18.99",
  //     restaurant: "Mumbai Palace",
  //     status: "Unavailable"
  //   }
  // ]

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
                    {restaurants.map((restaurant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{restaurant.name}</h3>
                          <p className="text-sm text-gray-600">{Array.isArray(restaurant.cuisineTypes) ? restaurant.cuisineTypes.join(', ') : restaurant.cuisineTypes} Cuisine</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant={restaurant.status === 'Active' ? 'default' : 'secondary'}>
                              {restaurant.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{restaurant.totalOrders} orders</span>
                            <span className="text-sm text-gray-600">★ {restaurant.rating}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditRestaurant(restaurant)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteRestaurant(restaurant)}>
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
                      <div key={dish._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{dish.name}</h3>
                          <p className="text-sm text-gray-600">{dish.restaurantId.name} • {dish.cuisineType}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="font-medium text-orange-600">{dish.price}</span>
                            <Badge variant={dish.available === 'Available' ? 'default' : 'secondary'}>
                              {dish.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingDish(dish)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm"  onClick={() => openDishDeleteConfirmation(dish)}>
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


      {/* Modal Components */}
      <AddRestaurantModal
        isOpen={showAddRestaurant}
        onClose={() => setShowAddRestaurant(false)}
        onSuccess={handleAddRestaurantSuccess}
      />

      <EditRestaurantModal
        restaurant={editingRestaurant}
        isOpen={!!editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Add Dish Modal */}
      {showAddDish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Add New Dish</h2>
              <p className="text-sm text-gray-600 mt-1">Create a new dish for one of your restaurants</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AddDishForm
                onSuccess={() => {
                  setShowAddDish(false)
                  fetchAdminData() // Refresh data
                }}
                onCancel={() => setShowAddDish(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {editingDish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Edit Dish - {editingDish.name}</h2>
              <p className="text-sm text-gray-600 mt-1">Update dish information and availability</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <EditDishModal
                dish={editingDish}
                onSuccess={() => {
                  setEditingDish(null)
                  fetchAdminData() // Refresh data
                }}
                onCancel={() => setEditingDish(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteRestaurantModal
        restaurant={deleteRestaurant}
        isOpen={!!deleteRestaurant}
        onClose={() => setDeleteRestaurant(null)}
        onSuccess={handleDeleteSuccess}
      />

      {/* Dish Delete Confirmation Modal */}
      {dishDeleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-red-600 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Dish
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">{dishDeleteConfirmation.dish?.name}</span>?
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-medium text-red-800 mb-1">Warning</h4>
                      <p className="text-red-700">
                        This action cannot be undone. The dish will be permanently removed from the menu and any
                        associated order history will be affected.
                      </p>
                    </div>
                  </div>
                </div>

                {dishDeleteConfirmation.dish && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dish:</span>
                      <span className="font-medium">{dishDeleteConfirmation.dish.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">{dishDeleteConfirmation.dish.restaurantId?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${dishDeleteConfirmation.dish.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline" className="text-xs">
                        {dishDeleteConfirmation.dish.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={dishDeleteConfirmation.dish.available ? "default" : "secondary"}>
                        {dishDeleteConfirmation.dish.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50"
                  onClick={closeDishDeleteConfirmation}
                  disabled={dishDeleteConfirmation.loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteDish}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={dishDeleteConfirmation.loading}
                >
                  {dishDeleteConfirmation.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Dish
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <ToastContainer />
    </div>
  )
}

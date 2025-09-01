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

interface AdminDashboardProps {
  onBack: () => void
  user?: any
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [showAddRestaurant, setShowAddRestaurant] = useState(false)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [showAddDish, setShowAddDish] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editLoading, setEditLoading] = useState(false)
  const { showToast, ToastContainer } = useToast()
  const [customEditCuisine, setCustomEditCuisine] = useState("")
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    cuisineTypes: [] as string[],
    status: "active",
    operatingHours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "23:00", closed: false },
      saturday: { open: "09:00", close: "23:00", closed: false },
      sunday: { open: "10:00", close: "21:00", closed: false },
    },
  })

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    restaurant: any
    loading: boolean
  }>({
    isOpen: false,
    restaurant: null,
    loading: false,
  })

    // Cuisine options constant
  const cuisineOptions = [
    "Indian",
    "Chinese",
    "Italian",
    "Mexican",
    "Thai",
    "Japanese",
    "Mediterranean",
    "American",
    "French",
    "Korean",
    "Vietnamese",
    "Greek",
  ]

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [restaurantsRes, usersRes,] = await Promise.all([
        //api.getStats(),
        api.getRestaurants({ limit: 10 }),
        //api.getDishes({ limit: 10 }),
        api.getUsers(),
        //api.getOrders({ limit: 5 }),
      ])

      //setStats(statsRes.stats || {})
      setRestaurants(restaurantsRes.restaurants || [])
      //setDishes(dishesRes.dishes || [])
      setUsers(usersRes.users || [])
      console.log(users)
      console.log(restaurantsRes)
      //setRecentOrders(ordersRes.orders || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {}

    if (!editFormData.name.trim()) newErrors.name = "Restaurant name is required"
    if (!editFormData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!editFormData.email.trim()) newErrors.email = "Email is required"
    if (!editFormData.address.trim()) newErrors.address = "Address is required"
    if (editFormData.cuisineTypes.length === 0) newErrors.cuisineTypes = "At least one cuisine type is required"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (editFormData.email && !emailRegex.test(editFormData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditRestaurant = (restaurant: any) => {
    setEditFormData({
      name: restaurant.name || "",
      description: restaurant.description || "",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      website: restaurant.website || "",
      address: restaurant.address || "",
      cuisineTypes: restaurant.cuisineTypes || [],
      status: restaurant.status || "active",
      operatingHours: restaurant.operatingHours || {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "23:00", closed: false },
        saturday: { open: "09:00", close: "23:00", closed: false },
        sunday: { open: "10:00", close: "21:00", closed: false },
      },
    })
    setEditingRestaurant(restaurant)
    setEditErrors({})
  }

   const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

   const toggleEditCuisine = (cuisine: string) => {
    setEditFormData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }))
    if (editErrors.cuisineTypes) {
      setEditErrors((prev) => ({ ...prev, cuisineTypes: "" }))
    }
  }

  const addCustomEditCuisine = () => {
    if (customEditCuisine.trim() && !editFormData.cuisineTypes.includes(customEditCuisine.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        cuisineTypes: [...prev.cuisineTypes, customEditCuisine.trim()],
      }))
      setCustomEditCuisine("")
    }
  }

    const updateEditOperatingHours = (day: string, field: string, value: string | boolean) => {
    setEditFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value,
        },
      },
    }))
  }

  const handleSaveRestaurant = async () => {
    if (!validateEditForm()) return

    setEditLoading(true)
    try {
      await api.updateRestaurant(editingRestaurant._id, editFormData)
      showToast("Restaurant updated successfully!", "success")
      setEditingRestaurant(null)
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("Error updating restaurant:", error)
      showToast("Failed to update restaurant. Please try again.", "error")
    } finally {
      setEditLoading(false)
    }
  }

   const handleDeleteRestaurant = async () => {
    if (!deleteConfirmation.restaurant) return

    setDeleteConfirmation((prev) => ({ ...prev, loading: true }))

    try {
      await api.deleteRestaurant(deleteConfirmation.restaurant._id)
      showToast("Restaurant deleted successfully!", "success")
      setDeleteConfirmation({ isOpen: false, restaurant: null, loading: false })
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("Error deleting restaurant:", error)
      showToast("Failed to delete restaurant. Please try again.", "error")
      setDeleteConfirmation((prev) => ({ ...prev, loading: false }))
    }
  }

    const openDeleteConfirmation = (restaurant: any) => {
    setDeleteConfirmation({
      isOpen: true,
      restaurant,
      loading: false,
    })
  }

    const closeDeleteConfirmation = () => {
    if (!deleteConfirmation.loading) {
      setDeleteConfirmation({
        isOpen: false,
        restaurant: null,
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

  // const restaurants2 = [
  //   {
  //     id: 1,
  //     name: "Spice Garden",
  //     cuisine: "Indian",
  //     status: "Active",
  //     orders: 234,
  //     rating: 4.8
  //   },
  //   {
  //     id: 2,
  //     name: "Mumbai Palace",
  //     cuisine: "Indian",
  //     status: "Active",
  //     orders: 189,
  //     rating: 4.6
  //   },
  //   {
  //     id: 3,
  //     name: "Thai Basil",
  //     cuisine: "Thai",
  //     status: "Pending",
  //     orders: 0,
  //     rating: 0
  //   }
  // ]

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
                      <div key={restaurant._id} className="flex items-center justify-between p-4 border rounded-lg">
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
                          <Button variant="outline" size="sm" onClick={() => openDeleteConfirmation(restaurant)}>
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
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Add New Restaurant</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new restaurant to the platform</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AddRestaurantForm
                onSuccess={() => {
                  setShowAddRestaurant(false)
                  fetchAdminData() // Refresh data
                }}
                onCancel={() => setShowAddRestaurant(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {editingRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Edit Restaurant - {editingRestaurant.name}</h2>
              <p className="text-sm text-gray-600 mt-1">Update restaurant information and manage status</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Status Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Status</h3>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Status</Label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => handleEditInputChange("status", e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending Approval</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      {editFormData.status === "active" && "Restaurant is live and accepting orders"}
                      {editFormData.status === "inactive" && "Restaurant is temporarily closed"}
                      {editFormData.status === "pending" && "Restaurant is awaiting admin approval"}
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium">
                        Restaurant Name *
                      </Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name}
                        onChange={(e) => handleEditInputChange("name", e.target.value)}
                        className={editErrors.name ? "border-red-500 focus:border-red-500" : ""}
                      />
                      {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone" className="text-sm font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="edit-phone"
                        value={editFormData.phone}
                        onChange={(e) => handleEditInputChange("phone", e.target.value)}
                        className={editErrors.phone ? "border-red-500 focus:border-red-500" : ""}
                      />
                      {editErrors.phone && <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => handleEditInputChange("email", e.target.value)}
                        className={editErrors.email ? "border-red-500 focus:border-red-500" : ""}
                      />
                      {editErrors.email && <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-website" className="text-sm font-medium">
                        Website
                      </Label>
                      <Input
                        id="edit-website"
                        value={editFormData.website}
                        onChange={(e) => handleEditInputChange("website", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) => handleEditInputChange("description", e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-address" className="text-sm font-medium">
                      Full Address *
                    </Label>
                    <Textarea
                      id="edit-address"
                      value={editFormData.address}
                      onChange={(e) => handleEditInputChange("address", e.target.value)}
                      className={`min-h-[60px] resize-none ${editErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {editErrors.address && <p className="text-red-500 text-xs mt-1">{editErrors.address}</p>}
                  </div>
                </div>

                {/* Cuisine Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Cuisine Types</h3>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {cuisineOptions.map((cuisine) => (
                        <Badge
                          key={cuisine}
                          variant={editFormData.cuisineTypes.includes(cuisine) ? "default" : "secondary"}
                          className={`cursor-pointer transition-all duration-200 px-3 py-1 ${editFormData.cuisineTypes.includes(cuisine)
                              ? "bg-orange-600 hover:bg-orange-700 text-white"
                              : "bg-gray-100 hover:bg-orange-100 text-gray-700"
                            }`}
                          onClick={() => toggleEditCuisine(cuisine)}
                        >
                          {cuisine}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom cuisine type"
                        value={customEditCuisine}
                        onChange={(e) => setCustomEditCuisine(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomEditCuisine())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addCustomEditCuisine} variant="outline" size="sm">
                        Add
                      </Button>
                    </div>

                    {editErrors.cuisineTypes && <p className="text-red-500 text-xs">{editErrors.cuisineTypes}</p>}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operating Hours</h3>

                  <div className="space-y-3">
                    {Object.entries(editFormData.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="w-20">
                            <Label className="capitalize text-sm font-medium">{day}</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={(e) => updateEditOperatingHours(day, "closed", e.target.checked)}
                              className="rounded"
                            />
                            <Label className="text-sm text-gray-600">Closed</Label>
                          </div>

                          {!hours.closed && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => updateEditOperatingHours(day, "open", e.target.value)}
                                className="w-24 text-sm"
                              />
                              <span className="text-sm text-gray-500">to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => updateEditOperatingHours(day, "close", e.target.value)}
                                className="w-24 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-white hover:bg-gray-50"
                    onClick={() => setEditingRestaurant(null)}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveRestaurant}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
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

       {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-red-600 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">{deleteConfirmation.restaurant?.name}</span>?
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
                        This action cannot be undone. All associated dishes, orders, and data will be permanently
                        removed.
                      </p>
                    </div>
                  </div>
                </div>

                {deleteConfirmation.restaurant && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">{deleteConfirmation.restaurant.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={deleteConfirmation.restaurant.status === "active" ? "default" : "secondary"}>
                        {deleteConfirmation.restaurant.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">{deleteConfirmation.restaurant.totalOrders || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50"
                  onClick={closeDeleteConfirmation}
                  disabled={deleteConfirmation.loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRestaurant}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteConfirmation.loading}
                >
                  {deleteConfirmation.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Restaurant
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

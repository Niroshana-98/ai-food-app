"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "./dashboard/admin/Header"
import StatsCards from "./dashboard/admin/StatsCards"
import RestaurantsTab from "./dashboard/admin/RestaurantsTab"
import AddRestaurantModal from "./dashboard/admin/AddRestaurantModal"
import AddDishModal from "./dashboard/admin/AddDishModal"
import DishesTab from "./dashboard/admin/DishesTab"
import OrderTab from "./dashboard/admin/OrderTab"
import { api } from "@/lib/api"
import { DeleteDishModal } from "./dashboard/admin/deleteDish"
import { DeleteRestaurantModal } from "./dashboard/admin/deleteRestaurant"
import { EditRestaurantModal } from "./dashboard/admin/EditRestaurantModal"
import { EditDishModal } from "./dashboard/admin/EditDishModal"
import { Dish } from "@/lib/types"
import { Button } from "./ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const [editingDish, setEditingDish] = useState<Dish | any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)


  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const [deleteRestaurantModalOpen, setDeleteRestaurantModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<any | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/auth/signup", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          console.error("Failed to load users:", data.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Open delete modal and set restaurant to delete
  const openDeleteConfirmations = (restaurant: any) => {
    setRestaurantToDelete(restaurant);
    setDeleteRestaurantModalOpen(true);
  };
  // Close delete modal and clear selection
  const closeDeleteModals = () => {
    setRestaurantToDelete(null);
    setDeleteRestaurantModalOpen(false);
  };

  // On successful delete, remove restaurant from state and close modal
  const handleDeleteSuccesss = () => {
    if (restaurantToDelete) {
      setRestaurants((prev) => prev.filter((r) => r._id !== restaurantToDelete._id));
    }
    closeDeleteModal();
  };

  // Fetch dishes on mount
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await api.getDishes();
        setDishes(data);
      } catch (error) {
        console.error("Failed to fetch dishes:", error);
      } finally {
        setLoadingDishes(false);
      }
    };
    fetchDishes();
  }, []);
  // Handler to remove dish from state after deletion
  const handleDishDeleted = (deletedDishId: string) => {
    setDishes((prev) => prev.filter((dish) => dish._id !== deletedDishId));
  };

  const [deleteDishModalOpen, setDeleteDishModalOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const openDeleteConfirmation = (dish: Dish) => {
    setDishToDelete(dish);
    setDeleteDishModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDishToDelete(null);
    setDeleteDishModalOpen(false);
  };
  const handleDeleteSuccess = () => {
    if (dishToDelete) {
      handleDishDeleted(dishToDelete._id);
    }
    closeDeleteModal();
  };

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurents = async () => {
      try {
        const data = await api.getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch dishes:", error);
      } finally {
        setLoadingDishes(false);
      }
    };
    fetchRestaurents();
  }, []);

  const handleRestaurantDeleted = (deletedRestaurantId: string) => {
    setRestaurants((prev) => prev.filter((restaurant) => restaurant._id !== deletedRestaurantId));
  };

  const handleEditRestaurant = (restaurant: any) => {
    setEditingRestaurant(restaurant)
  }

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish)
  }

  const handleEditSuccess = () => {
    // Refresh data
  }


  const handleSaveRestaurant = async (data: { name: string; cuisineTypes: string[] }) => {
    try {
      const res = await fetch("/api/resturant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.success) {
        setRestaurants((prev) => [result.restaurant, ...prev])
      } else {
        console.error("Failed to save restaurant:", result.error)
      }
    } catch (error) {
      console.error("Error saving restaurant:", error)
    }
  }

   // New state for managing user editing
  const [editingUserForm, setEditingUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    status: "active",
    dateOfBirth: "",
    address: "",
    city: "",
    district: "",
    country: "",
    zipCode: "",
    dietaryPreferences: [] as string[],
    moodPreferences: [] as string[],
  })
  const [editUserErrors, setEditUserErrors] = useState<Record<string, string>>({})
  const [editUserLoading, setEditUserLoading] = useState(false)

   const handleEditUser = (user: any) => {
    setEditingUserForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "customer",
      status: user.status || "active",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
      address: user.address || "",
      city: user.city || "",
      district: user.district || "",
      country: user.country || "",
      zipCode: user.zipCode || "",
      dietaryPreferences: user.dietaryPreferences || [],
      moodPreferences: user.moodPreferences || [],
    })
    setEditingUser(user)
    setEditUserErrors({})
  }

  const validateUserEditForm = () => {
    const newErrors: Record<string, string> = {}

    if (!editingUserForm.name.trim()) newErrors.name = "Name is required"
    if (!editingUserForm.email.trim()) newErrors.email = "Email is required"
    if (!editingUserForm.phone.trim()) newErrors.phone = "Phone number is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (editingUserForm.email && !emailRegex.test(editingUserForm.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (editingUserForm.phone && !phoneRegex.test(editingUserForm.phone.replace(/[\s\-$$$$]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setEditUserErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUserInputChange = (field: string, value: string | string[]) => {
    setEditingUserForm((prev) => ({ ...prev, [field]: value }))
    if (editUserErrors[field]) {
      setEditUserErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const toggleUserDietaryPreference = (pref: string) => {
    setEditingUserForm((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter((p) => p !== pref)
        : [...prev.dietaryPreferences, pref],
    }))
  }
  const toggleUserMoodPreference = (pref: string) => {
    setEditingUserForm((prev) => ({
      ...prev,
      moodPreferences: prev.moodPreferences.includes(pref)
        ? prev.moodPreferences.filter((p) => p !== pref)
        : [...prev.moodPreferences, pref],
    }))
  }

  const handleSaveUser = async () => {
    if (!validateUserEditForm()) return

    setEditUserLoading(true)
    // try {
    //   await api.updateUser(editingUser._id, {
    //     ...editingUserForm,
    //     dateOfBirth: editingUserForm.dateOfBirth ? new Date(editingUserForm.dateOfBirth) : null,
    //   })
    //   showToast("User updated successfully!", "success")
    //   setEditingUser(null)
    //   fetchAdminData() // Refresh data
    // } catch (error) {
    //   console.error("Error updating user:", error)
    //   showToast("Failed to update user. Please try again.", "error")
    // } finally {
    //   setEditUserLoading(false)
    // }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <Header
        onBack={onBack}
        onAddRestaurant={() => setShowAddRestaurant(true)}
        onAddDish={() => setShowAddDish(true)}
      />

      <AddRestaurantModal
        open={showAddRestaurant}
        onClose={() => setShowAddRestaurant(false)}
      />

      <EditRestaurantModal
        restaurant={editingRestaurant}
        isOpen={!!editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        onSuccess={handleEditSuccess}
      />

      <AddDishModal
        open={showAddDish}
        onClose={() => setShowAddDish(false)}
      />

      <EditDishModal
        dish={editingDish}
        isOpen={!!editingDish}
        onClose={() => setEditingDish(null)}
        onSuccess={handleEditSuccess}
      />

      {dishToDelete && (
        <DeleteDishModal
          dish={dishToDelete}
          isOpen={deleteDishModalOpen}
          onClose={closeDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      )}

      <DeleteRestaurantModal
        restaurant={restaurantToDelete}
        isOpen={deleteRestaurantModalOpen}
        onClose={closeDeleteModals}
        onSuccess={handleDeleteSuccesss}
      />



      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <StatsCards restaurants={restaurants} users={users} />

          {/* Tabs */}
          <Tabs defaultValue="restaurants" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="dishes">Dishes</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <RestaurantsTab
                    restaurants={restaurants}
                    loading={loadingRestaurants}
                    handleEditRestaurant={handleEditRestaurant}
                    openDeleteConfirmation={openDeleteConfirmations}
                    onRestaurantDeleted={handleRestaurantDeleted}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dishes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dish Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <DishesTab
                    dishes={dishes}
                    loading={loadingDishes}
                    handleEditDish={handleEditDish}
                    openDeleteConfirmation={openDeleteConfirmation}
                    onDishDeleted={handleDishDeleted}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant={user.role === "customer" ? "default" : "secondary"}>
                              {user.role.replace("_", " ")}
                            </Badge>
                            <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                            <span className="text-sm text-gray-600">{user.orders} orders</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
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
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTab />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">Edit User - {editingUser.name}</h2>
              <p className="text-sm text-gray-600 mt-1">Update user information, status, and preferences</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* User Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Account Status</Label>
                      <select
                        value={editingUserForm.status}
                        onChange={(e) => handleUserInputChange("status", e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        {editingUserForm.status === "active" && "User can access all features"}
                        {editingUserForm.status === "inactive" && "User account is temporarily disabled"}
                        {editingUserForm.status === "suspended" && "User account is suspended due to violations"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">User Role</Label>
                      <select
                        value={editingUserForm.role}
                        onChange={(e) => handleUserInputChange("role", e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="customer">Customer</option>
                        <option value="restaurant_owner">Restaurant Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-user-name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="edit-user-name"
                        value={editingUserForm.name}
                        onChange={(e) => handleUserInputChange("name", e.target.value)}
                        className={editUserErrors.name ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="Enter full name"
                      />
                      {editUserErrors.name && <p className="text-red-500 text-xs mt-1">{editUserErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-user-email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="edit-user-email"
                        type="email"
                        value={editingUserForm.email}
                        onChange={(e) => handleUserInputChange("email", e.target.value)}
                        className={editUserErrors.email ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="user@example.com"
                      />
                      {editUserErrors.email && <p className="text-red-500 text-xs mt-1">{editUserErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-user-phone" className="text-sm font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="edit-user-phone"
                        value={editingUserForm.phone}
                        onChange={(e) => handleUserInputChange("phone", e.target.value)}
                        className={editUserErrors.phone ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="+1 (555) 123-4567"
                      />
                      {editUserErrors.phone && <p className="text-red-500 text-xs mt-1">{editUserErrors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-user-birthday" className="text-sm font-medium">
                        Date of Birth
                      </Label>
                      <Input
                        id="edit-user-birthday"
                        type="date"
                        value={editingUserForm.dateOfBirth}
                        onChange={(e) => handleUserInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="edit-user-address" className="text-sm font-medium">
                      Street Address
                    </Label>
                    <Textarea
                      id="edit-user-address"
                      value={editingUserForm.address}
                      onChange={(e) => handleUserInputChange("address", e.target.value)}
                      placeholder="Street address, apartment, suite, etc."
                      className="min-h-[60px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-user-city" className="text-sm font-medium">
                        City
                      </Label>
                      <Input
                        id="edit-user-city"
                        value={editingUserForm.city}
                        onChange={(e) => handleUserInputChange("city", e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-user-district" className="text-sm font-medium">
                        District/State
                      </Label>
                      <Input
                        id="edit-user-district"
                        value={editingUserForm.district}
                        onChange={(e) => handleUserInputChange("district", e.target.value)}
                        placeholder="Enter district or state"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-user-country" className="text-sm font-medium">
                        Country
                      </Label>
                      <select
                        id="edit-user-country"
                        value={editingUserForm.country}
                        onChange={(e) => handleUserInputChange("country", e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select country...</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="JP">Japan</option>
                        <option value="KR">South Korea</option>
                        <option value="CN">China</option>
                        <option value="IN">India</option>
                        <option value="BR">Brazil</option>
                        <option value="MX">Mexico</option>
                        <option value="SG">Singapore</option>
                        <option value="TH">Thailand</option>
                        <option value="VN">Vietnam</option>
                        <option value="PH">Philippines</option>
                        <option value="MY">Malaysia</option>
                        <option value="ID">Indonesia</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-user-zipcode" className="text-sm font-medium">
                        ZIP/Postal Code
                      </Label>
                      <Input
                        id="edit-user-zipcode"
                        value={editingUserForm.zipCode}
                        onChange={(e) => handleUserInputChange("zipCode", e.target.value)}
                        placeholder="Enter ZIP or postal code"
                      />
                    </div>
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dietary Preferences</h3>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Vegan",
                      "Vegetarian",
                      "Gluten-Free",
                      "Dairy-Free",
                      "Nut-Free",
                      "Halal",
                      "Kosher",
                      "Keto",
                      "Paleo",
                      "Low-Carb",
                      "Spicy",
                      "Mild",
                    ].map((pref) => (
                      <Badge
                        key={pref}
                        variant={editingUserForm.dietaryPreferences.includes(pref) ? "default" : "secondary"}
                        className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                          editingUserForm.dietaryPreferences.includes(pref)
                            ? "bg-orange-600 hover:bg-orange-700 text-white"
                            : "bg-gray-100 hover:bg-orange-100 text-gray-700"
                        }`}
                        onClick={() => toggleUserDietaryPreference(pref)}
                      >
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mood Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Mood Preferences</h3>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Adventurous",
                      "Comfort Food",
                      "Healthy",
                      "Indulgent",
                      "Quick Bite",
                      "Fine Dining",
                      "Casual",
                      "Nostalgic",
                      "Exotic",
                      "Traditional",
                    ].map((pref) => (
                      <Badge
                        key={pref}
                        variant={editingUserForm.moodPreferences.includes(pref) ? "default" : "secondary"}
                        className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                          editingUserForm.moodPreferences.includes(pref)
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-100 hover:bg-blue-100 text-gray-700"
                        }`}
                        onClick={() => toggleUserMoodPreference(pref)}
                      >
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-white hover:bg-gray-50"
                    onClick={() => setEditingUser(null)}
                    disabled={editUserLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveUser}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={editUserLoading}
                  >
                    {editUserLoading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

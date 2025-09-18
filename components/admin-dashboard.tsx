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
import { EditUserModal } from "./dashboard/admin/EditUserModal"

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

  const handleUserEditSuccess = () => {
    // Refresh users data
    setEditingUser(null)
    // You might want to re-fetch users here to get updated data
    // fetchUsers();
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

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={handleUserEditSuccess}
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
    </div>
  )
}

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
import UsersTab from "./dashboard/admin/UserTab"
import { api } from "@/lib/api"
import { DeleteDishModal } from "./dashboard/admin/deleteDish"
import { DeleteRestaurantModal } from "./dashboard/admin/deleteRestaurant"
import {EditRestaurantModal} from "./dashboard/admin/EditRestaurantModal"
import { EditDishModal } from "./dashboard/admin/EditDishModal"
import { Dish } from "@/lib/types"
import { ViewUserModal } from "./dashboard/admin/EditUserModal"
import type { User } from "@/lib/types"
import { DeleteAccountModal } from "./dashboard/admin/DeleteAccountModal"

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
  const [editingDish, setEditingDish] = useState<Dish |any>(null)
  

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const [deleteRestaurantModalOpen, setDeleteRestaurantModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<any | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const openDeleteUserModal = (user: User) => {
    setUserToDelete(user);
    setDeleteUserModalOpen(true);
  };

  const closeDeleteUserModal = () => {
    setUserToDelete(null);
    setDeleteUserModalOpen(false);
  };

  const handleUserDeleted = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u._id !== userId && u.clerkId !== userId));
    closeDeleteUserModal();
  };

  const handleUserEditSuccess = async () => {
    // Refresh users from API after update
    try {
      const res = await fetch("/api/auth/signup", { cache: "no-store" })
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to refresh users:", error)
    }
  }

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

      <ViewUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={handleUserEditSuccess}
      />

      <DeleteAccountModal
        userId={userToDelete?.clerkId || ""}
        isOpen={deleteUserModalOpen}
        onClose={closeDeleteUserModal}
        onSuccess={handleUserDeleted}
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
                  <UsersTab
                    users={users}
                    loading={loadingUsers}
                    handleEditUser={handleEditUser}
                    openDeleteConfirmation={openDeleteUserModal} 
                    onUserDeleted={handleUserDeleted}
                  />
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

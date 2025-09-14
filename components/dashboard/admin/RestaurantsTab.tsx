"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search } from "lucide-react"
import { Restaurant} from "@/lib/types"

/*interface Restaurant {
  _id: string
  name: string
  cuisineTypes: string[]
  status: "pending" | "active" | "inactive" 
  createdAt: string
}*/

interface RestaurantsTabProps {
  restaurants: Restaurant[]
  loading: boolean;
  handleEditRestaurant: (restaurant: Restaurant) => void
  openDeleteConfirmation: (restaurant: Restaurant) => void 
  onRestaurantDeleted: (restaurantId: string) => void
}

export default function RestaurantsTab({
  restaurants,
  loading,
  handleEditRestaurant,
  openDeleteConfirmation,
  onRestaurantDeleted,
}: RestaurantsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter restaurants by name or cuisineTypes based on search query (case-insensitive)
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants

    const lowerQuery = searchQuery.toLowerCase()
    return restaurants.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(lowerQuery) ||
        restaurant.cuisineTypes.some((cuisine) => cuisine.toLowerCase().includes(lowerQuery))
      )
    })
  }, [searchQuery, restaurants])

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Restaurant list */}
      {filteredRestaurants.length === 0 ? (
        <p className="text-center text-gray-500">No restaurants found.</p>
      ) : (
        filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:bg-gray-100 hover:scale-101"
          >
            {restaurant.photo && (
              <img
                src={restaurant.photo}
                alt={restaurant.name}
                className="w-24 h-24 object-cover rounded-md mr-4 border"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">
                {restaurant.cuisineTypes?.join(", ")} Cuisine
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge
                  variant={
                    restaurant.status === "active"
                      ? "default"
                      : restaurant.status === "inactive"
                      ? "secondary"
                      : "outline"
                  }
                  className="rounded-full pb-1"
                >
                  {restaurant.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  Added on {new Date(restaurant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="hover:bg-black hover:text-white" onClick={() => handleEditRestaurant(restaurant)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-black hover:text-white"
                onClick={() => openDeleteConfirmation(restaurant)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

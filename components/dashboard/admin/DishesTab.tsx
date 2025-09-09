"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dish } from "@/lib/types";

interface DishesTabProps {
  dishes: Dish[];
  loading: boolean;
  handleEditDish: (dish: Dish) => void;
  openDeleteConfirmation: (dish: Dish) => void;
  onDishDeleted: (dishId: string) => void;
}

export default function DishesTab({
  dishes,
  loading,
  handleEditDish,
  openDeleteConfirmation,
  onDishDeleted,
}: DishesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter dishes by dish name or restaurant name (case-insensitive)
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;

    const lowerQuery = searchQuery.toLowerCase();
    return dishes.filter((dish) => {
      const dishNameMatch = dish.name.toLowerCase().includes(lowerQuery);
      const restaurantName =
        typeof dish.restaurant === "string"
          ? ""
          : dish.restaurant?.name || "";
      const restaurantNameMatch = restaurantName.toLowerCase().includes(lowerQuery);
      return dishNameMatch || restaurantNameMatch;
    });
  }, [searchQuery, dishes]);

  if (loading) {
    return <p className="text-gray-600">Loading dishes...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {filteredDishes.length === 0 ? (
        <p className="text-center text-gray-500">No dishes found.</p>
      ) : (
        filteredDishes.map((dish) => (
          <div
            key={dish._id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100"
          >
            <div>
              <h3 className="font-semibold">{dish.name}</h3>
              <p className="text-sm text-gray-600">
                {typeof dish.restaurant === "string"
                  ? "Unknown Restaurant"
                  : dish.restaurant?.name || "Unknown Restaurant"}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="font-medium text-orange-600">${dish.price}</span>
                <Badge
                  variant={dish.available === true ? "default" : "secondary"}
                  className="bg-black text-white rounded-full"
                >
                  {dish.available === true ? "Available" : "Not Available"}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-black hover:text-white"
                onClick={() => handleEditDish(dish)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-black hover:text-white"
                onClick={() => openDeleteConfirmation(dish)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

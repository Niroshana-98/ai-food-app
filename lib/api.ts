import { Restaurant, Dish } from "./types";

export const api = {
  //  RESTAURANTS 

  createRestaurant: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create restaurant");
    const result = await res.json();
    return result.restaurant;
  },

  getRestaurants: async (params?: Record<string, any>): Promise<Restaurant[]> => {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    const res = await fetch(`/api/restaurants${query}`);
    if (!res.ok) throw new Error("Failed to fetch restaurants");
    const result = await res.json();
    return result.restaurants;
  },

  getRestaurant: async (id: string): Promise<Restaurant> => {
    const res = await fetch(`/api/restaurants/${id}`);
    if (!res.ok) throw new Error("Failed to fetch restaurant");
    const result = await res.json();
    return result.restaurant;
  },

  updateRestaurant: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update restaurant");
    const result = await res.json();
    return result.restaurant;
  },

  deleteRestaurant: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete restaurant");
    return res.json();
  },

  //   DISHES 

  createDish: async (data: Partial<Dish>): Promise<Dish> => {
    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create dish");
    const result = await res.json();
    return result.dish; // ✅ already populated with restaurant { _id, name }
  },

  getDishes: async (): Promise<Dish[]> => {
    const res = await fetch("/api/dishes");
    if (!res.ok) throw new Error("Failed to fetch dishes");
    const result = await res.json();
    return result.dishes; // ✅ each dish has restaurant { _id, name }
  },

  getDish: async (id: string): Promise<Dish> => {
    const res = await fetch(`/api/dishes/${id}`);
    if (!res.ok) throw new Error("Failed to fetch dish");
    const result = await res.json();
    return result.dish; // ✅ populated dish
  },

  updateDish: async (id: string, data: Partial<Dish>): Promise<Dish> => {
    const res = await fetch(`/api/dishes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update dish");
    const result = await res.json();
    return result.dish; // ✅ populated dish
  },

  deleteDish: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`/api/dishes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete dish");
    return res.json();
  },
};

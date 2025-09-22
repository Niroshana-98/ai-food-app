export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  cuisineTypes: string[];
  status: "active" | "inactive" | "pending";
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dish {
  _id: string;
  restaurant: string | { _id: string; name: string };
  name: string;
  price: number;
  description?: string;
  category: string;
  cuisineType: string;
  preparationTime: number;
  dietaryTags: string[];
  ingredients: string[];
  available: boolean;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name?: string;
  phone?: string;
  role: "admin" | "restaurant_owner" | "customer";
  status: "active" | "inactive" | "suspended";
  dateOfBirth?: string ;
  address?: string;
  city?: string;
  district?: string;
  country?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}

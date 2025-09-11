export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisineTypes: string[];
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  totalOrders: number;
  status: "active" | "inactive" | "pending";
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
  createdAt: string;
  updatedAt: string;
}

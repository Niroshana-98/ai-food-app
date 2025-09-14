"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, X } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

interface AddDishFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function AddDishForm({ onClose, onSuccess }: AddDishFormProps) {

    const [loading, setLoading] = useState(false)
    const [restaurants, setRestaurants] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [customDietaryTag, setCustomDietaryTag] = useState("")
    const [currentIngredient, setCurrentIngredient] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        restaurant: "",
        name: "",
        price: "",
        description: "",
        category: "",
        cuisineType: "",
        preparationTime: "",
        dietaryTags: [] as string[],
        ingredients: [] as string[],
        available: true,
        photo: null as File | null,       
        
    })

    

    const categoryOptions = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish", "Salad", "Soup"]

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

    const dietaryTagOptions = [
        "Vegan",
        "Vegetarian",
        "Gluten-Free",
        "Dairy-Free",
        "Nut-Free",
        "Halal",
        "Kosher",
        "Spicy",
        "Mild",
        "Comfort Food",
        "Healthy",
        "Street Food",
        "Fine Dining",
        "Quick Bite",
        "Creamy",
    ]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = "Dish Name is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        if (!formData.price.trim()) newErrors.price = "Price is required"
        if (!formData.category.trim()) newErrors.category = "Category is required"
        if (!formData.cuisineType.trim()) newErrors.cuisineType = "Cuisine Type is required"
        if (!formData.restaurant.trim()) newErrors.restaurantId = "Restaurant is required"
        if (!formData.preparationTime.trim()) newErrors.preparationTime = "Preparation Time is required"

        // Price validation
        const price = Number.parseFloat(formData.price)
        if (formData.price && (isNaN(price) || price <= 0)) {
            newErrors.price = "Please enter a valid price greater than 0"
        }

        // Preparation time validation
        const prepTime = Number.parseInt(formData.preparationTime)
        if (formData.preparationTime && (isNaN(prepTime) || prepTime <= 0)) {
            newErrors.preparationTime = "Please enter a valid preparation time in minutes"
        }

        if (formData.ingredients.length === 0) {
            newErrors.ingredients = "At least one ingredient is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    
    const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      cuisineType: "",
      dietaryTags: [] as string[],
      ingredients: [] as string[],
      restaurant: "",
      preparationTime: "",
      available: true,
      photo: null,
    })
    setErrors({})
    setImagePreview(null)
    onClose()
  }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const toggleDietaryTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            dietaryTags: prev.dietaryTags.includes(tag)
                ? prev.dietaryTags.filter((t) => t !== tag)
                : [...prev.dietaryTags, tag],
        }))
    }

    const addCustomDietaryTag = () => {
        if (customDietaryTag.trim() && !formData.dietaryTags.includes(customDietaryTag.trim())) {
            setFormData((prev) => ({
                ...prev,
                dietaryTags: [...prev.dietaryTags, customDietaryTag.trim()],
            }))
            setCustomDietaryTag("")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, photo: file }));
            
            // Create image preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, photo: null }));
        setImagePreview(null);
        // Reset the file input
        const fileInput = document.getElementById('photo') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const addIngredient = () => {
        if (currentIngredient.trim() && !formData.ingredients.includes(currentIngredient.trim())) {
            setFormData((prev) => ({
                ...prev,
                ingredients: [...prev.ingredients, currentIngredient.trim()],
            }))
            setCurrentIngredient("")
            if (errors.ingredients) {
                setErrors((prev) => ({ ...prev, ingredients: "" }))
            }
        }
    }

    const removeIngredient = (ingredient: string) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((i) => i !== ingredient),
        }))
    }

    useEffect(() => {
      const fetchRestaurants = async () => {
        try {
          const res = await fetch("/api/restaurants")
          const data = await res.json()
          if (data.success) setRestaurants(data.restaurants)
        } catch (err) {
          console.error("Failed to fetch restaurants:", err)
        }
      }
      fetchRestaurants()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "photo" && value instanceof File) {
            form.append("photo", value);
            } else if (Array.isArray(value)) {
            form.append(key, JSON.stringify(value));
            } else if (value !== null) {
            form.append(key, String(value));
            }
        });

        const promise = fetch("/api/dishes", {
            method: "POST",
            body: form, // ✅ send multipart/form-data
        });

        toast.promise(promise, {
            loading: "Adding dish...",
            success: "Dish added successfully! 🎉",
            error: "Failed to add dish. Please try again.",
        });

        try {
            const res = await promise;
            if (!res.ok) throw new Error("Failed to create dish");
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error adding dish:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Restaurant Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Selection</h3>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Restaurant *</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                            >
                            {formData.restaurant
                                ? restaurants.find(r => r._id === formData.restaurant)?.name
                                : "Select restaurant"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                            <CommandInput placeholder="Search restaurant..." />
                            <CommandEmpty>No restaurant found.</CommandEmpty>
                            <CommandGroup>
                                {restaurants.map(r => (
                                <CommandItem
                                    key={r._id}
                                    onSelect={() => {
                                    handleInputChange("restaurant", r._id)
                                    setOpen(false)
                                    }}
                                >
                                    {r.name}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </Command>
                        </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dish Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Dish Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                                placeholder="Enter dish name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium">
                                Price ($) *
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => handleInputChange("price", e.target.value)}
                                className={errors.price ? "border-red-500 focus:border-red-500" : ""}
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description *
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className={`min-h-[80px] resize-none ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
                            placeholder="Describe the dish, its flavors, and preparation..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-medium">
                                Category *
                            </Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleInputChange("category", e.target.value)}
                                className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.category ? "border-red-500 focus:border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select category...</option>
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cuisineType" className="text-sm font-medium">
                                Cuisine Type *
                            </Label>
                            <select
                                id="cuisineType"
                                value={formData.cuisineType}
                                onChange={(e) => handleInputChange("cuisineType", e.target.value)}
                                className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.cuisineType ? "border-red-500 focus:border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select cuisine...</option>
                                {cuisineOptions.map((cuisine) => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                            </select>
                            {errors.cuisineType && <p className="text-red-500 text-xs mt-1">{errors.cuisineType}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="preparationTime" className="text-sm font-medium">
                                Prep Time (minutes) *
                            </Label>
                            <Input
                                id="preparationTime"
                                type="number"
                                min="1"
                                value={formData.preparationTime}
                                onChange={(e) => handleInputChange("preparationTime", e.target.value)}
                                className={errors.preparationTime ? "border-red-500 focus:border-red-500" : ""}
                                placeholder="30"
                            />
                            {errors.preparationTime && <p className="text-red-500 text-xs mt-1">{errors.preparationTime}</p>}
                        </div>
                    </div>
                    
                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="photo" className="text-sm font-medium">Dish Photo *</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                        
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative inline-block">
                                <div className="relative w-full max-w-sm">
                                    <img
                                        src={imagePreview}
                                        alt="Dish preview"
                                        className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                                        title="Remove image"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Click the X to remove the image</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dietary Tags */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dietary Tags</h3>

                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {dietaryTagOptions.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={formData.dietaryTags.includes(tag) ? "default" : "secondary"}
                                    className={`cursor-pointer transition-all duration-200 px-3 py-1 ${formData.dietaryTags.includes(tag)
                                            ? "bg-orange-600 hover:bg-orange-700 text-white"
                                            : "bg-gray-100 hover:bg-orange-100 text-gray-700"
                                        }`}
                                    onClick={() => toggleDietaryTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Add custom dietary tag"
                                value={customDietaryTag}
                                onChange={(e) => setCustomDietaryTag(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomDietaryTag())}
                                className="flex-1"
                            />
                            <Button type="button" onClick={addCustomDietaryTag} variant="outline" size="sm">
                                Add
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Ingredients</h3>

                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add ingredient (e.g., Chicken, Tomatoes, Spices)"
                                value={currentIngredient}
                                onChange={(e) => setCurrentIngredient(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                                className="flex-1"
                            />
                            <Button type="button" onClick={addIngredient} variant="outline" size="sm">
                                Add
                            </Button>
                        </div>

                        {formData.ingredients.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.ingredients.map((ingredient) => (
                                    <Badge
                                        key={ingredient}
                                        variant="secondary"
                                        className="px-3 py-1 bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                                        onClick={() => removeIngredient(ingredient)}
                                    >
                                        {ingredient} ×
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {errors.ingredients && <p className="text-red-500 text-xs">{errors.ingredients}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Dish"}
                  </Button>
                </div>
            </form>
        </div>
    )
}
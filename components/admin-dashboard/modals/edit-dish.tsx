"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

interface EditDishModalProps {
    dish: any
    onSuccess: () => void
    onCancel: () => void
}

export function EditDishModal({ dish, onSuccess, onCancel }: EditDishModalProps) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [restaurants, setRestaurants] = useState<any[]>([])
    const [loadingRestaurants, setLoadingRestaurants] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        cuisineType: "",
        dietaryTags: [] as string[],
        ingredients: [] as string[],
        restaurantId: "",
        preparationTime: "",
        available: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [customDietaryTag, setCustomDietaryTag] = useState("")
    const [currentIngredient, setCurrentIngredient] = useState("")

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

    useEffect(() => {
        if (dish) {
            setFormData({
                name: dish.name || "",
                description: dish.description || "",
                price: dish.price?.toString() || "",
                category: dish.category || "",
                cuisineType: dish.cuisineType || "",
                dietaryTags: dish.dietaryTags || [],
                ingredients: dish.ingredients || [],
                restaurantId: dish.restaurantId?._id || dish.restaurantId || "",
                preparationTime: dish.preparationTime?.toString() || "",
                available: dish.available !== undefined ? dish.available : true,
            })
        }
        fetchRestaurants()
    }, [dish])

    const fetchRestaurants = async () => {
        try {
            setLoadingRestaurants(true)
            const response = await api.getRestaurants({
                limit: 100,
            })
            const availableRestaurants = (response.restaurants || []).filter(
                (restaurant: any) => restaurant.status === "active" || restaurant.status === "pending",
            )

            setRestaurants(availableRestaurants)
        } catch (error) {
            console.error("Error fetching restaurants:", error)
            showToast("Failed to load restaurants. Please try again.", "error")
        } finally {
            setLoadingRestaurants(false)
        }
    }
    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = "Dish name is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        if (!formData.price.trim()) newErrors.price = "Price is required"
        if (!formData.category) newErrors.category = "Category is required"
        if (!formData.cuisineType) newErrors.cuisineType = "Cuisine type is required"
        if (!formData.restaurantId) newErrors.restaurantId = "Restaurant selection is required"
        if (!formData.preparationTime.trim()) newErrors.preparationTime = "Preparation time is required"

        const price = Number.parseFloat(formData.price)
        if (formData.price && (isNaN(price) || price <= 0)) {
            newErrors.price = "Please enter a valid price greater than 0"
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        try {
            await api.updateDish(dish._id, {
                ...formData,
                price: Number.parseFloat(formData.price),
                preparationTime: Number.parseInt(formData.preparationTime),
            })

            showToast("Dish updated successfully!", "success")
            onSuccess()
        } catch (error) {
            console.error("Error updating dish:", error)
            showToast("Failed to update dish. Please try again.", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
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

    const getSelectedRestaurant = () => {
        return restaurants.find((r) => r._id === formData.restaurantId)
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Availability Status */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dish Status</h3>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Availability</Label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="available"
                                    checked={formData.available === true}
                                    onChange={() => handleInputChange("available", true)}
                                    className="text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-sm">Available</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="available"
                                    checked={formData.available === false}
                                    onChange={() => handleInputChange("available", false)}
                                    className="text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-sm">Unavailable</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">
                            {formData.available ? "Dish is available for ordering" : "Dish is temporarily unavailable for ordering"}
                        </p>
                    </div>
                </div>

                {/* Restaurant Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Selection</h3>

                    <div className="space-y-2">
                        <Label htmlFor="restaurant" className="text-sm font-medium">
                            Select Restaurant *
                        </Label>
                        {loadingRestaurants ? (
                            <div className="flex items-center justify-center p-4 border rounded-md">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2"></div>
                                <span className="text-sm text-gray-600">Loading restaurants...</span>
                            </div>
                        ) : restaurants.length === 0 ? (
                            <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    No active or pending restaurants available. Please add a restaurant first.
                                </p>
                            </div>
                        ) : (
                            <>
                                <select
                                    id="restaurant"
                                    value={formData.restaurantId}
                                    onChange={(e) => handleInputChange("restaurantId", e.target.value)}
                                    className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.restaurantId ? "border-red-500 focus:border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Choose a restaurant...</option>
                                    {restaurants.map((restaurant) => (
                                        <option key={restaurant._id} value={restaurant._id}>
                                            {restaurant.name} ({restaurant.status})
                                        </option>
                                    ))}
                                </select>
                                {errors.restaurantId && <p className="text-red-500 text-xs mt-1">{errors.restaurantId}</p>}

                                {/* Selected Restaurant Info */}
                                {formData.restaurantId && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{getSelectedRestaurant()?.name}</h4>
                                                <p className="text-sm text-gray-600">{getSelectedRestaurant()?.address}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge variant={getSelectedRestaurant()?.status === "active" ? "default" : "secondary"}>
                                                        {getSelectedRestaurant()?.status}
                                                    </Badge>
                                                    {getSelectedRestaurant()?.cuisineTypes?.map((cuisine: string) => (
                                                        <Badge key={cuisine} variant="outline" className="text-xs">
                                                            {cuisine}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
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

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-white hover:bg-gray-50"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading || restaurants.length === 0}
                    >
                        {loading ? "Updating Dish..." : "Update Dish"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, X } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import { Dish } from "@/lib/types"
import { Switch } from "@/components/ui/switch"

interface EditDishModalProps {
    dish: any
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function EditDishModal({ dish, isOpen, onSuccess, onClose }: EditDishModalProps) {
    const [loading, setLoading] = useState(false)
    const [restaurants, setRestaurants] = useState<any[]>([])
    const [loadingRestaurants, setLoadingRestaurants] = useState(true)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [newImageFile, setNewImageFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
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
        photo: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [customDietaryTag, setCustomDietaryTag] = useState("")
    const [currentIngredient, setCurrentIngredient] = useState("")
    const [open, setOpen] = useState(false)

    const categoryOptions = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish", "Salad", "Soup"]
    const cuisineOptions = [
        "Indian", "Chinese", "Italian", "Mexican", "Thai", "Japanese", 
        "Mediterranean", "American", "French", "Korean", "Vietnamese", "Greek"
    ]
    const dietaryTagOptions = [
        "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal", 
        "Kosher", "Spicy", "Mild", "Comfort Food", "Healthy", "Street Food", 
        "Fine Dining", "Quick Bite", "Creamy"
    ]

    // Initialize form data with dish properties
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
                restaurant: dish.restaurant?._id || "",
                preparationTime: dish.preparationTime?.toString() || "",
                available: dish.available ?? true,
                photo: dish.photo || "",
            })
            
            if (dish.photo) {
                setImagePreview(dish.photo)
            }
        }
        fetchRestaurants()
    }, [dish])

    // Fetch available restaurants for dropdown
    const fetchRestaurants = async () => {
        try {
            setLoadingRestaurants(true)
            const response = await api.getRestaurants()
            const availableRestaurants = response.filter(
                (restaurant: any) => restaurant.status === "active" || restaurant.status === "pending",
            )
            setRestaurants(availableRestaurants)
        } catch (error) {
            console.error("Error fetching restaurants:", error)
            toast.error("Failed to load restaurants. Please try again.")
        } finally {
            setLoadingRestaurants(false)
        }
    }

    // Validate form fields and return validation status
    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = "Dish name is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        if (!formData.price.trim()) newErrors.price = "Price is required"
        if (!formData.category) newErrors.category = "Category is required"
        if (!formData.cuisineType) newErrors.cuisineType = "Cuisine type is required"
        if (!formData.restaurant) newErrors.restaurant = "Restaurant selection is required"
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

    // Handle image file selection and preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setNewImageFile(file)
            
            const reader = new FileReader()
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Remove selected image and clear preview
    const removeImage = () => {
        setImagePreview(null)
        setNewImageFile(null)
        setFormData(prev => ({ ...prev, photo: "" }))
        
        const fileInput = document.getElementById('photo') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    // Handle form submission with file upload support
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        try {
            const updatedData: any = {
                ...formData,
                price: Number.parseFloat(formData.price),
                preparationTime: Number.parseInt(formData.preparationTime),
            }

            if (newImageFile) {
                // Update with new image file
                const formDataWithImage = new FormData()
                formDataWithImage.append('restaurant', updatedData.restaurant)
                formDataWithImage.append('name', updatedData.name)
                formDataWithImage.append('price', String(updatedData.price))
                formDataWithImage.append('description', updatedData.description)
                formDataWithImage.append('category', updatedData.category)
                formDataWithImage.append('cuisineType', updatedData.cuisineType)
                formDataWithImage.append('preparationTime', String(updatedData.preparationTime))
                formDataWithImage.append('dietaryTags', JSON.stringify(updatedData.dietaryTags))
                formDataWithImage.append('ingredients', JSON.stringify(updatedData.ingredients))
                formDataWithImage.append('available', String(updatedData.available))
                formDataWithImage.append('photo', newImageFile)
                
                const promise = api.updateDishWithFile(dish._id, formDataWithImage)
                toast.promise(promise, {
                    loading: "Updating dish with new image...",
                    success: "Dish updated successfully!",
                    error: "Failed to update dish. Please try again.",
                })
                await promise
            } else {
                // Update without new image
                const promise = api.updateDish(dish._id, updatedData)
                toast.promise(promise, {
                    loading: "Updating dish...",
                    success: "Dish updated successfully!",
                    error: "Failed to update dish. Please try again.",
                })
                await promise
            }
            
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error updating dish:", error)
            toast.error("Failed to update dish. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Update form field and clear related errors
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    // Toggle dietary tag selection
    const toggleDietaryTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            dietaryTags: prev.dietaryTags.includes(tag)
                ? prev.dietaryTags.filter((t) => t !== tag)
                : [...prev.dietaryTags, tag],
        }))
    }

    // Add custom dietary tag if valid
    const addCustomDietaryTag = () => {
        if (customDietaryTag.trim() && !formData.dietaryTags.includes(customDietaryTag.trim())) {
            setFormData((prev) => ({
                ...prev,
                dietaryTags: [...prev.dietaryTags, customDietaryTag.trim()],
            }))
            setCustomDietaryTag("")
        }
    }

    // Add ingredient if valid and unique
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

    // Remove ingredient from list
    const removeIngredient = (ingredient: string) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((i) => i !== ingredient),
        }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
                {/* Modal Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b bg-white rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Edit Dish - {dish?.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Update dish information and manage status
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-900 text-2xl font-bold leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        
                        {/* Availability Status */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dish Status</h3>
                            <div className="flex space-y-2">
                                <Label className="text-sm font-medium mr-4">Available</Label>
                                <Switch
                                    checked={formData.available}
                                    onCheckedChange={(checked) => handleInputChange("available", checked)}
                                />
                                <p className="text-xs text-gray-500 ml-4">
                                    {formData.available 
                                        ? "Dish is available for ordering" 
                                        : "Dish is temporarily unavailable for ordering"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Restaurant Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Selection</h3>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Select Restaurant *</Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                        >
                                            {formData.restaurant
                                                ? restaurants.find(r => r._id === formData.restaurant)?.name
                                                : "Select restaurant"
                                            }
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
                                    <Label htmlFor="name" className="text-sm font-medium">Dish Name *</Label>
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
                                    <Label htmlFor="price" className="text-sm font-medium">Price ($) *</Label>
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
                                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
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
                                    <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => handleInputChange("category", e.target.value)}
                                        className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                            errors.category ? "border-red-500 focus:border-red-500" : "border-gray-300"
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
                                    <Label htmlFor="cuisineType" className="text-sm font-medium">Cuisine Type *</Label>
                                    <select
                                        id="cuisineType"
                                        value={formData.cuisineType}
                                        onChange={(e) => handleInputChange("cuisineType", e.target.value)}
                                        className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                            errors.cuisineType ? "border-red-500 focus:border-red-500" : "border-gray-300"
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
                                    <Label htmlFor="preparationTime" className="text-sm font-medium">Prep Time (minutes) *</Label>
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
                                    <Label htmlFor="photo" className="text-sm font-medium">Dish Photo</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {newImageFile && (
                                        <p className="text-sm text-blue-600">New image selected: {newImageFile.name}</p>
                                    )}
                                </div>
                                
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
                                        <p className="text-sm text-gray-500 mt-2">
                                            {newImageFile ? "New image preview - Click X to remove" : "Current dish image - Click X to remove"}
                                        </p>
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
                                            className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                                                formData.dietaryTags.includes(tag)
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
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={loading || restaurants.length === 0}
                                onClick={handleSubmit}
                            >
                                {loading ? "Updating Dish..." : "Update Dish"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
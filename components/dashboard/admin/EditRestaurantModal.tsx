'use client'

import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { Restaurant } from "@/lib/types"
import { X } from "lucide-react"

interface OperatingHours {
    open: string
    close: string 
    closed: boolean
}

interface EditRestaurantModalProps {
    restaurant: any
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface EditFormData {
    name: string
    description: string
    phone: string
    email: string
    website: string
    address: string
    cuisineTypes: string[]
    status: Restaurant["status"]
    operatingHours: Record<string, OperatingHours>
    photo: string
}

export function EditRestaurantModal({ restaurant, isOpen, onClose, onSuccess }: EditRestaurantModalProps) {
    const [editErrors, setEditErrors] = useState<Record<string, string>>({})
    const [editLoading, setEditLoading] = useState(false)
    const [customEditCuisine, setCustomEditCuisine] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [newImageFile, setNewImageFile] = useState<File | null>(null)
    const [editFormData, setEditFormData] = useState<EditFormData>({
        name: "",
        description: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        cuisineTypes: [],
        status: "active",
        operatingHours: {
            monday: { open: "09:00", close: "22:00", closed: false },
            tuesday: { open: "09:00", close: "22:00", closed: false },
            wednesday: { open: "09:00", close: "22:00", closed: false },
            thursday: { open: "09:00", close: "22:00", closed: false },
            friday: { open: "09:00", close: "23:00", closed: false },
            saturday: { open: "09:00", close: "23:00", closed: false },
            sunday: { open: "10:00", close: "21:00", closed: false },
        } as Record<string, OperatingHours>,
        photo: "",
    })

    const cuisineOptions = [
        "Indian", "Chinese", "Italian", "Mexican", "Thai", "Japanese",
        "Mediterranean", "American", "French", "Korean", "Vietnamese", "Greek"
    ]

    // Initialize form data with restaurant properties
    useEffect(() => {
        if (restaurant) {
            setEditFormData({
                name: restaurant.name || "",
                description: restaurant.description || "",
                phone: restaurant.phone || "",
                email: restaurant.email || "",
                website: restaurant.website || "",
                address: restaurant.address || "",
                cuisineTypes: restaurant.cuisineTypes || [],
                status: restaurant.status || "active",
                operatingHours: restaurant.operatingHours || {
                    monday: { open: "09:00", close: "22:00", closed: false },
                    tuesday: { open: "09:00", close: "22:00", closed: false },
                    wednesday: { open: "09:00", close: "22:00", closed: false },
                    thursday: { open: "09:00", close: "22:00", closed: false },
                    friday: { open: "09:00", close: "23:00", closed: false },
                    saturday: { open: "09:00", close: "23:00", closed: false },
                    sunday: { open: "10:00", close: "21:00", closed: false },
                },
                photo: restaurant.photo || "",
            })

            if (restaurant.photo) {
                setImagePreview(restaurant.photo)
            }
        }
    }, [restaurant])

    // Validate form fields and return validation status
    const validateEditForm = () => {
        const newErrors: Record<string, string> = {}

        if (!editFormData.name.trim()) newErrors.name = "Restaurant name is required"
        if (!editFormData.phone.trim()) newErrors.phone = "Phone number is required"
        if (!editFormData.email.trim()) newErrors.email = "Email is required"
        if (!editFormData.address.trim()) newErrors.address = "Address is required"
        if (editFormData.cuisineTypes.length === 0) newErrors.cuisineTypes = "At least one cuisine type is required"

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (editFormData.email && !emailRegex.test(editFormData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        setEditErrors(newErrors)
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
        setEditFormData(prev => ({ ...prev, photo: "" }))
        
        const fileInput = document.getElementById('restaurant-photo') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    // Update form field and clear related errors
    const handleEditInputChange = (field: string, value: string) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }))
        if (editErrors[field]) {
            setEditErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    // Toggle cuisine type selection
    const toggleEditCuisine = (cuisine: string) => {
        setEditFormData((prev) => ({
            ...prev,
            cuisineTypes: prev.cuisineTypes.includes(cuisine)
                ? prev.cuisineTypes.filter((c: string) => c !== cuisine)
                : [...prev.cuisineTypes, cuisine],
        }))
        if (editErrors.cuisineTypes) {
            setEditErrors((prev) => ({ ...prev, cuisineTypes: "" }))
        }
    }

    // Add custom cuisine type if valid
    const addCustomEditCuisine = () => {
        if (customEditCuisine.trim() && !editFormData.cuisineTypes.includes(customEditCuisine.trim())) {
            setEditFormData((prev) => ({
                ...prev,
                cuisineTypes: [...prev.cuisineTypes, customEditCuisine.trim()],
            }))
            setCustomEditCuisine("")
        }
    }

    // Update operating hours for specific day
    const updateEditOperatingHours = (day: string, field: string, value: string | boolean) => {
        setEditFormData((prev) => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: {
                    ...prev.operatingHours[day],
                    [field]: value,
                },
            },
        }))
    }

    // Handle form submission with file upload support
    const handleSubmit = async () => {
        if (!validateEditForm()) return
        
        setEditLoading(true)
        try {
            if (newImageFile) {
                // Update with new image file
                const formDataWithImage = new FormData()
                formDataWithImage.append('name', editFormData.name)
                formDataWithImage.append('description', editFormData.description)
                formDataWithImage.append('phone', editFormData.phone)
                formDataWithImage.append('email', editFormData.email)
                formDataWithImage.append('website', editFormData.website)
                formDataWithImage.append('address', editFormData.address)
                formDataWithImage.append('cuisineTypes', JSON.stringify(editFormData.cuisineTypes))
                formDataWithImage.append('status', editFormData.status)
                formDataWithImage.append('operatingHours', JSON.stringify(editFormData.operatingHours))
                formDataWithImage.append('photo', newImageFile)

                const promise = api.updateRestaurantWithFile(restaurant._id, formDataWithImage)
                toast.promise(promise, {
                    loading: "Updating restaurant with new image...",
                    success: "Restaurant updated successfully!",
                    error: "Failed to update restaurant. Please try again.",
                })
                await promise
            } else {
                // Update without new image
                const promise = api.updateRestaurant(restaurant._id, editFormData)
                toast.promise(promise, {
                    loading: "Updating restaurant...",
                    success: "Restaurant updated successfully!",
                    error: "Failed to update restaurant. Please try again.",
                })
                await promise
            }
            
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error updating restaurant:", error)
            toast.error("Failed to update restaurant. Please try again.")
        } finally {
            setEditLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b bg-white rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Edit Restaurant - {restaurant?.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Update restaurant information and manage status
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
                        
                        {/* Status Management */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Status</h3>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Current Status</Label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) => handleEditInputChange("status", e.target.value as "active" | "inactive" | "pending")}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending Approval</option>
                                </select>
                                <p className="text-xs text-gray-500">
                                    {editFormData.status === "active" && "Restaurant is live and accepting orders"}
                                    {editFormData.status === "inactive" && "Restaurant is temporarily closed"}
                                    {editFormData.status === "pending" && "Restaurant is awaiting admin approval"}
                                </p>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name" className="text-sm font-medium">Restaurant Name *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editFormData.name}
                                        onChange={(e) => handleEditInputChange("name", e.target.value)}
                                        className={editErrors.name ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone" className="text-sm font-medium">Phone Number *</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editFormData.phone}
                                        onChange={(e) => handleEditInputChange("phone", e.target.value)}
                                        className={editErrors.phone ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {editErrors.phone && <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email" className="text-sm font-medium">Email Address *</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => handleEditInputChange("email", e.target.value)}
                                        className={editErrors.email ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {editErrors.email && <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-website" className="text-sm font-medium">Website</Label>
                                    <Input
                                        id="edit-website"
                                        value={editFormData.website}
                                        onChange={(e) => handleEditInputChange("website", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editFormData.description}
                                    onChange={(e) => handleEditInputChange("description", e.target.value)}
                                    className="min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-address" className="text-sm font-medium">Full Address *</Label>
                                <Textarea
                                    id="edit-address"
                                    value={editFormData.address}
                                    onChange={(e) => handleEditInputChange("address", e.target.value)}
                                    className={`min-h-[60px] resize-none ${editErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                                />
                                {editErrors.address && <p className="text-red-500 text-xs mt-1">{editErrors.address}</p>}
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant-photo" className="text-sm font-medium">Restaurant Photo</Label>
                                    <Input
                                        id="restaurant-photo"
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
                                                alt="Restaurant preview"
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
                                            {newImageFile ? "New image preview - Click X to remove" : "Current restaurant image - Click X to remove"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cuisine Types */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Cuisine Types</h3>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {cuisineOptions.map((cuisine) => (
                                        <Badge
                                            key={cuisine}
                                            variant={editFormData.cuisineTypes.includes(cuisine) ? "default" : "secondary"}
                                            className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                                                editFormData.cuisineTypes.includes(cuisine)
                                                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                                                    : "bg-gray-100 hover:bg-orange-100 text-gray-700"
                                            }`}
                                            onClick={() => toggleEditCuisine(cuisine)}
                                        >
                                            {cuisine}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add custom cuisine type"
                                        value={customEditCuisine}
                                        onChange={(e) => setCustomEditCuisine(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomEditCuisine())}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addCustomEditCuisine} variant="outline" size="sm">
                                        Add
                                    </Button>
                                </div>

                                {editErrors.cuisineTypes && <p className="text-red-500 text-xs">{editErrors.cuisineTypes}</p>}
                            </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operating Hours</h3>
                            <div className="space-y-3">
                                {Object.entries(editFormData.operatingHours).map(([day, hours]) => (
                                    <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                                            <div className="w-20">
                                                <Label className="capitalize text-sm font-medium">{day}</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={(hours as OperatingHours).closed}
                                                    onChange={(e) => updateEditOperatingHours(day, "closed", e.target.checked)}
                                                    className="rounded"
                                                />
                                                <Label className="text-sm text-gray-600">Closed</Label>
                                            </div>

                                            {!(hours as OperatingHours).closed && (
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        type="time"
                                                        value={(hours as OperatingHours).open}
                                                        onChange={(e) => updateEditOperatingHours(day, "open", e.target.value)}
                                                        className="w-30 text-sm"
                                                    />
                                                    <span className="text-sm text-gray-500">to</span>
                                                    <Input
                                                        type="time"
                                                        value={(hours as OperatingHours).close}
                                                        onChange={(e) => updateEditOperatingHours(day, "close", e.target.value)}
                                                        className="w-30 text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 bg-white hover:bg-gray-50"
                                onClick={onClose}
                                disabled={editLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={editLoading}
                                onClick={handleSubmit}
                            >
                                {editLoading ? "Saving Changes..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
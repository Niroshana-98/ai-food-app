"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { toast } from "react-hot-toast";

interface AddRestaurantFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddRestaurantForm({ onSuccess, onCancel }: AddRestaurantFormProps) {
  //const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customCuisine, setCustomCuisine] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    cuisineTypes: [] as string[],
    operatingHours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "23:00", closed: false },
      saturday: { open: "09:00", close: "23:00", closed: false },
      sunday: { open: "10:00", close: "21:00", closed: false },
    },
  })

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Restaurant name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (formData.cuisineTypes.length === 0) newErrors.cuisineTypes = "At least one cuisine type is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);

  try {
    await toast.promise(
      api.createRestaurant({
        ...formData,
        status: "pending",
      }),
      {
        loading: "Submitting restaurant... ⏳",
        success: "Restaurant created successfully! 🎉 ",
        error: "Failed to create restaurant. Please try again.",
      }
    );

    onSuccess();
    } catch (error) {
      console.error("Error creating restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const toggleCuisine = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }))
    if (errors.cuisineTypes) {
      setErrors((prev) => ({ ...prev, cuisineTypes: "" }))
    }
  }

  const addCustomCuisine = () => {
    if (customCuisine.trim() && !formData.cuisineTypes.includes(customCuisine.trim())) {
      setFormData((prev) => ({
        ...prev,
        cuisineTypes: [...prev.cuisineTypes, customCuisine.trim()],
      }))
      setCustomCuisine("")
    }
  }

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value,
        },
      },
    }))
  }

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Restaurant Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                placeholder="Enter restaurant name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className={`${errors.phone ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                placeholder="restaurant@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://restaurant.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your restaurant, specialties, and atmosphere..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Full Address *
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street address, city, state, ZIP code"
              className={`min-h-[60px] resize-none ${errors.address ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                  variant={formData.cuisineTypes.includes(cuisine) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                    formData.cuisineTypes.includes(cuisine)
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-gray-100 hover:bg-orange-100 text-gray-700"
                  }`}
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom cuisine type"
                value={customCuisine}
                onChange={(e) => setCustomCuisine(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCuisine())}
                className="flex-1"
              />
              <Button type="button" onClick={addCustomCuisine} variant="outline" size="sm">
                Add
              </Button>
            </div>

            {errors.cuisineTypes && <p className="text-red-500 text-xs">{errors.cuisineTypes}</p>}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operating Hours</h3>

          <div className="space-y-3">
            {Object.entries(formData.operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-20">
                    <Label className="capitalize text-sm font-medium">{day}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => updateOperatingHours(day, "closed", e.target.checked)}
                      className="rounded"
                    />
                    <Label className="text-sm text-gray-600">Closed</Label>
                  </div>

                  {!hours.closed && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOperatingHours(day, "open", e.target.value)}
                        className="w-30 text-sm"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOperatingHours(day, "close", e.target.value)}
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
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
            {loading ? "Creating Restaurant..." : "Create Restaurant"}
          </Button>
        </div>
      </form>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  dateOfBirth?: string
  address?: string
  city?: string
  district?: string
  country?: string
  zipCode?: string
  dietaryPreferences?: string[]
  moodPreferences?: string[]
}

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DIETARY_PREFERENCES = [
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Kosher",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Spicy",
  "Mild",
]

const MOOD_PREFERENCES = [
  "Adventurous",
  "Comfort Food",
  "Healthy",
  "Indulgent",
  "Quick Bite",
  "Fine Dining",
  "Casual",
  "Nostalgic",
  "Exotic",
  "Traditional",
]

const COUNTRIES = [
  { code: "", name: "Select country..." },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "PH", name: "Philippines" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
]

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    status: "active",
    dateOfBirth: "",
    address: "",
    city: "",
    district: "",
    country: "",
    zipCode: "",
    dietaryPreferences: [] as string[],
    moodPreferences: [] as string[],
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "customer",
        status: user.status || "active",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
        country: user.country || "",
        zipCode: user.zipCode || "",
        dietaryPreferences: user.dietaryPreferences || [],
        moodPreferences: user.moodPreferences || [],
      })
      setErrors({})
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-()]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const toggleDietaryPreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter((p) => p !== pref)
        : [...prev.dietaryPreferences, pref],
    }))
  }

  const toggleMoodPreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      moodPreferences: prev.moodPreferences.includes(pref)
        ? prev.moodPreferences.filter((p) => p !== pref)
        : [...prev.moodPreferences, pref],
    }))
  }

  const handleSave = async () => {
    if (!validateForm() || !user) return

    setLoading(true)
    try {
      // Replace this with your actual API call
      const response = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "active":
        return "User can access all features"
      case "inactive":
        return "User account is temporarily disabled"
      case "suspended":
        return "User account is suspended due to violations"
      default:
        return ""
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Edit User - {user.name}</h2>
          <p className="text-sm text-gray-600 mt-1">Update user information, status, and preferences</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* User Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    {getStatusDescription(formData.status)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">User Role</Label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="restaurant_owner">Restaurant Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="edit-user-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-user-email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                    placeholder="user@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="edit-user-phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500 focus:border-red-500" : ""}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-user-birthday" className="text-sm font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="edit-user-birthday"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location Information</h3>

              <div className="space-y-2">
                <Label htmlFor="edit-user-address" className="text-sm font-medium">
                  Street Address
                </Label>
                <Textarea
                  id="edit-user-address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address, apartment, suite, etc."
                  className="min-h-[60px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="edit-user-city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-user-district" className="text-sm font-medium">
                    District/State
                  </Label>
                  <Input
                    id="edit-user-district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="Enter district or state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-country" className="text-sm font-medium">
                    Country
                  </Label>
                  <select
                    id="edit-user-country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-user-zipcode" className="text-sm font-medium">
                    ZIP/Postal Code
                  </Label>
                  <Input
                    id="edit-user-zipcode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="Enter ZIP or postal code"
                  />
                </div>
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dietary Preferences</h3>

              <div className="flex flex-wrap gap-2">
                {DIETARY_PREFERENCES.map((pref) => (
                  <Badge
                    key={pref}
                    variant={formData.dietaryPreferences.includes(pref) ? "default" : "secondary"}
                    className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                      formData.dietaryPreferences.includes(pref)
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-gray-100 hover:bg-orange-100 text-gray-700"
                    }`}
                    onClick={() => toggleDietaryPreference(pref)}
                  >
                    {pref}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mood Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Mood Preferences</h3>

              <div className="flex flex-wrap gap-2">
                {MOOD_PREFERENCES.map((pref) => (
                  <Badge
                    key={pref}
                    variant={formData.moodPreferences.includes(pref) ? "default" : "secondary"}
                    className={`cursor-pointer transition-all duration-200 px-3 py-1 ${
                      formData.moodPreferences.includes(pref)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 hover:bg-blue-100 text-gray-700"
                    }`}
                    onClick={() => toggleMoodPreference(pref)}
                  >
                    {pref}
                  </Badge>
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
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
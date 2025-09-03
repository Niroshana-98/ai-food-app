'use client'

import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

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
  status: string
  operatingHours: Record<string, OperatingHours>
}

export function EditRestaurantModal({ restaurant, isOpen, onClose, onSuccess }: EditRestaurantModalProps) {
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editLoading, setEditLoading] = useState(false)
  const { showToast } = useToast()
  const [customEditCuisine, setCustomEditCuisine] = useState("")
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
  })

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
      })
    }
  }, [restaurant])

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

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

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

  const addCustomEditCuisine = () => {
    if (customEditCuisine.trim() && !editFormData.cuisineTypes.includes(customEditCuisine.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        cuisineTypes: [...prev.cuisineTypes, customEditCuisine.trim()],
      }))
      setCustomEditCuisine("")
    }
  }

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

  const handleSaveRestaurant = async () => {
    if (!validateEditForm()) return

    setEditLoading(true)
    try {
      await api.updateRestaurant(restaurant._id, editFormData)
      showToast("Restaurant updated successfully!", "success")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating restaurant:", error)
      showToast("Failed to update restaurant. Please try again.", "error")
    } finally {
      setEditLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Edit Restaurant - {restaurant?.name}</h2>
          <p className="text-sm text-gray-600 mt-1">Update restaurant information and manage status</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Status Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Status</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Status</Label>
                <select
                  value={editFormData.status}
                  onChange={(e) => handleEditInputChange("status", e.target.value)}
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
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Restaurant Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                    className={editErrors.name ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
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
                  <Label htmlFor="edit-email" className="text-sm font-medium">
                    Email Address *
                  </Label>
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
                  <Label htmlFor="edit-website" className="text-sm font-medium">
                    Website
                  </Label>
                  <Input
                    id="edit-website"
                    value={editFormData.website}
                    onChange={(e) => handleEditInputChange("website", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-sm font-medium">
                  Full Address *
                </Label>
                <Textarea
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => handleEditInputChange("address", e.target.value)}
                  className={`min-h-[60px] resize-none ${editErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {editErrors.address && <p className="text-red-500 text-xs mt-1">{editErrors.address}</p>}
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
                      className={`cursor-pointer transition-all duration-200 px-3 py-1 ${editFormData.cuisineTypes.includes(cuisine)
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
                            className="w-24 text-sm"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <Input
                            type="time"
                            value={(hours as OperatingHours).close}
                            onChange={(e) => updateEditOperatingHours(day, "close", e.target.value)}
                            className="w-24 text-sm"
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
                onClick={handleSaveRestaurant}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={editLoading}
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
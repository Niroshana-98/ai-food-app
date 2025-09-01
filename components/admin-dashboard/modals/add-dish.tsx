'use client'

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AddDishModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddDishModal({ isOpen, onClose, onSuccess }: AddDishModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    restaurant: "",
    cuisine: "",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Dish name is required"
    if (!formData.price.trim()) newErrors.price = "Price is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"

    // Price validation
    const priceNum = parseFloat(formData.price.replace(/[^0-9.]/g, ''))
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Please enter a valid price"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      // Here you would typically call your API to add the dish
      // await api.addDish(formData)
      
      console.log("Adding dish:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess?.()
      onClose()
      
      // Reset form
      setFormData({
        name: "",
        price: "",
        description: "",
        restaurant: "",
        cuisine: "",
      })
    } catch (error) {
      console.error("Error adding dish:", error)
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      restaurant: "",
      cuisine: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add New Dish</CardTitle>
          <p className="text-sm text-gray-600">Add a new dish to the menu</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dish-name" className="text-sm font-medium">
                Dish Name *
              </Label>
              <Input
                id="dish-name"
                placeholder="Enter dish name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dish-price" className="text-sm font-medium">
                Price *
              </Label>
              <Input
                id="dish-price"
                placeholder="$0.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={errors.price ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dish-restaurant" className="text-sm font-medium">
                Restaurant
              </Label>
              <Input
                id="dish-restaurant"
                placeholder="Select or enter restaurant name"
                value={formData.restaurant}
                onChange={(e) => handleInputChange("restaurant", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dish-cuisine" className="text-sm font-medium">
                Cuisine Type
              </Label>
              <Input
                id="dish-cuisine"
                placeholder="e.g., Indian, Chinese, Italian"
                value={formData.cuisine}
                onChange={(e) => handleInputChange("cuisine", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dish-description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="dish-description"
                placeholder="Describe the dish, ingredients, and preparation style"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`min-h-[80px] resize-none ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

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
        </CardContent>
      </Card>
    </div>
  )
}
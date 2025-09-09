'use client'

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { api } from "@/lib/api"
import toast from "react-hot-toast"

interface DeleteDishModalProps {
  dish: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteDishModal({ dish, isOpen, onClose, onSuccess }: DeleteDishModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDeleteDish = async () => {
    if (!dish) return;
    const promise = api.deleteDish(dish._id);
    toast.promise(
        promise,
        {
        loading: "Deleting dish...",
        success: "Dish deleted successfully! 🎉",
        error: "Failed to delete dish. Please try again.",
        }
    );
    try {
        await promise;
        onSuccess();
        onClose();
  } catch (error) {
      console.error("Error deleting dish:", error)
      toast("Failed to delete dish. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-red-600 flex items-center">
            <Trash2 className="h-5 w-5 mr-2" />
            Delete Dish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">{dish?.name}</span>?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium text-red-800 mb-1">Warning</h4>
                  <p className="text-red-700">
                    This action cannot be undone. The dish will be permanently removed from the menu and any
                    associated order history will be affected.
                  </p>
                </div>
              </div>
            </div>

            {dish && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dish:</span>
                  <span className="font-medium">{dish.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restaurant:</span>
                  <span className="font-medium">{dish.restaurant?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">${dish.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline" className="text-xs">
                    {dish.category}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={dish.available === true ? "default" : "secondary"}>
                    {dish.available === true ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-white hover:bg-gray-50"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteDish}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Dish
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
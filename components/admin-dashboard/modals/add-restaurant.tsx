'use client'

import AddRestaurantForm from "../add-restaurant-form"

interface AddRestaurantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddRestaurantModal({ isOpen, onClose, onSuccess }: AddRestaurantModalProps) {
  if (!isOpen) return null

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Add New Restaurant</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new restaurant to the platform</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AddRestaurantForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
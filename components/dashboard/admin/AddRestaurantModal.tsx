"use client"

import AddRestaurantForm from "./addResturant"

interface AddRestaurantModalProps {
  open: boolean
  onClose: () => void
}

export default function AddRestaurantModal({ open, onClose }: AddRestaurantModalProps) {
  if (!open) return null; // Only show modal if `open = true`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
        
        
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Restaurant</h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the details to add a new restaurant to the platform
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl font-bold scale-110"
          >
            ×
          </button>
        </div>

        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AddRestaurantForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}

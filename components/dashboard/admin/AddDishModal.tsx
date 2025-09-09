"use client"

import AddDishForm from "./addDish"

interface AddDishModalProps {
  open: boolean
  onClose: () => void
}

export default function AddDishModal({ open, onClose }: AddDishModalProps) {

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Dish</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add a new dish to the menu
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
            <AddDishForm 
              onSuccess={onClose} 
              onClose={onClose} 
            />
          </div>
        </div>
      </div>
        
      
  )
}

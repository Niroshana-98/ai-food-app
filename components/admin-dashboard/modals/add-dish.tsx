'use client'

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AddDishForm from "../add-dish-form"

interface AddDishModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddDishModal({ isOpen, onClose, onSuccess }: AddDishModalProps) {
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
          <h2 className="text-xl font-bold text-gray-900">Add New Dish</h2>
          <p className="text-sm text-gray-600 mt-1">Create a new dish for one of your restaurants</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AddDishForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
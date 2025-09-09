"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"

export default function Header({ onBack, onAddRestaurant, onAddDish }: { onBack: () => void; onAddRestaurant: () => void; onAddDish: () => void }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex space-x-3">
            <Button onClick={onAddRestaurant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
            <Button variant="outline" onClick={onAddDish}>
              <Plus className="h-4 w-4 mr-2" />
              Add Dish
            </Button>
          </div>
        </div>
    </div>
  )
}

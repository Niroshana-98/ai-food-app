"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Country, State } from "country-state-city"
import {User} from "@/lib/types"

interface ViewUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ViewUserModal({ user, isOpen, onClose }: ViewUserModalProps) {
  const [countryName, setCountryName] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [formattedDate, setFormattedDate] = useState("")

  // Load country and district names when user changes
  useEffect(() => {
    if (user) {
      // Format date for display
      if (user.dateOfBirth) {
        try {
          const date = new Date(user.dateOfBirth)
          if (!isNaN(date.getTime())) {
            setFormattedDate(date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }))
          } else {
            setFormattedDate("Invalid date")
          }
        } catch (error) {
          setFormattedDate("Invalid date")
        }
      } else {
        setFormattedDate("Not provided")
      }

      // Get country name
      if (user.country) {
        try {
          const countries = Country.getAllCountries()
          const countryObj = countries.find((c) => c.isoCode === user.country)
          setCountryName(countryObj ? countryObj.name : user.country || "Not provided")
        } catch (error) {
          console.error("Error loading country:", error)
          setCountryName(user.country || "Not provided")
        }

        // Get district (state) name
        if (user.district) {
          try {
            const states = State.getStatesOfCountry(user.country)
            const stateObj = states.find((s) => s.isoCode === user.district)
            setDistrictName(stateObj ? stateObj.name : user.district || "Not provided")
          } catch (error) {
            console.error("Error loading state:", error)
            setDistrictName(user.district || "Not provided")
          }
        } else {
          setDistrictName("Not provided")
        }
      } else {
        setCountryName("Not provided")
        setDistrictName("Not provided")
      }
    }
  }, [user])

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "active":
        return "User can access all features"
      case "inactive":
        return "User account is temporarily disabled"
      case "suspended":
        return "User account is suspended due to violations"
      default:
        return "Unknown status"
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default" as const
      case "restaurant_owner":
        return "secondary" as const
      case "customer":
        return "outline" as const
      default:
        return "secondary" as const
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const
      case "suspended":
        return "destructive" as const
      case "inactive":
        return "secondary" as const
      default:
        return "secondary" as const
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">View User Profile - {user.name}</h2>
          <p className="text-sm text-gray-600 mt-1">Profile information and account details</p>
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
                  <Badge
                    variant={getStatusBadgeVariant(user.status)}
                    className="text-sm px-3 py-1"
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {getStatusDescription(user.status)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">User Role</Label>
                  <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className="text-sm px-3 py-1"
                  >
                    {user.role.replace("_", " ").charAt(0).toUpperCase() + user.role.replace("_", " ").slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Name</Label>
                  <Input
                    value={user.name || "Not provided"}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={user.email || "Not provided"}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <Input
                    value={user.phone || "Not provided"}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <Input
                    value={formattedDate}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location Information</h3>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Street Address</Label>
                <Textarea
                  value={user.address || "Not provided"}
                  disabled
                  className="min-h-[60px] resize-none bg-gray-50 border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Input
                    value={user.city || "Not provided"}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">District/State</Label>
                  <Input
                    value={districtName}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Country</Label>
                  <Input
                    value={countryName}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">ZIP/Postal Code</Label>
                  <Input
                    value={user.zipCode || "Not provided"}
                    disabled
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Country, State, City } from "country-state-city"
import toast from "react-hot-toast"
import type { SingleValue, ActionMeta } from "react-select"

const Select = dynamic(() => import("react-select"), { ssr: false })

interface UserProfile {
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  address?: string
  country?: string
  district?: string
  city?: string
  zipCode?: string
}

type SelectOption = { value: string; label: string }

function formatDateForInput(date?: string | Date): string {
  if (!date) return ""
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ""
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

export default function UserProfileForm() {
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    country: "",
    district: "",
    city: "",
    zipCode: "",
  })

  const [allCountries, setAllCountries] = useState<SelectOption[]>([])
  const [allDistricts, setAllDistricts] = useState<SelectOption[]>([])
  const [allCities, setAllCities] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        if (!res.ok) {
          if (res.status === 404) {
            setInitialLoad(false)
            return
          }
          throw new Error("Failed to load profile")
        }
        const data = await res.json()
        setUser(prevUser => ({
          ...prevUser,
          ...data,
          dateOfBirth: formatDateForInput(data.dateOfBirth),
        }))
      } catch (error: any) {
        console.error("Profile fetch error:", error)
        toast.error(error.message || "Could not load profile")
      } finally {
        setInitialLoad(false)
      }
    }
    fetchProfile()
  }, [])

  // Load countries
  useEffect(() => {
    try {
      const countries = Country.getAllCountries()
      setAllCountries(
        countries.map((c) => ({
          value: c.isoCode,
          label: c.name,
        }))
      )
    } catch (error) {
      console.error("Error loading countries:", error)
      toast.error("Failed to load countries")
    }
  }, [])

  // Update districts when country changes
  useEffect(() => {
    if (!initialLoad && user.country) {
      try {
        const districts = State.getStatesOfCountry(user.country).map((s) => ({
          value: s.isoCode,
          label: s.name,
        }))
        setAllDistricts(districts)

        if (user.district && !districts.find((d) => d.value === user.district)) {
          setUser((prev) => ({ ...prev, district: "", city: "" }))
        }
      } catch (error) {
        console.error("Error loading states:", error)
        setAllDistricts([])
      }
    } else if (!user.country) {
      setAllDistricts([])
      if (!initialLoad) {
        setUser((prev) => ({ ...prev, district: "", city: "" }))
      }
    }
  }, [user.country, initialLoad])

  // Update cities when district changes
  useEffect(() => {
    if (!initialLoad && user.country && user.district) {
      try {
        const cities = City.getCitiesOfState(user.country, user.district).map((c) => ({
          value: c.name,
          label: c.name,
        }))
        setAllCities(cities)

        if (user.city && !cities.find((c) => c.value === user.city)) {
          setUser((prev) => ({ ...prev, city: "" }))
        }
      } catch (error) {
        console.error("Error loading cities:", error)
        setAllCities([])
      }
    } else if (!user.country || !user.district) {
      setAllCities([])
      if (!initialLoad) {
        setUser((prev) => ({ ...prev, city: "" }))
      }
    }
  }, [user.district, user.country, initialLoad])

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (
    field: keyof UserProfile
  ) => (
    option: SingleValue<SelectOption>,
    _: ActionMeta<SelectOption>
  ) => {
    handleInputChange(field, option?.value || "")
  }

  const validateForm = (): boolean => {
    if (!user.name.trim()) {
      toast.error("Name is required")
      return false
    }
    if (!user.email.trim()) {
      toast.error("Email is required")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      toast.success("Profile updated successfully 🎉")
      setUser(prevUser => ({
        ...prevUser,
        ...data,
        dateOfBirth: formatDateForInput(data.dateOfBirth),
      }))
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form or navigate away
    window.location.reload()
  }

  if (initialLoad) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6 mt-12"
    >
      <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
      <p className="text-gray-500">Update your personal information and address details</p>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="mb-2">Full Name</Label>
          <Input
            id="name"
            value={user.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <Label htmlFor="email" className="mb-2">Email</Label>
          <Input 
            id="email"
            value={user.email} 
            disabled 
            className="bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2">Phone</Label>
          <Input
            id="phone"
            value={user.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth" className="mb-2">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={user.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address" className="mb-2">Street Address</Label>
        <Textarea
          id="address"
          value={user.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Street, apartment, suite, etc."
        />
      </div>

      {/* Location */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="mb-2">Country</Label>
          <Select
            options={allCountries}
            value={allCountries.find((c) => c.value === user.country) || null}
            onChange={handleSelectChange("country")}
            placeholder="Select country..."
            isSearchable
          />
        </div>
        <div>
          <Label className="mb-2">State / Province</Label>
          <Select
            options={allDistricts}
            value={allDistricts.find((s) => s.value === user.district) || null}
            onChange={handleSelectChange("district")}
            placeholder="Select state..."
            isDisabled={!user.country}
            isSearchable
          />
        </div>
        <div>
          <Label className="mb-2">City</Label>
          <Select
            options={allCities}
            value={allCities.find((c) => c.value === user.city) || null}
            onChange={handleSelectChange("city")}
            placeholder="Select city..."
            isDisabled={!user.district}
            isSearchable
          />
        </div>
      </div>

      <div>
        <Label htmlFor="zipCode" className="mb-2">ZIP / Postal Code</Label>
        <Input
          id="zipCode"
          value={user.zipCode}
          onChange={(e) => handleInputChange("zipCode", e.target.value)}
          placeholder="Enter ZIP code"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  )
}
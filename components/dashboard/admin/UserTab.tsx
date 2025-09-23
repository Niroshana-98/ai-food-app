"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search, Eye } from "lucide-react"
import type { User } from "@/lib/types"


interface UsersTabProps {
  users: User[]
  loading: boolean
  handleEditUser: (user: User) => void
  openDeleteConfirmation: (user: User) => void
  onUserDeleted: (userId: string) => void
}

export default function UsersTab({
  users,
  loading,
  handleEditUser,
  openDeleteConfirmation,
  onUserDeleted,
}: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter users by name or email
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const lowerQuery = searchQuery.toLowerCase()
    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(lowerQuery) ||
        user.name?.toLowerCase().includes(lowerQuery)
      )
    })
  }, [searchQuery, users])

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* User list */}
      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:bg-gray-100 hover:scale-101"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{user.name || "Unnamed User"}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge
                  variant={
                    user.role === "admin"
                      ? "default"
                      : user.role === "restaurant_owner"
                      ? "secondary"
                      : "outline"
                  }
                  className="rounded-full pb-1"
                >
                  {user.role}
                </Badge>
                {user.createdAt && (
                  <span className="text-sm text-gray-600">
                    Joined on {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-black hover:text-white"
                onClick={() => handleEditUser(user)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-black hover:text-white"
                onClick={() => openDeleteConfirmation(user)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

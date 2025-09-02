'use client'

import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return <AdminDashboard onBack={() => window.history.back()} />
}

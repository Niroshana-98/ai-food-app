"use client";
import { UserDashboard } from "@/components/user-dashboard";

export default function CustomerDashboard() {
  return (
    <div className="p-6">
      <UserDashboard onBack={() => window.history.back()}/>
    </div>
  );
}

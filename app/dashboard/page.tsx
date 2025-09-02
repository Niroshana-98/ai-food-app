// app/dashboard/page.tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardEntry() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const role = user.publicMetadata?.role || "customer";

    if (role === "admin") {
      router.replace("/dashboard/admin");
    } else if (role === "owner") {
      router.replace("/dashboard/owner");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [user, router]);

  return <p>Loading your dashboard...</p>;
}

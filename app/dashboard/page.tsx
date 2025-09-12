"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DashboardEntry() {
  const { user } = useUser();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          return 100;
        }
        return old + 20;
      });
    }, 80);

    // Redirect after animation
    const timeout = setTimeout(() => {
      const role = user.publicMetadata?.role || "customer";

      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "owner") {
        router.replace("/dashboard/owner");
      } else {
        router.replace("/dashboard/customer");
      }
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-80 max-w-md text-center">
        <motion.p
          className="mb-6 text-lg font-semibold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading your dashboard...
        </motion.p>

        <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-3 bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}

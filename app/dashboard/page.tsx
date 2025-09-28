"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
        return old + 10;
      });
    }, 120);

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
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="w-96 shadow-xl rounded-2xl border border-orange-200">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            {/* Loading spinner */}
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />

            {/* Loading text */}
            <motion.p
              className="text-lg font-semibold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Preparing your dashboard...
            </motion.p>

            {/* Progress bar */}
            <Progress value={progress} className="w-full h-3" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function AuthHandler() {
  const { user } = useUser();

  useEffect(() => {
    const registerOrLogin = async () => {
      if (!user) return;

      try {
        // Call signup to ensure the user exists in your DB
        const signupRes = await fetch("/api/auth/signup", { method: "POST" });

        if (!signupRes.ok) {
          const errMsg = await signupRes.text();
          console.error("Signup failed:", signupRes.status, errMsg);
          return;
        }

        // Fetch MongoDB user details
        const signinRes = await fetch("/api/auth/signin");

        if (signinRes.ok) {
          const data = await signinRes.json();
          console.log("Logged in user:", data);
        } else {
          const errMsg = await signinRes.text();
          console.error("Failed to fetch user:", signinRes.status, errMsg);
        }
      } catch (err) {
        console.error("AuthHandler error:", err);
      }
    };

    registerOrLogin();
  }, [user]);

  return null; // No UI, just runs logic
}

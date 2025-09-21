'use client';

import { ChefHat } from 'lucide-react';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function Navbar() {
  const { user, isSignedIn } = useUser();

  const role = user?.publicMetadata?.role;

  return (
    <nav className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b">
      <div className="flex items-center space-x-2">
        <ChefHat className="h-8 w-8 text-orange-600" />
        <Link href="/" className="text-lg font-semibold">
          <span className="text-2xl font-bold text-gray-900">{siteConfig.name}</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {isSignedIn ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>

            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>

            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <Button variant="ghost">Login</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
          </>
        )}
      </div>
    </nav>
  );
}

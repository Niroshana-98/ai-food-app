'use client';

import { ChefHat, ShoppingCart } from 'lucide-react';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const role = user?.publicMetadata?.role;
  
  const [cartItems, setCartItems] = useState(0);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 300);
    };

  }, []);

  const handleCartClick = () => {
    // Add cart click animation
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-6 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center space-x-2 group">
        <div className="transform transition-transform duration-300 group-hover:rotate-12">
          <ChefHat className="h-8 w-8 text-orange-600 transition-colors duration-300 group-hover:text-orange-700" />
        </div>
        <Link href="/" className="text-lg font-semibold">
          <span className="text-2xl font-bold text-gray-900 transition-colors duration-300 hover:text-orange-600">
            {siteConfig.name}
          </span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {isSignedIn ? (
          <>
            {/* Dashboard Link */}
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className="relative overflow-hidden transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
              >
                Dashboard
              </Button>
            </Link>

            {/* Profile Link */}
            <Link href="/profile">
              <Button 
                variant="ghost"
                className="relative overflow-hidden transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
              >
                Profile
              </Button>
            </Link>

            {/* Cart Button with Animation */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCartClick}
                className={`relative p-2 transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 hover:scale-110 ${
                  cartBounce ? 'animate-bounce' : ''
                }`}
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 transition-transform duration-200" />
                  
                  {/* Cart item count badge */}
                  {cartItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-bold bg-orange-500 hover:bg-orange-600 border-2 border-white animate-pulse"
                    >
                      {cartItems > 99 ? '99+' : cartItems}
                    </Badge>
                  )}
                  
                  <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 transition-opacity duration-300 hover:opacity-20 blur-md"></div>
                </div>
              </Button>
            </Link>

            {/* User Button */}
            <div className="ml-2">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 transition-transform duration-300 hover:scale-110"
                  }
                }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCartClick}
                className={`relative p-2 transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 hover:scale-110 ${
                  cartBounce ? 'animate-bounce' : ''
                }`}
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 transition-transform duration-200" />
                  
                  {cartItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-bold bg-orange-500 hover:bg-orange-600 border-2 border-white animate-pulse"
                    >
                      {cartItems > 99 ? '99+' : cartItems}
                    </Badge>
                  )}
                </div>
              </Button>
            </Link>

            {/* Sign In Button */}
            <SignInButton mode="modal">
              <Button 
                variant="ghost"
                className="transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
              >
                Login
              </Button>
            </SignInButton>

            {/* Sign Up Button */}
            <SignUpButton mode="modal">
              <Button className="bg-orange-600 hover:bg-orange-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Sign Up
              </Button>
            </SignUpButton>
          </>
        )}
      </div>
    </nav>
  );
}
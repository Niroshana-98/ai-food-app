"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Clock,
  MapPin,
  CreditCard,
  Tag,
  CheckCircle,
  Home,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getDistanceKm, calculateDeliveryFee } from "@/lib/distance";
import { useRouter } from "next/navigation";

export default function ModernCartPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setAppliedPromo({ code: "SAVE10", discount: 0.1, description: "10% off your order" });
    } else {
      setAppliedPromo(null);
    }
  };

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const total = subtotal - discount + deliveryFee;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const avgPreparationTime = cart.length > 0
    ? Math.ceil(cart.reduce((sum, item) => sum + (item.preparationTime || 15), 0) / cart.length)
    : 15;


  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch logged-in user’s profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const [savedAddresses, setSavedAddresses] = useState<string[]>(() => {
    const saved = localStorage.getItem("addresses");
    return saved ? JSON.parse(saved) : [];
  });

  const saveAddress = () => {
    if (manualAddress && !savedAddresses.includes(manualAddress)) {
      const updated = [...savedAddresses, manualAddress];
      setSavedAddresses(updated);
      localStorage.setItem("addresses", JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (cart.length === 0 || !customerLocation) return;

    const restaurant = cart[0].restaurantLocation || { lat: 6.9271, lng: 79.8612 }; // fallback Colombo

    getDistanceKm(restaurant, customerLocation).then((distance) => {
      setDistanceKm(distance);
      const fee = calculateDeliveryFee(distance);
      setDeliveryFee(fee);
    });
  }, [cart, customerLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      return;
    }

  navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        // fallback location if user denies permission
        setCustomerLocation({ lat: 6.9271, lng: 79.8612 }); // Colombo
      }
    );
  }, []);

  const handleManualLocation = async () => {
    if (!manualAddress) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setCustomerLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      } else {
        alert("Address not found, please enter a valid location.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button className="p-2 hover:bg-white/80 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any delicious items to your cart yet.
              Start exploring our amazing restaurants and dishes!
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main cart UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/80 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-gray-600">
                {totalItems} items • Estimated {avgPreparationTime}min prep time
              </p>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors text-sm font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image || "/api/placeholder/120/120"}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.restaurantName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </span>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-orange-600 text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center hover:bg-orange-700 transform hover:scale-105"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Preparation Time */}
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{item.preparationTime || 15} min prep time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
          </div>

          

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-600" />
                Promo Code
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>{appliedPromo.description}</span>
                </div>
              )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3">Contact Details</h2>
        {loadingProfile ? (
          <p className="text-gray-500">Loading...</p>
        ) : user ? (
          <div className="space-y-1 text-sm text-gray-700">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Phone:</span> {user.phone || "Not provided"}</p>
            <p><span className="font-medium">Email:</span> {user.email || "Not provided"}</p>
            <p><span className="font-medium">Address:</span> {user.address || "Not provided"}</p>
          </div>
        ) : (
          <p className="text-red-500">Could not load profile details.</p>
        )}
      </div>

            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-orange-600" />
                  Saved Addresses
                </h3>
                <ul className="space-y-2">
                  {savedAddresses.map((addr, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => setManualAddress(addr)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 transition"
                      >
                        {addr}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your delivery address:
              </label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="City, Street, Zip"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleManualLocation}
                className="mt-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Set Location
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span
                    className={`font-semibold ${
                      deliveryFee === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {deliveryFee === 0
                      ? "FREE"
                      : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {subtotal <= 50 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-700 text-xs">
                      Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-lg p-3 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Estimated delivery: {avgPreparationTime + 15}-
                    {avgPreparationTime + 25} min
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Delivering to your location
                    {distanceKm !== null && ` • ${distanceKm.toFixed(1)} km away`}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg mt-6 flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => router.push("/checkout")}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span>Secure checkout with 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

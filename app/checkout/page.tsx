"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Calendar,
  Edit3,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DeliveryInfo {
  address: string;
  phone: string;
  email: string;
  name: string;
  instructions?: string;
}

interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  estimatedTime: string;
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: "",
    phone: "",
    email: "",
    name: "",
    instructions: "",
  });
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    estimatedTime: "30-45 min",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);

  // Load user data and calculate order summary
  useEffect(() => {
    // Calculate order summary
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 50 ? 0 : 4.99; // Free delivery over $50
    const discount = 0; // Add promo code logic here
    const total = subtotal + deliveryFee - discount;

    setOrderSummary({
      subtotal,
      deliveryFee,
      discount,
      total,
      estimatedTime: "30-45 min", // Calculate based on preparation times
    });

    // Load user profile
    fetchUserProfile();
    loadSavedAddresses();
  }, [cart]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const userData = await response.json();
        setDeliveryInfo({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          instructions: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const loadSavedAddresses = () => {
    const saved = localStorage.getItem("addresses");
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  };

  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      setPaymentError("Please fill in all required delivery information.");
      return false;
    }

    if (paymentMethod === "card" && !stripe) {
      setPaymentError("Payment system is not ready. Please try again.");
      return false;
    }

    return true;
  };

  const createOrder = async () => {
    try {
      const orderData = {
        items: cart.map(item => ({
          dishId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
        deliveryInfo,
        orderSummary,
        paymentMethod,
        status: paymentMethod === "cash" ? "confirmed" : "pending_payment",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsProcessing(true);
  setPaymentError(null);

  try {
    console.log('Creating order...'); // Debug log

    // Create order first
    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(item => ({
          dishId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
        deliveryInfo,
        orderSummary,
        paymentMethod,
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.message || "Failed to create order");
    }

    const orderData = await orderResponse.json();
    console.log('Order created:', orderData); // Debug log

    if (!orderData.success || !orderData.orderId) {
      throw new Error("Invalid order response");
    }

    if (paymentMethod === "cash") {
      // For cash on delivery, redirect immediately
      console.log('Cash payment - redirecting to success page'); // Debug log
      clearCart();
      router.push(`/order-success?orderId=${orderData.orderId}`);
      return;
    }

    // Handle card payment with Stripe
    console.log('Processing card payment...'); // Debug log

    if (!stripe || !elements) {
      throw new Error("Stripe is not initialized");
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      throw new Error("Card element not found");
    }

    // Create payment intent
    const paymentResponse = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(orderSummary.total * 100), // Convert to cents
        orderId: orderData.orderId,
        currency: "usd",
      }),
    });

    if (!paymentResponse.ok) {
      throw new Error("Failed to create payment intent");
    }

    const { clientSecret } = await paymentResponse.json();
    console.log('Payment intent created'); // Debug log

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: deliveryInfo.name,
          email: deliveryInfo.email,
          phone: deliveryInfo.phone,
          address: {
            line1: deliveryInfo.address,
          },
        },
      },
    });

    if (error) {
      console.error('Payment error:', error); // Debug log
      if (error instanceof Error) {
        setPaymentError(
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again."
        );
      } else {
        setPaymentError("Payment failed. Please try again.");
      }
      return;
    }

    if (paymentIntent.status === "succeeded") {
      console.log('Payment succeeded, updating order status...'); // Debug log

      // Update order status
      const updateResponse = await fetch(`/api/orders/${orderData.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmed",
          paymentStatus: "paid",
          paymentIntentId: paymentIntent.id,
        }),
      });

      if (!updateResponse.ok) {
        console.error("Failed to update order status");
        // Still redirect even if update fails
      }

      clearCart();
      console.log('Redirecting to success page with orderId:', orderData.orderId); // Debug log
      router.push(`/order-success?orderId=${orderData.orderId}`);
    }
  } catch (error) {
    console.error("Payment error:", error);
    setPaymentError(
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: string }).message)
        : "Payment failed. Please try again."
    );
  } finally {
    setIsProcessing(false);
  }
};

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart first</p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/80 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Review your order and complete payment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Delivery & Payment */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Delivery Information
              </h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={deliveryInfo.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={deliveryInfo.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={deliveryInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Saved addresses:</p>
                      <div className="space-y-1">
                        {savedAddresses.map((address, index) => (
                          <button
                            key={index}
                            onClick={() => handleInputChange("address", address)}
                            className="block w-full text-left text-sm p-2 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            {address}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInfo.instructions}
                    onChange={(e) => handleInputChange("instructions", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Any special instructions for the delivery driver..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                Payment Method
              </h3>

              <div className="space-y-4">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "card"
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium">Card Payment</p>
                    <p className="text-sm text-gray-500">Pay now with card</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "cash"
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when delivered</p>
                  </button>
                </div>

                {/* Stripe Card Element */}
                {paymentMethod === "card" && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Details
                    </label>
                    <div className="border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#424770",
                              "::placeholder": {
                                color: "#aab7c4",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image || "/api/placeholder/48/48"}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.restaurantName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${orderSummary.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className={`font-medium ${orderSummary.deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {orderSummary.deliveryFee === 0 ? "FREE" : `$${orderSummary.deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-600">${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Estimated delivery: {orderSummary.estimatedTime}</span>
                </div>
              </div>

              {/* Error Message */}
              {paymentError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <form onSubmit={handlePayment}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      {paymentMethod === "cash" ? "Place Order" : `Pay $${orderSummary.total.toFixed(2)}`}
                    </>
                  )}
                </button>
              </form>

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
};

// Main component with Stripe Elements wrapper
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
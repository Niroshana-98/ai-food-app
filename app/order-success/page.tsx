"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Package,
  CreditCard,
  ArrowRight,
  Download,
  Share2,
  Home,
  Star,
  MessageCircle,
  Truck,
  ChefHat,
  Receipt,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface DeliveryInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  instructions?: string;
}

interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  estimatedTime: string;
}

interface OrderDetails {
  orderId: string;
  userId?: string;
  items: OrderItem[];
  deliveryInfo: DeliveryInfo;
  orderSummary: OrderSummary;
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  notes?: string;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId");
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    fetchOrderDetails();
    
    // Turn off confetti after animation
    setTimeout(() => setConfetti(false), 3000);
  }, [orderId]);

  // Simulate order progress based on status
  useEffect(() => {
    if (orderDetails) {
      const statusMap: Record<OrderDetails["status"], number> = {
        'pending_payment': 1,
        'confirmed': 1,
        'preparing': 2,
        'out_for_delivery': 3,
        'delivered': 4,
        'cancelled': 0
      };
      setCurrentStep(statusMap[orderDetails.status]);
    }
  }, [orderDetails]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      console.log('Fetching order details for:', orderId);
      
      const response = await fetch(`/api/orders/${orderId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Order not found");
        } else {
          setError("Failed to load order details");
        }
        return;
      }

      const data = await response.json();
      console.log('Order data received:', data);
      
      if (data.success && data.order) {
        setOrderDetails(data.order);
      } else {
        setError(data.message || "Failed to load order");
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'preparing':
        return 'text-green-600 bg-green-50';
      case 'out_for_delivery':
        return 'text-blue-600 bg-blue-50';
      case 'delivered':
        return 'text-emerald-600 bg-emerald-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pending Payment';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Being Prepared';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  const orderSteps = [
    { icon: CheckCircle, label: "Order Confirmed", status: "completed" },
    { icon: ChefHat, label: "Preparing", status: currentStep >= 2 ? "active" : "pending" },
    { icon: Truck, label: "On the Way", status: currentStep >= 3 ? "active" : "pending" },
    { icon: Package, label: "Delivered", status: currentStep >= 4 ? "active" : "pending" }
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Order Details</h2>
          <p className="text-gray-600">Please wait while we fetch your order information...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-2">
            {error === "Order not found" 
              ? "We couldn't find an order with this ID. Please check your order number and try again."
              : error || "Something went wrong while loading your order details."
            }
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-8">Order ID: {orderId}</p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Orders
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Confetti Effect */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="text-yellow-400 h-4 w-4" />
            </div>
          ))}
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-500">
              <CheckCircle className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-2xl text-gray-700 mb-6">
            Thank you, <span className="font-semibold text-green-600">{orderDetails.deliveryInfo.name}</span>!
          </p>
          <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-lg border border-green-100">
            <Package className="h-6 w-6 text-green-600" />
            <span className="font-bold text-gray-900 text-lg">#{orderDetails.orderId}</span>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
          <h3 className="text-2xl font-bold mb-8 text-center text-gray-900">Order Status</h3>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            {orderSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex flex-col items-center z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                    step.status === 'completed' 
                      ? 'bg-green-500 text-white scale-110 shadow-lg' 
                      : step.status === 'active'
                      ? 'bg-emerald-500 text-white scale-110 shadow-lg animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium text-center ${
                    step.status === 'completed' || step.status === 'active' 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Current Status */}
          <div className="mt-8 text-center">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border ${getStatusColor(orderDetails.status)}`}>
              <div className={`inline-flex items-center gap-2 font-semibold`}>
                <span>Current Status: {getStatusText(orderDetails.status)}</span>
              </div>
            </div>
            {orderDetails.estimatedDeliveryTime && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Estimated delivery: {formatTime(orderDetails.estimatedDeliveryTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="xl:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-100">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Receipt className="h-6 w-6 text-green-600" />
                Your Order
              </h3>
              
              <div className="space-y-6">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors duration-300">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                      <p className="text-gray-600 mb-1">{item.restaurantName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">${orderDetails.orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-green-600">
                      {orderDetails.orderSummary.deliveryFee === 0 ? "FREE" : `$${orderDetails.orderSummary.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {orderDetails.orderSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-${orderDetails.orderSummary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-green-300 pt-3">
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-green-600">${orderDetails.orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium capitalize">{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${
                      orderDetails.paymentStatus === 'paid' ? 'text-green-600' : 
                      orderDetails.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {orderDetails.paymentStatus === 'paid' ? 'Paid' :
                       orderDetails.paymentStatus === 'failed' ? 'Failed' :
                       orderDetails.paymentMethod === 'cash' ? 'Pay on Delivery' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {formatDate(orderDetails.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placed</span>
                    <span className="font-medium">{formatTime(orderDetails.createdAt)}</span>
                  </div>
                  {orderDetails.estimatedDeliveryTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated</span>
                      <span className="font-medium text-green-600">
                        {formatTime(orderDetails.estimatedDeliveryTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Delivery Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{orderDetails.deliveryInfo.name}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{orderDetails.deliveryInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{orderDetails.deliveryInfo.phone}</p>
                </div>

                {orderDetails.deliveryInfo.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-gray-700 font-medium">{orderDetails.deliveryInfo.email}</p>
                  </div>
                )}

                {orderDetails.deliveryInfo.instructions && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Special Instructions:</p>
                    <p className="text-blue-700 text-sm">{orderDetails.deliveryInfo.instructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => router.push(`/track-order?orderId=${orderDetails.orderId}`)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  Track Order
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button 
                  onClick={() => window.print()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Receipt
                </button>

                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Support
                </button>

                <button 
                  onClick={() => router.push("/")}
                  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Home className="h-5 w-5" />
                  Order Again
                </button>
              </div>
            </div>

            {/* Rating Request */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Rate Your Experience
              </h4>
              <p className="text-yellow-700 text-sm mb-4">
                How was your order? Your feedback helps us improve!
              </p>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="text-yellow-400 hover:text-yellow-500 transition-colors">
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
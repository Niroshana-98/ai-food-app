'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  MapPin, 
  Repeat, 
  Package, 
  CreditCard, 
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  Phone,
  Mail,
  Edit,
  Loader2
} from 'lucide-react'
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    restaurantName: string;
  }>;
  orderSummary: {
    total: number;
    subtotal: number;
    deliveryFee: number;
  };
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveryInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface UserDashboardProps {
  onBack: () => void
}

export function UserDashboard({ onBack }: UserDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("orders");
  const router = useRouter();

  // Fetch user orders and profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersResponse = await fetch('/api/orders');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success) {
            setOrders(ordersData.orders || []);
          }
        }

        // Fetch user profile
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.orderSummary.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const recentOrders = orders.slice(0, 5);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const handleOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleReorder = (order: Order) => {
    // You can implement reorder functionality here
    console.log('Reordering:', order.orderId);
    // Navigate to restaurant page or add items to cart
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b p-6">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <Card className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {userProfile?.name || 'Food Lover'}!
              </h2>
              <p className="text-orange-100 mb-4">
                {totalOrders > 0 
                  ? `You've ordered ${totalOrders} times and spent $${totalSpent.toFixed(2)} on delicious food!`
                  : "Ready to discover your next favorite dish?"
                }
              </p>
              <Button 
                className="bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => window.location.href = '/'}
              >
                Order Now
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order</p>
                    <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => 
                        new Date(order.createdAt).getMonth() === new Date().getMonth()
                      ).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-red-600">{error}</p>
                  </CardContent>
                </Card>
              )}

              {recentOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">Start by ordering your first meal!</p>
                    <Button 
                      onClick={() => window.location.href = '/'}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Browse Restaurants
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                recentOrders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {formatStatus(order.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.quantity}x {item.name} 
                                  <span className="text-gray-500 ml-2">from {item.restaurantName}</span>
                                </span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-1" />
                              <span className="capitalize">{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{order.deliveryInfo.address.substring(0, 30)}...</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-0 sm:ml-6 mt-4 sm:mt-0 w-full sm:w-auto">
                          <div className="text-xl sm:text-2xl font-bold mb-3">
                            ${order.orderSummary.total.toFixed(2)}
                          </div>
                          <div className="flex sm:flex-col gap-2">
                            <Button 
                              onClick={() => router.push(`/order-success?orderId=${order.orderId}`)}
                              variant="outline" 
                              size="sm"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              View Order Details
                            </Button>
                            {/*
                            {order.status === 'delivered' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReorder(order)}
                                className="flex-1 sm:flex-none"
                              >
                                <Repeat className="h-4 w-4 mr-2" />
                                Reorder
                              </Button>
                            )}
                              */}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {orders.length > 5 && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/orders'}
                    >
                      View All Orders ({orders.length})
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Name</label>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-1">
                            <span>{userProfile.name}</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-1">
                            <span>{userProfile.email}</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-1">
                            <span>{userProfile.phone || 'Not provided'}</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600">Address</label>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-1">
                            <span>{userProfile.address || 'Not provided'}</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Could not load profile information</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/'}
                    >
                      <ShoppingCart className="h-6 w-6 mb-2" />
                      Order Food
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/orders'}
                    >
                      <Package className="h-6 w-6 mb-2" />
                      All Orders
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/cart'}
                    >
                      <ShoppingCart className="h-6 w-6 mb-2" />
                      View Cart
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/support'}
                    >
                      <Phone className="h-6 w-6 mb-2" />
                      Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Details Popup/Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
                <p className="text-gray-600">#{selectedOrder.orderId}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeOrderDetails}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Order Status */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-sm px-3 py-1`}>
                    {formatStatus(selectedOrder.status)}
                  </Badge>
                  <span className="text-gray-600">
                    Ordered on {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      {/* Item Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <img
                          src={`/api/placeholder/80/80`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full bg-orange-100 rounded-xl items-center justify-center hidden">
                          <Package className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.restaurantName}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} each
                            </span>
                            <span className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${selectedOrder.orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>
                      {selectedOrder.orderSummary.deliveryFee === 0 
                        ? 'FREE' 
                        : `${selectedOrder.orderSummary.deliveryFee.toFixed(2)}`
                      }
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">${selectedOrder.orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedOrder.deliveryInfo.name}</p>
                      <p className="text-gray-600">{selectedOrder.deliveryInfo.address}</p>
                      <p className="text-gray-600">{selectedOrder.deliveryInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium capitalize">{selectedOrder.paymentMethod} Payment</p>
                      <p className="text-sm text-gray-600 capitalize">
                        Status: {selectedOrder.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {selectedOrder.status === 'delivered' && (
                  <Button 
                    onClick={() => {
                      handleReorder(selectedOrder);
                      closeOrderDetails();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 flex-1"
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={closeOrderDetails}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"use client";

import { useState, useEffect } from "react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Phone, 
  CreditCard, 
  Package,
  ChefHat,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';

interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId?: string;
  items: OrderItem[];
  deliveryInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    instructions?: string;
  };
  orderSummary: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    estimatedTime: string;
  };
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
}

export default function OrderTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchAllOrders(); // Refresh orders
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <CreditCard className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const handleOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAllOrders} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p className="font-medium text-gray-900">{order.deliveryInfo.name}</p>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.deliveryInfo.phone}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.deliveryInfo.address.substring(0, 50)}...
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name} from {item.restaurantName}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {order.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="font-bold text-xl text-gray-900 mb-2">
                    ${order.orderSummary.total.toFixed(2)}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>

                    {/* Status Action Buttons */}
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.orderId, 'out_for_delivery')}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Out for Delivery
                      </Button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.orderId, 'delivered')}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-gray-600">#{selectedOrder.orderId}</p>
              </div>
              <Button variant="ghost" onClick={closeOrderDetails}>
                ✕
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><strong>Name:</strong> {selectedOrder.deliveryInfo.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.deliveryInfo.phone}</p>
                  {selectedOrder.deliveryInfo.email && (
                    <p><strong>Email:</strong> {selectedOrder.deliveryInfo.email}</p>
                  )}
                  <p><strong>Address:</strong> {selectedOrder.deliveryInfo.address}</p>
                  {selectedOrder.deliveryInfo.instructions && (
                    <p><strong>Instructions:</strong> {selectedOrder.deliveryInfo.instructions}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.restaurantName}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${selectedOrder.orderSummary.deliveryFee.toFixed(2)}</span>
                  </div>
                  {selectedOrder.orderSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${selectedOrder.orderSummary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedOrder.orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Status Management</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'confirmed' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'confirmed')}
                  >
                    Confirmed
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'preparing' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'preparing')}
                  >
                    Preparing
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'out_for_delivery' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'out_for_delivery')}
                  >
                    Out for Delivery
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'delivered')}
                  >
                    Delivered
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <Button onClick={closeOrderDetails} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
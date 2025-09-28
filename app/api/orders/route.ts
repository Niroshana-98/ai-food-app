import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';
import { nanoid } from 'nanoid';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    const orderData = await request.json();

    console.log('Creating order with data:', orderData); 

    // Generate unique order ID
    const orderId = `ORDER-${nanoid(10)}`;

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

    // FIXED: Proper status logic
    const initialStatus = orderData.paymentMethod === 'cash' ? 'confirmed' : 'pending_payment';
    const initialPaymentStatus = orderData.paymentMethod === 'cash' ? 'pending' : 'pending'; // Cash will be paid on delivery

    const order = new Order({
      ...orderData,
      orderId,
      userId,
      estimatedDeliveryTime,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
    });

    const savedOrder = await order.save();
    console.log('Order saved:', savedOrder.orderId, 'Status:', savedOrder.status); 

    return NextResponse.json({
      success: true,
      orderId: savedOrder.orderId,
      order: savedOrder.toObject(),
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);

    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: errorMessage },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if user is admin (you can implement your own admin check logic)
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query based on filters
    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }

    // Fetch orders with pagination and populate any references if needed
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$orderSummary.total" }
        }
      }
    ]);

    const orderStats = {
      total: totalOrders,
      pending: stats.find(s => s._id === 'pending_payment')?.count || 0,
      confirmed: stats.find(s => s._id === 'confirmed')?.count || 0,
      preparing: stats.find(s => s._id === 'preparing')?.count || 0,
      outForDelivery: stats.find(s => s._id === 'out_for_delivery')?.count || 0,
      delivered: stats.find(s => s._id === 'delivered')?.count || 0,
      cancelled: stats.find(s => s._id === 'cancelled')?.count || 0,
      totalRevenue: stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
    };

    return NextResponse.json({
      success: true,
      orders,
      stats: orderStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: skip + orders.length < totalOrders
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: errorMessage },
      { status: 500 }
    );
  }
}

// Update order status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, status, notes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: any = { 
      status,
      updatedAt: new Date()
    };

    // Add delivery time if marking as delivered
    if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order.toObject(),
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);

    return NextResponse.json(
      { success: false, message: 'Failed to update order', error: errorMessage },
      { status: 500 }
    );
  }
}

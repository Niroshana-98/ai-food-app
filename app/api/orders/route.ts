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
    
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    console.log('GET request - userId:', userId, 'orderId:', orderId); 

    let query = {};
    if (orderId) {
      query = { orderId };
    } else if (userId) {
      query = { userId };
    } else {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    console.log('Found orders:', orders.length); 

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: errorMessage },
      { status: 500 }
    );
  }
}

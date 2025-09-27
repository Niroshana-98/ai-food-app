import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();
    
    console.log('Fetching order with orderId:', params.orderId); 
    
    const order = await Order.findOne({ orderId: params.orderId });
    
    if (!order) {
      console.log('Order not found for orderId:', params.orderId); 
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('Order found:', order.orderId, 'Status:', order.status, 'Payment:', order.paymentStatus); 

    return NextResponse.json({
      success: true,
      order: order.toObject(),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch order', 
        error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    console.log('Updating order:', params.orderId, 'with:', updateData); 
    
    const order = await Order.findOneAndUpdate(
      { orderId: params.orderId },
      { $set: updateData },
      { new: true }
    );
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('Order updated:', order.orderId, 'New status:', order.status); 

    return NextResponse.json({
      success: true,
      order: order.toObject(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update order', 
        error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
      },
      { status: 500 }
    );
  }
}

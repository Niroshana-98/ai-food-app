import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { success: false, message: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await Order.findOneAndUpdate(
            { orderId },
            { 
              $set: { 
                paymentStatus: 'paid',
                status: 'confirmed',
                paymentIntentId: paymentIntent.id,
              }
            }
          );
          console.log(`Payment succeeded for order: ${orderId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        const failedOrderId = failedPayment.metadata.orderId;
        
        if (failedOrderId) {
          await Order.findOneAndUpdate(
            { orderId: failedOrderId },
            { $set: { paymentStatus: 'failed' }}
          );
          console.log(`Payment failed for order: ${failedOrderId}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
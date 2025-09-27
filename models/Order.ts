import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface IDeliveryInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  instructions?: string;
}

export interface IOrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  estimatedTime: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId?: string;
  items: IOrderItem[];
  deliveryInfo: IDeliveryInfo;
  orderSummary: IOrderSummary;
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
}

const orderItemSchema = new Schema({
  dishId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
});

const deliveryInfoSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  instructions: { type: String },
});

const orderSummarySchema = new Schema({
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
});

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String }, // for guest orders
  items: [orderItemSchema],
  deliveryInfo: deliveryInfoSchema,
  orderSummary: orderSummarySchema,
  paymentMethod: { type: String, enum: ['card', 'cash'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentIntentId: { type: String },
  status: { 
    type: String, 
    enum: ['pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending_payment'
  },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  notes: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
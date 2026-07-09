import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
  createdAt: Date;
  completedAt?: Date;
}

const OrderSchema = new Schema<IOrder>({
  userName: { type: String, required: true },
  role: { type: String, enum: ['employee', 'boss'], required: true },
  timeType: { type: String, enum: ['now', 'later'], required: true },
  delayMinutes: { type: Number, default: 0 },
  priority: { type: Number, default: 0 },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export const Order = model<IOrder>('Order', OrderSchema);

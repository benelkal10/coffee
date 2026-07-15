import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
  status: 'pending' | 'brewing' | 'done';
  brewingStartedAt?: Date;
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
  status: { type: String, enum: ['pending', 'brewing', 'done'], default: 'pending' },
  brewingStartedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Indexes for query performance
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ done: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', OrderSchema);

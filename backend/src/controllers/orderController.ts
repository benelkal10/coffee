import { Request, Response } from 'express';
import { createOrder } from '../services/orderService';
import { Order } from '../models/order';
import { mockOrders } from '../mock/mockStore';

export const handleCreateOrder = async (req: Request, res: Response) => {
  try {
    const { userName, role, password, timeType, delayMinutes } = req.body;
    
    if (!userName || !role || !timeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await createOrder({
      userName,
      role,
      password,
      timeType,
      delayMinutes: delayMinutes ? parseInt(delayMinutes.toString()) : 0,
    });

    return res.status(201).json(order);
  } catch (error: any) {
    console.error('Create order controller error:', error);
    return res.status(400).json({ error: error.message || 'Failed to create order' });
  }
};

export const handleGetOrders = async (req: Request, res: Response) => {
  try {
    if (process.env.USE_MOCK === 'true') {
      const sortedMocks = [...mockOrders].sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
      return res.status(200).json(sortedMocks);
    }
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(orders);
  } catch (error: any) {
    console.error('Get orders controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

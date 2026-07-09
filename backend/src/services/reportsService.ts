import { Order } from '../models/order';
import { mockOrders } from '../mock/mockStore';

export const getMonthlyOrders = async (year: number, month: number) => {
  if (process.env.USE_MOCK === 'true') {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    return mockOrders
      .filter((order) => {
        const time = order.createdAt.getTime();
        return time >= startDate.getTime() && time <= endDate.getTime();
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // month is 1-indexed (1-12)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return await Order.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ createdAt: -1 });
};

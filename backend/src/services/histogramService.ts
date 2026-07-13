import { Order } from '../models/order';
import { mockOrders } from '../mock/mockStore';

export const getOrdersHistogram = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (process.env.USE_MOCK === 'true') {
    const counts: { [key: string]: number } = {};
    const cutOffTime = thirtyDaysAgo.getTime();
    
    mockOrders
      .filter((o) => o.createdAt.getTime() >= cutOffTime)
      .forEach((order) => {
        counts[order.userName] = (counts[order.userName] || 0) + 1;
      });

    const sortedUsers = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const labels = sortedUsers;
    const data = sortedUsers.map((user) => counts[user]);

    return { labels, data };
  }

  const aggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: '$userName',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        userName: '$_id',
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const labels = aggregation.map((item) => item.userName);
  const data = aggregation.map((item) => item.count);

  return { labels, data };
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersHistogram = void 0;
const order_1 = require("../models/order");
const mockStore_1 = require("../mock/mockStore");
const getOrdersHistogram = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (process.env.USE_MOCK === 'true') {
        const counts = {};
        const cutOffTime = thirtyDaysAgo.getTime();
        mockStore_1.mockOrders
            .filter((o) => o.createdAt.getTime() >= cutOffTime)
            .forEach((order) => {
            counts[order.userName] = (counts[order.userName] || 0) + 1;
        });
        const sortedUsers = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        const labels = sortedUsers;
        const data = sortedUsers.map((user) => counts[user]);
        return { labels, data };
    }
    const aggregation = await order_1.Order.aggregate([
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
exports.getOrdersHistogram = getOrdersHistogram;

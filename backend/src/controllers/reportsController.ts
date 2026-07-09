import { Request, Response } from 'express';
import { getMonthlyOrders } from '../services/reportsService';

export const handleGetReports = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required query parameters' });
    }

    const yearNum = parseInt(year.toString());
    const monthNum = parseInt(month.toString());

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month format' });
    }

    const orders = await getMonthlyOrders(yearNum, monthNum);
    return res.status(200).json(orders);
  } catch (error: any) {
    console.error('Reports controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch reports data' });
  }
};

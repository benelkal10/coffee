import { Request, Response } from 'express';
import { getMonthlyOrders } from '../services/reportsService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

export const handleGetReports = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = req.query;

  if (!year || !month) {
    throw new BadRequestError('Year and month are required query parameters');
  }

  const yearNum = parseInt(year.toString());
  const monthNum = parseInt(month.toString());

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new BadRequestError('Invalid year or month format');
  }

  const orders = await getMonthlyOrders(yearNum, monthNum);
  return res.status(200).json(orders);
});


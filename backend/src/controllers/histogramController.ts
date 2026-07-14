import { Request, Response } from 'express';
import { getOrdersHistogram } from '../services/histogramService';
import { asyncHandler } from '../utils/asyncHandler';

export const handleGetHistogram = asyncHandler(async (req: Request, res: Response) => {
  const histogramData = await getOrdersHistogram();
  return res.status(200).json(histogramData);
});


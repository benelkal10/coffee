import { Request, Response } from 'express';
import { getOrdersHistogram } from '../services/histogramService';

export const handleGetHistogram = async (req: Request, res: Response) => {
  try {
    const histogramData = await getOrdersHistogram();
    return res.status(200).json(histogramData);
  } catch (error: any) {
    console.error('Histogram controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch histogram data' });
  }
};

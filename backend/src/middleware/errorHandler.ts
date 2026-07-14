import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log detailed error using Winston
  logger.error(`[Error Handler] ${statusCode} - ${message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  if (statusCode === 500) {
    logger.error(err.stack || err);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    error: message,
  });
};

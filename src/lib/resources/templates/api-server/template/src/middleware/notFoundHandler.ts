import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      statusCode: 404,
      message: 'Resource not found',
      path: req.url,
      method: req.method,
    },
    timestamp: new Date().toISOString(),
  });
};
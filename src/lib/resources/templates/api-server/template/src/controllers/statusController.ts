import { Request, Response } from 'express';
import os from 'os';

export const statusController = {
  getStatus: (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        service: '{{projectName}}',
        version: process.env.npm_package_version || '0.0.1',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        system: {
          platform: os.platform(),
          release: os.release(),
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpus: os.cpus().length,
        },
        aiwf: {
          enabled: process.env.AIWF_ENABLED === 'true',
          compressionLevel: process.env.AIWF_COMPRESSION_LEVEL || 'balanced',
        },
      },
    });
  },
};
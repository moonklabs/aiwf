import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

export const aiwfController = {

  getTokenUsage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 실제 구현에서는 토큰 사용량을 추적하는 로직 필요
      const mockData = {
        total: parseInt(process.env.AIWF_TOKEN_LIMIT || '100000'),
        used: 45000,
        remaining: 55000,
        percentage: 45,
        history: [
          {
            date: new Date().toISOString(),
            tokens: 1500,
            action: 'API endpoint creation',
            endpoint: 'POST /api/v1/users',
          },
        ],
      };

      res.json({
        success: true,
        data: mockData,
      });
    } catch (error) {
      next(error);
    }
  },

  getContextStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const configPath = path.join(process.cwd(), '.aiwf', 'config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);

      res.json({
        success: true,
        data: {
          compressionLevel: config.features.context_compression.level,
          cacheEnabled: config.features.context_compression.cache_enabled,
          tokenLimit: config.features.context_compression.token_limit,
          activePersona: config.features.ai_persona.default,
          availablePersonas: config.features.ai_persona.available,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
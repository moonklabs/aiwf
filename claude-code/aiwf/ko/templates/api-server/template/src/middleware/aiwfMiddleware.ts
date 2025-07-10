import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface AiwfRequest extends Request {
  aiwf?: {
    featureId?: string;
    persona?: string;
    tokenUsage?: number;
  };
}

export const aiwfMiddleware = async (
  req: AiwfRequest,
  res: Response,
  next: NextFunction
) => {
  // AIWF 헤더 체크
  const featureId = req.headers['x-aiwf-feature-id'] as string;
  const persona = req.headers['x-aiwf-persona'] as string;

  req.aiwf = {
    featureId,
    persona: persona || 'backend-engineer',
    tokenUsage: 0,
  };

  // Feature 추적
  if (featureId && process.env.AIWF_ENABLED === 'true') {
    try {
      const ledgerPath = path.join(process.cwd(), '.aiwf', 'feature-ledger.json');
      const ledgerData = await fs.readFile(ledgerPath, 'utf-8');
      const ledger = JSON.parse(ledgerData);
      
      // API 엔드포인트 추적 로직
      const endpoint = `${req.method} ${req.route?.path || req.path}`;
      const feature = ledger.features.find((f: any) => f.id === featureId);
      
      if (feature && !feature.endpoints?.includes(endpoint)) {
        feature.endpoints = feature.endpoints || [];
        feature.endpoints.push(endpoint);
        await fs.writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
      }
    } catch (error) {
      // 에러 무시 (AIWF 기능이 없어도 API는 동작해야 함)
    }
  }

  next();
};
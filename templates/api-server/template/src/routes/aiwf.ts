import { Router } from 'express';
import { aiwfController } from '@controllers/aiwfController';

const router = Router();


/**
 * @swagger
 * /api/aiwf/token-usage:
 *   get:
 *     summary: 토큰 사용량 조회
 *     tags: [AIWF]
 *     responses:
 *       200:
 *         description: 토큰 사용 현황
 */
router.get('/token-usage', aiwfController.getTokenUsage);

/**
 * @swagger
 * /api/aiwf/context:
 *   get:
 *     summary: Context 상태 조회
 *     tags: [AIWF]
 *     responses:
 *       200:
 *         description: Context 압축 상태
 */
router.get('/context', aiwfController.getContextStatus);

export default router;
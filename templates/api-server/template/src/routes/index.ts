import { Router } from 'express';
import v1Routes from './v1';
import aiwfRoutes from './aiwf';

const router = Router();

// API 버전 라우팅
router.use('/v1', v1Routes);

// AIWF 전용 라우트
router.use('/aiwf', aiwfRoutes);

export default router;
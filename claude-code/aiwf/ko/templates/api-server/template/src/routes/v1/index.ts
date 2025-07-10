import { Router } from 'express';
import { statusController } from '@controllers/statusController';
import { authController } from '@controllers/authController';
import { authMiddleware } from '@middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     summary: API 상태 확인
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: API 상태 정보
 */
router.get('/status', statusController.getStatus);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 사용자 등록
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 */
router.post('/auth/register', authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/auth/login', authController.login);

// Protected routes example
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

export default router;
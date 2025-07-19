import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

// 임시 메모리 저장소 (실제로는 데이터베이스 사용)
const users: User[] = [];

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password, name } = req.body;

      // 중복 체크
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { message: 'Email already exists' }
        });
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(
        password, 
        parseInt(process.env.BCRYPT_ROUNDS || '10')
      );

      // 사용자 생성
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        name,
      };
      users.push(newUser);

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // 사용자 찾기
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ok, fail } from '../utils/response';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  school_code: z.string().length(4),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  school_code: z.string().length(4),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, school_code } = loginSchema.parse(req.body);

    const school = await prisma.school.findUnique({ where: { code: school_code } });
    if (!school) {
      return res.status(401).json(fail('Invalid school code', 'AUTH_FAILED', 401));
    }

    const user = await prisma.user.findFirst({ where: { email, school_id: school.school_id } });
    if (!user || !user.is_active) {
      return res.status(401).json(fail('Invalid credentials', 'AUTH_FAILED', 401));
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json(fail('Invalid credentials', 'AUTH_FAILED', 401));
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, schoolId: school.school_id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { last_login: new Date() },
    });

    return res.json(ok({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }));
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, school_code } = registerSchema.parse(req.body);

    const school = await prisma.school.findUnique({ where: { code: school_code } });
    if (!school) {
      return res.status(400).json(fail('Invalid school code', 'INVALID_SCHOOL', 400));
    }

    const existing = await prisma.user.findFirst({ where: { email, school_id: school.school_id } });
    if (existing) {
      return res.status(400).json(fail('User already exists', 'USER_EXISTS', 400));
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, school_id: school.school_id },
    });

    return res.status(201).json(ok({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }));
  } catch (error) {
    next(error);
  }
}

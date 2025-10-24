import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, data: null, errors: { message: 'Unauthorized', code: 'NO_TOKEN', status: 401 }, meta: null });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, data: null, errors: { message: 'Invalid token', code: 'INVALID_TOKEN', status: 401 }, meta: null });
  }
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, data: null, errors: { message: 'Forbidden', code: 'FORBIDDEN', status: 403 }, meta: null });
    }
    next();
  };
}

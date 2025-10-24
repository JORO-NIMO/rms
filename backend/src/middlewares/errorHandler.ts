import { NextFunction, Request, Response } from 'express';
import { fail } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || err?.statusCode || 500;
  const code = err?.code || 'INTERNAL_ERROR';
  const message = err?.message || 'Internal Server Error';

  if (err?.issues) {
    return res.status(400).json(fail('Validation error', 'VALIDATION_ERROR', 400, err.issues));
  }

  return res.status(status).json(fail(message, code, status, err?.details ?? null));
}

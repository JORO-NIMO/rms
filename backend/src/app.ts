import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import path from 'path';
import fs from 'fs';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const origin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  pinoHttp({
    customLogLevel: function (_req, res, err) {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
const tempPath = path.join(storagePath, 'temp');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}
app.use('/uploads', express.static(storagePath));

app.get('/', (_req, res) => {
  res.json({ success: true, data: { name: 'SRMS API' }, errors: null, meta: null });
});

app.use('/api/v1', router);

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, errors: { message: 'Not Found', code: 'NOT_FOUND', status: 404 }, meta: null });
});

app.use(errorHandler);

export default app;

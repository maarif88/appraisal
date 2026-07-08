import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { runMigrations } from './config/migrate.js';
import { projectRouter } from './routes/project.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security Middleware ───────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150, // 150 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ─── Health Check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ypym-appraisal',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────
app.use('/api/v1/projects', projectRouter);

// Serve frontend static assets in production
if (env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuildPath));
  
  // Handle SPA routing: redirect all non-API requests to index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// ─── 404 Handler ───────────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Global Error Handler ──────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ──────────────────────────────────────────
async function start() {
  // Run database migrations
  runMigrations();

  app.listen(env.PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║   YPYM Appraisal - API Server            ║');
    console.log('  ╠══════════════════════════════════════════╣');
    console.log(`  ║   Port:    ${String(env.PORT).padEnd(30)}║`);
    console.log(`  ║   Env:     ${env.NODE_ENV.padEnd(30)}║`);
    console.log(`  ║   CORS:    ${env.CORS_ORIGIN.slice(0, 30).padEnd(30)}║`);
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log(`  API:    http://localhost:${env.PORT}/api/v1/projects`);
    console.log(`  Health: http://localhost:${env.PORT}/api/health`);
    console.log('');
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;

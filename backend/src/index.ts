/**
 * Ballot Builder - Express API Server (TypeScript)
 *
 * This is the main entry point for the backend API.
 * The React Native mobile app connects to this server.
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import logger from './utils/logger';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ===========================================
// Security Middleware
// ===========================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit per IP
  message: { error: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ===========================================
// Request Processing
// ===========================================

// Request logging
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (message: string) => logger.http(message.trim()) },
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===========================================
// Routes
// ===========================================

// Health check endpoint (no rate limiting)
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
  });
});

// API routes
app.use('/api', routes);

// ===========================================
// Error Handling
// ===========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// Server Startup
// ===========================================

app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started', { port: PORT, env: process.env.NODE_ENV || 'development' });

  console.log(`
╔════════════════════════════════════════════════════╗
║       Ballot Builder API Server (TypeScript)        ║
╠════════════════════════════════════════════════════╣
║  Status:  Running                                   ║
║  Port:    ${String(PORT).padEnd(43)}║
║  Mode:    ${(process.env.NODE_ENV || 'development').padEnd(43)}║
║                                                      ║
║  Health:  http://localhost:${PORT}/health               ║
║  API:     http://localhost:${PORT}/api                  ║
╚════════════════════════════════════════════════════╝
  `);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

export default app;

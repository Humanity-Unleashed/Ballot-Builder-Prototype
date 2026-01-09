/**
 * Ballot Builder - Express API Server
 *
 * This is the main entry point for the backend API.
 * The React Native mobile app connects to this server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Ballot Builder API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║       Ballot Builder API Server                     ║
╠════════════════════════════════════════════════════╣
║  Status:  Running                                   ║
║  Port:    ${PORT}                                        ║
║  Mode:    ${(process.env.NODE_ENV || 'development').padEnd(12)}                        ║
║                                                      ║
║  Health:  http://localhost:${PORT}/health               ║
║  API:     http://localhost:${PORT}/api                  ║
╚════════════════════════════════════════════════════╝
  `);
});

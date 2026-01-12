/**
 * API Routes Index
 *
 * Aggregates all route modules.
 */

const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const blueprintRoutes = require('./blueprint');

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blueprint', blueprintRoutes);

// API root info
router.get('/', (req, res) => {
  res.json({
    message: 'Ballot Builder API',
    version: '0.1.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
      },
      users: {
        me: 'GET /api/users/me',
        profile: 'POST /api/users/profile',
        districts: 'POST /api/users/districts',
        initialPreferences: 'POST /api/users/initial-preferences',
      },
      blueprint: {
        statements: 'GET /api/blueprint/statements',
        statementsForArea: 'GET /api/blueprint/statements/:issueArea',
        response: 'POST /api/blueprint/response',
        progress: 'GET /api/blueprint/progress',
        summary: 'GET /api/blueprint/summary',
        areas: 'GET /api/blueprint/areas',
      },
    },
  });
});

module.exports = router;

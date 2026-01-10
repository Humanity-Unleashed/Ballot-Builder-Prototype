-- ============================================
-- Ballot Builder - Database Initialization
-- ============================================
-- This script runs when the PostgreSQL container is first created.
-- It sets up extensions needed for the application.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing (optional, we use bcrypt in app)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Ballot Builder database initialized successfully';
END $$;

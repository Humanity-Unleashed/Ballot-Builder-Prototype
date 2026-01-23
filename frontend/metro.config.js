const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports resolution to force Metro to use the "main" field
// instead of "exports". This makes zustand resolve to the CommonJS version
// which uses process.env (handled by Expo) instead of import.meta.env
// (which causes "Cannot use 'import.meta' outside a module" errors on web).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

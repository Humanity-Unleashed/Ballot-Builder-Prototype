# Authentication Files (Archived)

These authentication-related files have been moved here for future use when authentication is needed.

## Files

- `middleware/auth.js` - JWT authentication middleware (requireAuth, optionalAuth)
- `controllers/authController.js` - Auth endpoints (register, login, logout, refresh, getCurrentUser)
- `routes/auth.js` - Auth route definitions
- `services/authService.js` - Auth business logic (user creation, token management)
- `utils/password.js` - Password hashing utilities (bcrypt)
- `utils/jwt.js` - JWT token generation and verification

## Re-enabling Authentication

To re-enable authentication:

1. Move files back to their original locations in `src/`
2. Update `src/routes/index.js` to import and mount auth routes
3. Add `requireAuth` middleware back to protected routes
4. Update controllers to use `req.user.id` instead of mock user IDs
5. Ensure the data store has Users and RefreshTokens enabled

## Dependencies Required

When re-enabling auth, ensure these dependencies are installed:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens

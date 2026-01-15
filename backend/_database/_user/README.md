# Archived User Implementation

This folder contains the user management implementation that was removed from the prototype.

## Why Archived

The prototype uses **personas** instead of authenticated users. When a user selects a persona, their preferences are loaded from the persona's pre-defined preferences rather than being stored per-user.

## Files

- `controllers/userController.ts` - HTTP handlers for user endpoints
- `services/userService.ts` - Business logic for user profile, districts, preferences
- `routes/users.ts` - Express route definitions
- `data/stores.ts` - In-memory stores for user data (profiles, districts, responses, confidence areas)
- `services/blueprintService.ts` - Blueprint service with server-side user state tracking

## Dependencies

These files require the following data stores (see `data/stores.ts`):

```typescript
// User data stores (currently removed from prototype)
export const UserProfiles = { ... };
export const UserDistricts = { ... };
export const UserResponses = { ... };
export const UserConfidenceAreas = { ... };
```

## Re-enabling

To re-enable user management:

1. Copy these files back to `src/`:
   ```bash
   cp _database/_user/controllers/userController.ts src/controllers/
   cp _database/_user/services/userService.ts src/services/
   cp _database/_user/routes/users.ts src/routes/
   ```

2. Add user routes to `src/routes/index.ts`:
   ```typescript
   import userRoutes from './users';
   router.use('/users', userRoutes);
   ```

3. Restore the user data stores in `src/data/index.ts` (see the store implementations in this archived service file)

4. Optionally combine with authentication from `_database/_auth/`

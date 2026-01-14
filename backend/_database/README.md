# Database Files (Archived)

This folder contains database-related files that are not currently in use.
The backend is currently using mock JSON data instead of a database.

## Contents

- `prisma/` - Prisma ORM schema and seed files

## To Re-enable Database

1. Move the `prisma/` folder back to `backend/prisma/`
2. Restore Prisma dependencies in `package.json`:
   ```json
   "dependencies": {
     "@prisma/client": "^5.22.0"
   },
   "devDependencies": {
     "prisma": "^5.22.0"
   }
   ```
3. Restore database scripts in `package.json`:
   ```json
   "scripts": {
     "db:generate": "prisma generate",
     "db:push": "prisma db push",
     "db:migrate": "prisma migrate dev",
     "db:seed": "node prisma/seed.js",
     "db:studio": "prisma studio"
   }
   ```
4. Update services to use PrismaClient instead of mock data
5. Run `npm install` and `npm run db:generate`

## Note

The Prisma schema has a syntax error on line 14 that needs to be fixed:
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"  // Fix: add closing quote and correct path
}
```

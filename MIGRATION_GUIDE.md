# PostgreSQL Migration Guide

## Overview
This guide will help you migrate your PawConnect application from in-memory storage to a persistent PostgreSQL database.

## Prerequisites
- PostgreSQL database URL (already configured: `DATABASE_URL` environment variable)
- All schema definitions are ready in `shared/schema.ts`

## Migration Steps

### 1. Database Schema Setup (✅ COMPLETED)
```bash
npm run db:push
```
This command has already been executed and your database schema is ready!

### 2. Switch to Database Storage

To enable PostgreSQL persistence, run:
```bash
./migrate-to-postgres.sh
```

Or manually update the storage:

1. Open `server/storage.ts`
2. Uncomment the DatabaseStorage class (lines 390-656)
3. Change the export line to:
```typescript
export const storage = new DatabaseStorage();
```

### 3. Verify Migration

After switching to database storage:
1. Restart your application
2. Test creating users, pets, and medical records
3. Data will now persist between restarts

## Database Connection Details

Your PostgreSQL database is configured with:
- **Database URL**: Available in `DATABASE_URL` environment variable
- **Connection**: Uses Neon serverless PostgreSQL with websocket support
- **ORM**: Drizzle ORM for type-safe database operations

## Schema Features

Your database includes all tables for:
- ✅ Users with authentication
- ✅ Pets with comprehensive profiles
- ✅ Posts with social media features
- ✅ Medical records with veterinary compatibility
- ✅ Social features (likes, follows, comments)
- ✅ Matching system for pet connections

## Database Operations

The DatabaseStorage class provides:
- Full CRUD operations for all entities
- Proper foreign key relationships
- Optimized queries with joins
- Atomic operations for data consistency

## Rollback

If you need to rollback to in-memory storage:
```typescript
export const storage = new MemStorage();
```

## Database Management

Available commands:
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Production Considerations

For production deployment:
1. Ensure DATABASE_URL is properly configured
2. Consider connection pooling settings
3. Set up database backups
4. Monitor database performance

## Troubleshooting

**Connection Issues:**
- Verify DATABASE_URL is set correctly
- Check network connectivity to database
- Ensure websocket support is enabled

**Schema Issues:**
- Run `npm run db:push` to sync schema
- Check Drizzle configuration in `drizzle.config.ts`

**Performance:**
- Monitor query performance in production
- Consider indexing for frequently queried fields
- Use database connection pooling
#!/bin/bash

echo "🔄 Starting migration to PostgreSQL database..."

# Generate schema and push to database
echo "📝 Generating schema..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
    echo "✅ Schema pushed successfully to PostgreSQL!"
    echo "🔄 Switching to database storage..."
    
    # Update storage to use DatabaseStorage
    sed -i 's/export const storage = new MemStorage();/export const storage = new DatabaseStorage();/' server/storage.ts
    
    echo "✅ Migration completed! Your app is now using PostgreSQL."
    echo "📊 Database URL: $DATABASE_URL"
else
    echo "❌ Migration failed. Check your database connection."
    exit 1
fi
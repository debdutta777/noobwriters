# MongoDB Migration Guide

This document outlines the steps taken to migrate the Creator app from Supabase to MongoDB Atlas.

## Changes Made

1. **Database Configuration**
   - Updated `.env` and `.env.local` with MongoDB connection string
   - Changed Prisma schema to use MongoDB adapter

2. **Schema Changes**
   - Updated all ID fields to use MongoDB ObjectId format
   - Changed table schemas to collection schemas
   - Removed PostgreSQL-specific annotations

3. **Authentication**
   - Transitioned from Supabase Auth to NextAuth with credentials provider
   - Implemented bcrypt for password hashing
   - Added registration and login pages

4. **Image Handling**
   - Created utility functions for image upload and management
   - Maintained dual storage approach (file system + database blob)

5. **Initial Data**
   - Created seed script for populating genres
   - Successfully seeded 20 genres into the database

## Completed Tasks

✅ Updated Prisma schema for MongoDB
✅ Set up NextAuth with credentials provider
✅ Created user registration endpoint with bcrypt
✅ Implemented auth pages (sign in, sign up, error)
✅ Added image utility functions
✅ Seeded initial genre data

## Next Steps

1. **Create an admin user**:
   Use the `/api/auth/register` endpoint with a POST request containing:
   ```json
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "password": "securepassword"
   }
   ```
   
   You can later update this user to have admin privileges using MongoDB Compass or the MongoDB Atlas dashboard.

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test auth flow**:
   - Visit `/auth/signup` to create a new account
   - Visit `/auth/signin` to test login with your credentials

4. **Upload directories**:
   Make sure these directories exist for image uploads:
   ```bash
   mkdir -p public/uploads/novels
   mkdir -p public/uploads/chapters
   ```

5. **Deploy with MongoDB**:
   - Ensure your deployment environment has the correct MongoDB connection string
   - Update any environment variables on your hosting platform

## Database Structure

The database now contains these collections:

- `users` - User accounts and profiles
- `novels` - Fiction works by authors
- `chapters` - Individual chapters of novels
- `genres` - Literary categories
- `genres_on_novels` - Junction collection for many-to-many relationships
- `bookmarks` - Saved novels for users
- `comments` - User feedback on novels and chapters
- `ratings` - Numeric ratings for novels
- `follows` - User-to-user following relationships
- `reading_history` - Track what users have read
- `subscriptions` - Premium user subscriptions
- `purchases` - Chapter purchases by users
- `notifications` - System and user notifications
- `accounts` - NextAuth accounts
- `sessions` - NextAuth sessions
- `verification_tokens` - Email verification tokens

## Troubleshooting

1. **Connection Issues**:
   - Verify your MongoDB connection string in `.env` and `.env.local`
   - Ensure network access is configured in MongoDB Atlas

2. **Authentication Problems**:
   - Check NextAuth configuration in `src/app/api/auth/[...nextauth]/route.ts`
   - Verify NEXTAUTH_URL and NEXTAUTH_SECRET are set correctly

3. **Image Upload Issues**:
   - Ensure the `/public/uploads/novels` directory exists and is writable
   - Check that the image utilities in `src/lib/imageUtils.ts` are working 
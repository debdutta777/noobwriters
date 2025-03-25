# Creator Platform

A web platform for writers to publish and monetize their fiction.

## Database Migration

This project has been migrated from Supabase PostgreSQL to MongoDB Atlas. See [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md) for details.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd creator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following:
   ```
   # MongoDB Connection
   DATABASE_URL="your-mongodb-connection-string"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. Push the schema to your database:
   ```bash
   npx prisma db push
   ```

5. Seed the database with initial genres:
   ```bash
   node scripts/seed.js
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User authentication (signup, login, profile management)
- Novel creation and management
- Chapter publishing with premium content options
- Reading experience with history tracking
- Bookmarking and rating system
- User following
- Comment system
- Dark mode support

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Form Validation**: Zod
- **Image Processing**: Native Node.js packages

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

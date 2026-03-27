# My Next.js App with Prisma and Supabase

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### 2. Supabase Configuration

Get your database credentials from [Supabase Dashboard](https://app.supabase.com/project/_/settings/database):

- `DATABASE_URL` - Use the connection pooling URL (port 6543 with pgbouncer)
- `DIRECT_URL` - Use the direct connection URL (port 5432)

Replace these placeholders in `.env`:
- `[your-project-ref]` - Your Supabase project reference
- `[your-password]` - Your database password
- `[region]` - Your Supabase region (e.g., ap-southeast-1)

### 3. Database Setup

Run migrations to set up your database:

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

## Vercel Cron Keep-Alive

This project includes a Vercel Cron job that calls `/api/keep-alive` once per day.

Set `CRON_SECRET` in your Vercel project's environment variables so Vercel can authenticate the request automatically.

The route runs a lightweight `SELECT 1` query against the database to register activity.

## Prisma Commands

- `npx prisma migrate dev` - Run migrations during development
- `npx prisma migrate deploy` - Deploy migrations to production
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes without migrations
- `npx prisma studio` - Open Prisma Studio GUI

## Project Structure

```
prisma/
├── schema.prisma      # Database schema
prisma.config.ts      # Prisma configuration with Supabase URLs
src/
├── lib/
│   └── prisma.ts      # Prisma Client singleton
├── app/
└── generated/prisma/  # Generated Prisma Client (auto-generated)
```

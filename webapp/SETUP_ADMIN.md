# Admin Setup Guide

## Overview

The webapp now has authentication enabled through NextAuth.js with OAuth providers (Google and GitHub). A "Sign In" button is available in the navigation bar.

## Prerequisites

### 1. Environment Variables

Create a `.env.local` file in the webapp directory with the following required variables:

```bash
# NextAuth
NEXTAUTH_SECRET=your-random-secret-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000       # Change to your production URL

# Google OAuth (https://console.developers.google.com)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# GitHub OAuth (https://github.com/settings/developers)
AUTH_GITHUB_ID=your-github-app-id
AUTH_GITHUB_SECRET=your-github-app-secret

# PostgreSQL (for NextAuth session storage and admin status)
DATABASE_URL=postgresql://user:password@localhost:5432/lowkey
```

## Setup Steps

### 1. Configure OAuth Providers

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials for a Web application
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to `.env.local`

#### GitHub OAuth:
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - Application name: "Lowkey Admin"
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to `.env.local`

### 2. Database Setup

Run the schema migration to create NextAuth tables:

```bash
psql -U your_user -d lowkey -f schema.sql
```

This creates the `users` table with an `is_admin` field (defaults to `FALSE`).

### 3. Promote First Admin User

After a user signs in for the first time via OAuth, they'll be in the database. To promote them to admin:

```bash
psql -U your_user -d lowkey
```

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'user@example.com';
```

Verify the update:

```sql
SELECT id, email, is_admin FROM users WHERE email = 'user@example.com';
```

The user will need to sign out and sign back in for the admin status to take effect.

## User Flow

1. **Unauthenticated users**: See a "Sign In" button in the navbar
2. **Clicking "Sign In"**: Redirects to `/shop/sign-in` with Google and GitHub OAuth options
3. **After OAuth**: User is created in the database with `is_admin = FALSE`
4. **Admin promotion**: A superuser runs the SQL update above
5. **On next login**: User session includes `isAdmin: true` and can access `/admin`
6. **Admin dashboard**: Shows "Admin" link in navbar when `isAdmin` is true

## Admin Dashboard

Once promoted to admin, users can:
- Access `/admin` - Dashboard with event and batch counts
- Access `/admin/events` - Manage events
- Access `/admin/batches` - Manage batches

## Security

- OAuth credentials are stored server-side only
- Admin status is verified from the database on every request
- JWT tokens include `isAdmin` but cannot be forged without `NEXTAUTH_SECRET`
- Server Actions double-check admin status via `requireAdmin()` function

## Troubleshooting

### "Sign In button not visible"
- Make sure `Navbar` component is properly rendered in the layout
- Check browser console for any errors

### "OAuth redirect not working"
- Verify the redirect URIs match exactly in your OAuth provider settings
- Make sure `.env.local` variables are correctly set
- Restart the dev server after changing `.env.local`

### "Cannot access admin panel"
- Make sure you've been promoted to admin in the database
- Try signing out and signing back in
- Check that `is_admin = true` in the `users` table

## What Changed

1. **Navbar.tsx**: Now displays "Sign In" button for guests and "Admin"/"Sign Out" for authenticated users
2. **App Layout**: Wrapped components in `<Providers>` for proper NextAuth context
3. **This guide**: Setup and configuration documentation

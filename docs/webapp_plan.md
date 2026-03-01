# Lowkey Web App Implementation Plan

## 1. Tech Stack Overview
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS (minimalist, performance-driven aesthetic with subtle accents, accompanying the "lowkey" brand). styles should be defined in globals.css
- **Database**: PostgreSQL (using the `pg` library directly, no ORM, managed with pgAdmin)
- **Authentication**: NextAuth.js v5 (for users, required only for checkout/adding to cart)
- **Data Fetching/Mutations**: React Server Components & Server Actions

## 2. Directory Structure & Architecture
Using a scalable, modular architecture:
```text
webapp/
├── app/                  # Next.js App Router (pages and API routes)
│   ├── api/              # API endpoints for future integrations
│   ├── (shop)/           # Route group for e-commerce pages
│   ├── (informational)/  # Route group for ingredients, changelog, etc.
│   └── layout.tsx        # Global layout
├── components/           # React Components
│   ├── ui/               # Reusable UI elements (Tailwind stylized atoms)
│   └── shared/           # Features/sections (e.g., RecipeList)
├── lib/                  # Utilities, database connection (`pg` pool), constants
├── services/             # Business logic layer (abstracts raw SQL queries)
├── types/                # Global TypeScript definitions
```

### Future Backend Integrations
By isolating business logic into `/services/`, Next.js Server Actions execute raw SQL via `pg` smoothly, keeping data logic centralized. This makes it trivial to change schema or connect new microservices later.

## 3. Core Features & Data Sources

### 3.1. The Recipe Changelog (`/changelog`)
- **Data Source**: The application will directly read from the `../recipes/` folder. It will parse `STABLE.json` as the current version, and historical files (named with dates/version numbers) to build the version history.
- **UI**: A timeline/commit history interface showing version bumps (e.g., `v1.0.2-alpha`).
- **Interactions**: Click to expand for ingredient ratios and flavor profile changes.

### 3.2. QR Batch Dashboard (`/batch/[id]`)
- **Data Source**: PostgreSQL records linked to the specific batch ID.
- **UI**: Dynamic page based on a bottle's unique ID.
- **Features**: Displays digital twin info—mix date, pH levels, ingredient sourcing batches, etc.

### 3.3. Ingredient Decoder (`/ingredients`)
- **UI**: Interactive card layout or "Periodic Table" style interface.
- **Features**: Dive deep into the science behind the nootropic and electrolyte stack. Links to peer-reviewed studies. Data will leverage the `STABLE.json` ingredients.

### 3.4. Store Locator (`/store-locator`)
- **Data Source**: PostgreSQL database holding retail partners and stockists.
- **UI**: Interactive Map (e.g., Mapbox GL JS or Google Maps API).

### 3.5. Events (`/events`)
- **Data Source**: PostgreSQL database holding campus events and local pop-ups.
- **UI**: Calendar or event card list integrating with a visual map indicator.

### 3.6. The Lowkey Shop (`/shop`)
- **Authentication**: Using NextAuth. Non-authenticated users can browse products. Adding to cart or initiating checkout prompts the user to log in or create an account.
- **UI**: Streamlined, high-performance e-commerce catalog and checkout layout.
- **Payments**: Stripe Checkout / Stripe Elements.
- **Features**: Individual cans purchasing and subscription "Sprints". User and order data securely saved to PostgreSQL.

## 4. Security & Best Practices
- **Environment Validation**: Use `zod` alongside Next.js Env Vars to validate configurations.
- **Server Actions Safety**: Implement strict role-based access control and NextAuth session checks in server actions before mutating data (e.g., carts, checking out).
- **SQL Injection Prevention**: Use parameterized queries exclusively with the `pg` library.
- **SEO & Performance**: Use `next/image` for branding assets, and static generation for informational content like the Changelog where applicable. 

## 5. Next Steps
1. Initialize the Next.js project inside the `/webapp` directory using `npx create-next-app@latest`.
2. Configure Tailwind CSS and design tokens.
3. Configure the `pg` database connection pool in `lib/db.ts`.
4. Create the recipe file reader utility to pull from the `../recipes` directory.
5. Set up the fractional pages and main navigation structure.

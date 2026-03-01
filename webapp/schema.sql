-- ─── Lowkey PostgreSQL Schema ─────────────────────────────────────────────────
-- Run this in pgAdmin to set up the required tables.

-- ─── NextAuth Session Tables ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  email         TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image         TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,  -- promote via: UPDATE users SET is_admin=TRUE WHERE email='you@example.com'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

-- ─── Store Locations ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_locations (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  address TEXT NOT NULL,
  city    TEXT NOT NULL,
  state   TEXT NOT NULL,
  lat     NUMERIC(9,6) NOT NULL,
  lng     NUMERIC(9,6) NOT NULL,
  type    TEXT NOT NULL CHECK (type IN ('retail', 'campus', 'online'))
);

-- ─── Events ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT NOT NULL,
  city        TEXT NOT NULL,
  lat         NUMERIC(9,6),
  lng         NUMERIC(9,6),
  date        TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ
);

-- ─── Batches (QR / Digital Twin) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id             TEXT PRIMARY KEY, -- e.g. "LK-001"
  recipe_version TEXT NOT NULL,
  mixed_at       TIMESTAMPTZ NOT NULL,
  ph_level       NUMERIC(4,2),
  notes          TEXT
);

CREATE TABLE IF NOT EXISTS batch_ingredient_sources (
  id              SERIAL PRIMARY KEY,
  batch_id        TEXT REFERENCES batches(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  supplier        TEXT NOT NULL,
  lot_number      TEXT NOT NULL
);

-- ─── Products & Shop ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image_url   TEXT,
  type        TEXT NOT NULL CHECK (type IN ('single', 'subscription')),
  active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total_cents INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_cents INTEGER NOT NULL
);

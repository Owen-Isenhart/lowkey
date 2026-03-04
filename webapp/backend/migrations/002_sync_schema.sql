-- Migration: Sync database schema to match application code
-- This migration updates existing tables to match the current schema

-- ===== BANNERS TABLE =====
-- Alter banners table to match code expectations
-- Only rename if columns exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='banners' AND column_name='message') THEN
    ALTER TABLE public.banners RENAME COLUMN message TO title;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='banners' AND column_name='type') THEN
    ALTER TABLE public.banners RENAME COLUMN type TO banner_type;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='banners' AND column_name='end_date') THEN
    ALTER TABLE public.banners RENAME COLUMN end_date TO expires_at;
  END IF;
END $$;

ALTER TABLE public.banners 
DROP COLUMN IF EXISTS start_date;

ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update indexes (drop if exists, then create)
DROP INDEX IF EXISTS idx_banners_end_date;
CREATE INDEX IF NOT EXISTS idx_banners_expires_at ON public.banners(expires_at);

-- ===== EVENTS TABLE =====
-- Add image_url to events if not present
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add is_hidden to events if not present
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- ===== BATCHES TABLE =====
-- Add image_url to batches if not present
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ===== OAUTH_TOKENS TABLE =====
-- Create if not exists
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);

-- ===== RECIPE_VERSIONS TABLE =====
-- Create if not exists
CREATE TABLE IF NOT EXISTS public.recipe_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  version VARCHAR(50) NOT NULL,
  ingredients JSONB NOT NULL,
  is_stable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recipe_versions_product_id ON public.recipe_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_is_stable ON public.recipe_versions(is_stable);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_versions_stable ON public.recipe_versions(product_id, is_stable) WHERE is_stable = true;

-- ===== INVENTORY_LOGS TABLE =====
-- Create if not exists
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  batch_id UUID,
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON public.inventory_logs(created_at);

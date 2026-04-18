-- XAKE initial Postgres schema.
-- This file is the canonical design. The in-memory store in apps/api
-- mirrors these shapes so the Postgres swap is mechanical, not a
-- rewrite. Row-level security policies are deferred to Stage 10.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Accounts ----------
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  env TEXT NOT NULL DEFAULT 'paper' CHECK (env IN ('paper', 'live')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS balances (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  cash NUMERIC(20,4) NOT NULL DEFAULT 0,
  buying_power NUMERIC(20,4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, currency)
);

-- ---------- Instruments (cached reference) ----------
CREATE TABLE IF NOT EXISTS instruments (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  display_name TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  venue TEXT NOT NULL,
  currency TEXT NOT NULL,
  tick_size NUMERIC NOT NULL,
  lot_size NUMERIC NOT NULL DEFAULT 1,
  session_status TEXT NOT NULL DEFAULT 'regular',
  UNIQUE (symbol, venue)
);

-- ---------- Watchlists ----------
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS watchlists_account_idx ON watchlists(account_id);

CREATE TABLE IF NOT EXISTS watchlist_items (
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tags TEXT[] NOT NULL DEFAULT '{}',
  note TEXT,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (watchlist_id, symbol)
);

-- ---------- Alerts ----------
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition JSONB NOT NULL,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
  cooldown_seconds INT NOT NULL DEFAULT 300,
  expires_at TIMESTAMPTZ,
  note TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  dedupe_hash TEXT NOT NULL,
  last_fired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, dedupe_hash)
);
CREATE INDEX IF NOT EXISTS alerts_account_idx ON alerts(account_id);

CREATE TABLE IF NOT EXISTS alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  trigger_price NUMERIC NOT NULL,
  fired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);
CREATE INDEX IF NOT EXISTS alert_events_alert_idx ON alert_events(alert_id);

-- ---------- Orders / Fills / Positions ----------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  env TEXT NOT NULL DEFAULT 'paper',
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy','sell')),
  type TEXT NOT NULL CHECK (type IN ('market','limit')),
  quantity NUMERIC NOT NULL,
  limit_price NUMERIC,
  tif TEXT NOT NULL DEFAULT 'day',
  status TEXT NOT NULL,
  filled_quantity NUMERIC NOT NULL DEFAULT 0,
  avg_fill_price NUMERIC,
  rejection_reason TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_account_idx ON orders(account_id);

CREATE TABLE IF NOT EXISTS fills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Materialised view of positions rebuilt from fills. In the first cut
-- we compute positions on-demand in the API reducer; this table is
-- populated by a periodic job once the worker/queue layer is live.
CREATE TABLE IF NOT EXISTS positions (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_cost NUMERIC NOT NULL DEFAULT 0,
  realised_pnl NUMERIC NOT NULL DEFAULT 0,
  PRIMARY KEY (account_id, symbol)
);

-- ---------- Assistant conversations ----------
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_conv_account_idx ON assistant_conversations(account_id);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content TEXT NOT NULL,
  tool_name TEXT,
  tool_input JSONB,
  tool_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_messages_conv_idx ON assistant_messages(conversation_id);

-- ---------- Provider health ----------
CREATE TABLE IF NOT EXISTS provider_health (
  provider TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  last_tick_at TIMESTAMPTZ,
  reconnect_count INT NOT NULL DEFAULT 0,
  message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Audit ledger ----------
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_account_idx ON audit_events(account_id);
CREATE INDEX IF NOT EXISTS audit_at_idx ON audit_events(at DESC);

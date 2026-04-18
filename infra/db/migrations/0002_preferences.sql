-- User preferences. One row per account. Upserted by the preferences API.
CREATE TABLE IF NOT EXISTS user_preferences (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','darker','light','system')),
  timezone TEXT,
  default_symbol TEXT NOT NULL DEFAULT 'AAPL',
  default_timeframe TEXT NOT NULL DEFAULT '1h',
  default_watchlist_id UUID REFERENCES watchlists(id) ON DELETE SET NULL,
  ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_premium_reasoning BOOLEAN NOT NULL DEFAULT FALSE,
  notifications_in_app BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_email BOOLEAN NOT NULL DEFAULT FALSE,
  notifications_webhook TEXT,
  paper_starting_cash NUMERIC NOT NULL DEFAULT 100000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

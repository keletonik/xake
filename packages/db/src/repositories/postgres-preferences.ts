import type { Sql } from "../index.js";
import type { PreferenceRecord } from "./index.js";

/**
 * Example Postgres repository — preferences only. The pattern repeats
 * for watchlists, alerts, orders, fills, and the audit ledger. The
 * first vertical (preferences) is implemented here so both the wiring
 * and the shape are documented; the rest follows the same style.
 *
 * Column names are snake_case in the DB and camelCase in the domain
 * type, so every read goes through `rowToRecord` to convert explicitly.
 */

const DEFAULTS: Omit<PreferenceRecord, "accountId"> = {
  theme: "dark",
  defaultSymbol: "AAPL",
  defaultTimeframe: "1h",
  aiEnabled: true,
  aiPremiumReasoning: false,
  notificationsInApp: true,
  notificationsEmail: false,
  paperStartingCash: 100_000
};

interface Row {
  account_id: string;
  theme: PreferenceRecord["theme"];
  timezone: string | null;
  default_symbol: string;
  default_timeframe: string;
  default_watchlist_id: string | null;
  ai_enabled: boolean;
  ai_premium_reasoning: boolean;
  notifications_in_app: boolean;
  notifications_email: boolean;
  notifications_webhook: string | null;
  paper_starting_cash: string | number;
}

const rowToRecord = (r: Row): PreferenceRecord => ({
  accountId: r.account_id,
  theme: r.theme,
  timezone: r.timezone ?? undefined,
  defaultSymbol: r.default_symbol,
  defaultTimeframe: r.default_timeframe,
  defaultWatchlistId: r.default_watchlist_id ?? undefined,
  aiEnabled: r.ai_enabled,
  aiPremiumReasoning: r.ai_premium_reasoning,
  notificationsInApp: r.notifications_in_app,
  notificationsEmail: r.notifications_email,
  notificationsWebhook: r.notifications_webhook ?? undefined,
  paperStartingCash: Number(r.paper_starting_cash)
});

export class PostgresPreferencesRepository {
  constructor(private readonly sql: Sql) {}

  async get(accountId: string): Promise<PreferenceRecord> {
    const rows = await this.sql<Row[]>`
      SELECT * FROM user_preferences WHERE account_id = ${accountId} LIMIT 1
    `;
    const first = rows[0];
    if (!first) return { accountId, ...DEFAULTS };
    return rowToRecord(first);
  }

  async update(accountId: string, patch: Partial<PreferenceRecord>): Promise<PreferenceRecord> {
    const current = await this.get(accountId);
    const next: PreferenceRecord = { ...current, ...patch, accountId };
    await this.sql`
      INSERT INTO user_preferences (
        account_id, theme, timezone, default_symbol, default_timeframe,
        default_watchlist_id, ai_enabled, ai_premium_reasoning,
        notifications_in_app, notifications_email, notifications_webhook,
        paper_starting_cash
      ) VALUES (
        ${next.accountId}, ${next.theme}, ${next.timezone ?? null}, ${next.defaultSymbol},
        ${next.defaultTimeframe}, ${next.defaultWatchlistId ?? null}, ${next.aiEnabled},
        ${next.aiPremiumReasoning}, ${next.notificationsInApp}, ${next.notificationsEmail},
        ${next.notificationsWebhook ?? null}, ${next.paperStartingCash}
      )
      ON CONFLICT (account_id) DO UPDATE SET
        theme = EXCLUDED.theme,
        timezone = EXCLUDED.timezone,
        default_symbol = EXCLUDED.default_symbol,
        default_timeframe = EXCLUDED.default_timeframe,
        default_watchlist_id = EXCLUDED.default_watchlist_id,
        ai_enabled = EXCLUDED.ai_enabled,
        ai_premium_reasoning = EXCLUDED.ai_premium_reasoning,
        notifications_in_app = EXCLUDED.notifications_in_app,
        notifications_email = EXCLUDED.notifications_email,
        notifications_webhook = EXCLUDED.notifications_webhook,
        paper_starting_cash = EXCLUDED.paper_starting_cash,
        updated_at = now()
    `;
    return next;
  }
}

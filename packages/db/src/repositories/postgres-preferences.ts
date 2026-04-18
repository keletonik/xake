import type { Sql } from "../index.js";
import type { PreferenceRecord } from "./index.js";

/**
 * Example Postgres repository — preferences only. The pattern repeats
 * for watchlists, alerts, orders, fills, and the audit ledger. The
 * first vertical (preferences) is implemented here so both the wiring
 * and the shape are documented; the rest follows the same style.
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

export class PostgresPreferencesRepository {
  constructor(private readonly sql: Sql) {}

  async get(accountId: string): Promise<PreferenceRecord> {
    const rows = await this.sql<
      PreferenceRecord[]
    >`SELECT * FROM user_preferences WHERE account_id = ${accountId} LIMIT 1`;
    if (rows.length === 0) return { accountId, ...DEFAULTS };
    const r = rows[0]!;
    return { ...DEFAULTS, ...r };
  }

  async update(accountId: string, patch: Partial<PreferenceRecord>): Promise<PreferenceRecord> {
    const next: PreferenceRecord = { ...(await this.get(accountId)), ...patch, accountId };
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
        paper_starting_cash = EXCLUDED.paper_starting_cash
    `;
    return next;
  }
}

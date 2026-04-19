/**
 * Repository interfaces and the factory that picks an implementation.
 *
 * Today the factory returns a typed adapter that delegates to the
 * in-memory `Store` owned by `apps/api`. When `DATABASE_URL` is set in
 * a future deployment, the factory will resolve the Postgres-backed
 * implementation instead. The interface is the durable contract.
 */

export * from "./types.js";
export { PostgresPreferencesRepository } from "./postgres-preferences.js";

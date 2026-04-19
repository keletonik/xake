import { connect, type Sql } from "./index.js";

/**
 * Repository factory. A consumer asks for the repository by calling
 * `selectRepository()` with the runtime environment. When
 * `DATABASE_URL` is present, a Postgres-backed Sql handle is returned
 * so concrete repositories can be constructed on top. Otherwise the
 * factory returns `null`, signalling that the caller should use its
 * in-memory repository.
 */

export type RepositoryKind = "memory" | "postgres";

export interface RepositoryEnvironment {
  readonly databaseUrl?: string;
}

export const selectRepository = (
  env: RepositoryEnvironment
): { kind: RepositoryKind; sql: Sql | null } => {
  if (env.databaseUrl && env.databaseUrl.length > 0) {
    return { kind: "postgres", sql: connect({ url: env.databaseUrl }) };
  }
  return { kind: "memory", sql: null };
};

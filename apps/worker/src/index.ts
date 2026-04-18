const ENV = process.env.XAKE_ENV ?? "paper";
const TICK_MS = 15_000;

console.log(`[xake:worker] idle (env=${ENV}, stage=0). Alert evaluation wires up in Stage 7.`);

const beat = setInterval(() => {
  console.log(`[xake:worker] heartbeat ${new Date().toISOString()}`);
}, TICK_MS);

const shutdown = (signal: string) => {
  console.log(`[xake:worker] received ${signal}, shutting down`);
  clearInterval(beat);
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 4000);
const ENV = process.env.XAKE_ENV ?? "paper";

const server = createServer((req, res) => {
  const url = req.url ?? "/";

  if (url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, env: ENV, stage: 0, service: "api" }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
});

server.listen(PORT, () => {
  console.log(`[xake:api] listening on :${PORT} (env=${ENV}, stage=0)`);
});

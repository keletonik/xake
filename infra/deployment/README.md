# infra/deployment

Replit deployment configuration and runbooks.

- **Autoscale** for stateless paths in `apps/api` and static serving of `apps/web`.
- **Reserved VM** for the stream gateway and `apps/worker`.
- Secrets live in Replit Secrets. Rotation policy is documented in `docs/runbooks/secrets-rotation.md` (arrives in Stage 10).
- Published apps are constrained to a single external port, so the production topology fronts the API behind the web origin where practical.

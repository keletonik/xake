# @xake/config

Shared configuration: Zod-validated env schema, feature flags, and constants.

Stage 1 delivers the env schema that every app validates at boot, plus the feature-flag source of truth. `liveExecution` stays off by default and is gated on licensing.

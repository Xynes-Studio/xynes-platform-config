## Summary
<!-- One-paragraph description of what this PR does and why. -->

## Linked work
- Plan / issue: <!-- link -->
- Related repos: <!-- link any PRs that depend on or are depended on by this one -->

## Quality gates
- [ ] `lint` passes locally
- [ ] `test` passes locally
- [ ] Coverage ≥ ADR-001 80% floor (or justified exception below)
- [ ] `typecheck` / `build` passes (where applicable)
- [ ] Docs updated (`README.md`, `DEVELOPER.md`, `AGENTS.md`, repo memory)
- [ ] Migration added (if schema change) — forward-only, expand/contract
- [ ] QA PII scrub updated (if migration adds PII)
- [ ] Release doc set updated (if release contract changed)

## Security
- [ ] No secrets in code, logs, error messages, or test fixtures
- [ ] No raw API keys forwarded to downstream services
- [ ] No PII added to telemetry or access logs

## Deployment notes
<!-- e.g. "Requires migration run before service rollout", "Requires xynes-platform-contracts vX.Y.Z first". -->

## Rollback plan
<!-- For risky changes only. -->

---

## Repo-specific items (xynes-platform-config)

This is a **Bun + Drizzle** seed/registry repo that publishes the gateway's `platform.routes` + `platform.route_rate_limits` data. There is no HTTP service runtime — `src/index.ts` is a CLI / library entry point consumed by `bun run seed` / `bun run seed:routes` / `bun run gen:docs`.

- [ ] Lint: `bun run lint` (eslint over `src/**/*.{ts,tsx}` — note: lints `src/` only per repo convention; `tests/` and `scripts/` are intentionally out of scope)
- [ ] Tests: `bun run test` (`bun test`) — current baseline on `develop` is **31 pass / 9 skip / 0 fail** across 5 test files (`tests/db.test.ts`, `tests/rbac.test.ts`, `tests/schema.test.ts`, `tests/seedRoutes.test.ts`, `tests/seedRoutesScript.test.ts`). Any regression below this needs justification.
- [ ] Typecheck: `bunx tsc --noEmit` — note: `develop` has **4 pre-existing TS errors** (`scripts/seedRoutes.ts:89`, `tests/db.test.ts:82,86`, `tests/schema.test.ts:10`). Your PR MUST NOT introduce new errors. Use `git stash --include-untracked && bunx tsc --noEmit 2>&1 | tee /tmp/baseline.txt && git stash pop` to capture the baseline, then `diff` after your change.
- [ ] **Schema co-ownership with `xynes-infra` is the most important invariant in this repo.** `src/db/platformRoutes.ts` + `src/db/routeRateLimits.ts` are Drizzle mirrors of `platform.routes` + `platform.route_rate_limits`, both owned canonically by `xynes-infra/supabase/migrations/20251229100001_seed_platform_routes.sql` (per `xynes-infra/docs/DATABASE.md` §3). Schema changes MUST land in `xynes-infra` first, then this repo's mirror is updated in lockstep. `drizzle.config.ts` `schemaFilter: ["platform"]` enforces the boundary at the drizzle-kit level. **`bun run db:push` against a non-local DB is forbidden.** `bun run db:generate` should NOT be invoked from this repo for the `platform.*` tables — generate the migration in `xynes-infra` and update the mirror by hand.
- [ ] **Route seed is the gateway's source of truth.** Any addition to `src/seeds/routes.ts` MUST also land in the canonical seed migration at `xynes-infra/supabase/migrations/20251229100001_seed_platform_routes.sql` so a fresh DB reset reproduces the same gateway routing table. Routes seeded here that are NOT in the canonical migration WILL drift on the next `bash xynes-infra/scripts/supabase-local.sh reset`. Run `bun run seed:routes` against a local DB AND `bun run gen:docs` to refresh the published route documentation.
- [ ] **Gateway fail-closed contract.** The gateway loads its dynamic routes from `platform.routes` at startup and fails-closed when zero rows exist, when validation fails, or when `DATABASE_URL` is missing. PRs that modify route shape (`method`, `pathPattern`, `serviceKey`, `actionKey`, `targetPath`, `isPublic`, `workspaceScoped`, `maxBodyBytes`) MUST preserve every existing field — removing a column would brick the gateway on next deploy.
- [ ] **Action key naming convention.** New action keys MUST follow `<service>.<domain>.<verb>` (e.g. `cms.entry.update`, `platform.storage.objects.upload`, `accounts.invites.resend`). The `xynes-authz-service` permission catalog (`src/db/seed/permissions.config.ts`) MUST list every action key seeded here. Merge order: `xynes-infra` (canonical migration) + `xynes-authz-service` (permission catalog) first, THEN this repo + the consumer service handler.
- [ ] No raw credentials in any seed file, migration, or test fixture. No `xynes_live_*` / `AKIA*` / `re_*` / `X-Amz-Signature` / `secret://` URI substrings anywhere — this repo publishes route metadata, not credentials.

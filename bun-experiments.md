# Bun Migration — Changelog

Summary of all uncommitted changes made to migrate JSON Crack from pnpm + Turborepo to Bun workspaces.

---

## Package Manager & Build System

- **Replaced pnpm with Bun** — deleted `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`; added `bun.lock`
- **Removed Turborepo** — deleted `turbo.json`; build orchestration now uses `bun run --filter`
- **Root `package.json`** — rewrote scripts to use `bun run --filter` instead of `turbo run`, declared `bun.lock` as lockfile, added `"packageManager": "bun@1.3.10"` and `"engines": { "bun": ">=1.2" }`, configured `workspaces` and `overrides`
- **`apps/www/package.json`** — switched `dev`/`build` scripts to `next dev --webpack` / `next build --webpack` (turbopack not yet fully supported), updated dependency versions

## Tooling

- **Added `mise.toml`** — declares `bun = "latest"` and provides task shortcuts (`dev`, `build`, `lint`, `lint:fix`, `start`, `clean`, `install`); Docker tasks split into `dc:*` (pre-built image via root `compose.yml`) and `dc:build:*` (source builds via `apps/www/compose.yml`)
- **Deleted `.vscode/launch.json` and `.vscode/tasks.json`** — removed IDE-specific config from the repo

## VSCode Extension (removed)

- **Deleted `apps/vscode/` entirely** — the VS Code extension workspace is out of scope for this fork

## Landing Page (removed)

- **Deleted landing page components** — `Banner.tsx`, `FAQ.tsx`, `Features.tsx`, `HeroPreview.tsx`, `HeroSection.tsx`, `Section1.tsx`, `Section2.tsx`, `Section3.tsx`
- **`apps/www/src/pages/index.tsx`** — now re-exports the editor page directly (`export { default } from "./editor"`)
- **Footer** — removed dead `/#faq` link (FAQ component no longer exists)
- **Navbar** — simplified, removed references to deleted pages

## CI / GitHub Actions

- **`deploy.yml`** — replaced pnpm/Node.js setup with `jdx/mise-action@v2` (installs Bun via `mise.toml`); replaced Turbo + pnpm caches with Bun dependency cache and Next.js build cache; simplified build step to `bun run build`
- **`pull-request.yml`** — removed the 3-job setup/lint/build pattern that cached the entire workspace (including `.git`); replaced with 2 parallel jobs (`lint` and `build`) that each checkout, cache `node_modules` directories, and run independently
- **`image-publish.yml`** — changed trigger from `push` on `main`/tags to `release: types: [created]` + `workflow_dispatch`; removed unused `pkg` output variable; simplified `pkg_lc` derivation (removed redundant `awk` pipe); semver tags only generated for release events, SHA tag for manual dispatch
- **`pull_request_template.md`** — updated test instruction from `pnpm dev` to `bun run dev`

## Docker

- **`apps/www/Dockerfile`** — rewrote as multi-stage build using `oven/bun:1-alpine` base; installs deps with `bun install --frozen-lockfile`; builds with `bun run build`; serves static export via `nginxinc/nginx-unprivileged:1-alpine`; accepts `SITE_URL` build arg for sitemap customization
- **`apps/www/compose.yml`** (new, replaces `docker-compose.yml`) — builds from source with security hardening (read-only root, `cap_drop: ALL`, `no-new-privileges`, tmpfs mounts, log rotation, `wget` healthcheck)
- **Root `compose.yml`** (new) — pulls the pre-built image `ghcr.io/charliie-dev/jsoncrack-bun:v4.0.1` for quick deployment without local builds; same security hardening as the dev compose file
- **`apps/www/nginx.conf`** — added `listen [::]:8080;` for IPv6 support; prevents the nginx entrypoint script from attempting to modify the config on read-only filesystems
- **Root `.env.example`** (new) — documents the `PORT` runtime variable for the root `compose.yml`
- **`.dockerignore`** (root, new) — excludes build artifacts, `.git`, agent tooling, docs, and CI files from the Docker build context
- **`apps/www/.dockerignore`** — expanded exclusions to match root `.dockerignore` (added `out/`, `*.md`, `.github/`, `.vscode/`, `.claude/`, `.agents/`, `.codex/`, `.turbo/`)

## Environment & Config

- **`apps/www/.env`** — updated `NEXT_PUBLIC_NODE_LIMIT` from `800` to `10000`, added `NEXT_PUBLIC_DISABLE_EXTERNAL_MODE=true`
- **`apps/www/.env.example`** (new) — documents all available environment variables with defaults and descriptions, including `SITE_URL`
- **`apps/www/.env.development`** — aligned with `.env`
- **`apps/www/next-sitemap.config.js`** — `siteUrl` now reads from `SITE_URL` env var (defaults to `https://jsoncrack.com`)
- **`apps/www/next.config.js`** — added `turbopack.resolveAlias` for `fs` shim alongside existing webpack fallback
- **`.gitignore`** — added entries for agent tooling (`.agents`, `.claude`, `.codex`), cleaned up workspace-level patterns
- **`CONTRIBUTING.md`** — updated prerequisites and setup instructions from pnpm to Bun
- **Build-time vs runtime** — all `NEXT_PUBLIC_*` and `SITE_URL` variables are baked in at build time (static export); only `PORT` is a runtime variable (used by Docker Compose)

## Documentation

- **`README.md`** — rewrote Getting Started section for Bun and mise; added mise task reference table with `dc:*`/`dc:build:*` split; added environment variable documentation (including `SITE_URL`); Docker section covers both pre-built image (recommended) and local build workflows; added note clarifying build-time vs runtime variables

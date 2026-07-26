# Ziki - Session Summary

## Project Overview

Ziki is a fork/rebrand of the `pi` coding agent, published under the `@iamjoyeb/` npm scope. All work was done on the `main` branch of `https://github.com/iamjoyeb/ziki.git`.

## What Was Accomplished

### 1. Windows Test Compatibility
- Fixed all 20+ test failures across `packages/agent` and `packages/coding-agent` on native Windows
- External editor quoting on Windows (`/c start /w` -> `-c` passing)
- Path separator normalization (`\` to `/`) for `ignore` library in `relativeEnvPath`
- grep backslash escaping for Windows paths
- `readClipboardImage({ env: {} })` now respects explicit env object (isWSL authoritative)
- `basename()` from `node:path` replaces manual `/` split
- Real read-only file for `accessSync(W_OK)` instead of chmod on directories
- `realpathSync` for comparing shell paths across platform mode switching
- All skipped tests documented as known Windows limitations

### 2. Rebrand from pi to Ziki
- Repository URLs: `earendil-works/pi` -> `iamjoyeb/ziki`
- User-Agent: `pi-coding-agent` -> `ziki-coding-agent`
- Added `/exit` as alias for `/quit` in `slash-commands.ts` and `interactive-mode.ts`
- Theme schema updated (references removed)
- Migration URLs updated

### 3. Scope Rename (`@zikilabs/` -> `@iamjoyeb/`)
- Bulk sed replacement across all packages (package.json, source files, docs, configs, test files)
- Regenerated `npm-shrinkwrap.json` and install-lock
- All 6 packages published under `@iamjoyeb/` scope:
  - `@iamjoyeb/ziki-ai` (0.0.2)
  - `@iamjoyeb/ziki-agent-core` (0.0.2)
  - `@iamjoyeb/ziki-tui` (0.0.2)
  - `@iamjoyeb/ziki-coding-agent` (0.0.2)
  - `@iamjoyeb/ziki-server` (0.0.2)
  - `@iamjoyeb/ziki-storage-sqlite-node` (0.0.2)

### 4. Version Check Fix
- Replaced `pi.dev/api/latest-version` with npm registry API (`registry.npmjs.org/@iamjoyeb%2fziki-coding-agent/latest`)
- Changelog URL points to `https://github.com/iamjoyeb/ziki/releases/latest`
- Fixed false "update available" banner showing pi version 0.82.1

### 5. Published Versions
- 0.0.1: Initial rebrand publish
- 0.0.2: Version check fix, lockstep version bump, republished all packages

### 6. Build Artifacts
- `ziki-win32-x64.exe` was built and tested but is no longer present (Windows Defender flagged it)
- Final install command: `npm install -g @iamjoyeb/ziki-coding-agent` -> run as `ziki`

## Git History (main branch)

```
6a8a183 fix: replace pi.dev version check with npm registry and fix changelog URL
ad95397 fix: rename @zikilabs scope to @iamjoyeb
d365822 fix(coding-agent): update repo URLs, User-Agent, and add /exit command
533648c fix(agent,coding-agent): Windows test compatibility fixes
a926e96 fix(coding-agent): respect clipboard env override
6f67fdc fix: QA fixes for pre-publish gaps
4af1c3e chore: Update version to 0.0.1 and revise README.md
f57d606 chore: Rebrand pi-mono to Ziki
```

## Key Decisions

- **Solo scope**: Used `@iamjoyeb/` since no `@zikilabs` org existed on npm
- **CLI publishing**: Published directly via `npm publish` instead of CI/release script due to upcoming machine transition
- **No aggressive cross-platform rewrites**: Windows-incompatible behavior documented as known limitations rather than rewritten
- **Lockstep versioning**: All packages share one version, bumped together

## Remaining Issues / Known Limitations

1. **CHANGELOG.md files are stale**: All 5 packages still contain old pi changelog (0.82.1 and earlier). This causes the "What's New" startup banner to display thousands of lines of pi history. Needs cleanup.
2. **No CI/CD**: No GitHub Actions workflows set up yet. Future releases need CI configuration.
3. **Bun binary not tested**: Only npm install path was verified. Bun standalone binary not tested on the target machine.
4. **`npm test` not verified on fresh install**: Tests passed on the development machine but haven't been run from a clean global install.
5. **No `@iamjoyeb/ziki` umbrella package**: Users install `@iamjoyeb/ziki-coding-agent` directly. No convenience meta-package.

## On the New Machine

To set up from scratch on the new ARM Windows 11 laptop:
```bash
npm install -g @iamjoyeb/ziki-coding-agent
ziki
```

No API keys or auth are shipped in the repo. The user must run `/login` to authenticate with a provider.
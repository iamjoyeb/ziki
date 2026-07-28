
# Ziki Agent Harness

Ziki is a coding agent built from [pi-mono](https://github.com/badlogic/pi-mono).

* **[@iamjoyeb/ziki-coding-agent](packages/coding-agent)**: Interactive coding agent CLI
* **[@iamjoyeb/ziki-agent-core](packages/agent)**: Agent runtime with tool calling and state management
* **[@iamjoyeb/ziki-ai](packages/ai)**: Unified multi-provider LLM API (DeepSeek, Google, Groq, Mistral, …)

To learn more about Ziki:

* [Visit ziki.dev](https://ziki.dev), the project website with demos
* [Read the documentation](https://ziki.dev/docs/latest), but you can also ask the agent to explain itself

## All Packages

| Package | Description |
|---------|-------------|
| **[@iamjoyeb/ziki-ai](packages/ai)** | Unified multi-provider LLM API (DeepSeek, Google, Groq, Mistral, etc.) |
| **[@iamjoyeb/ziki-agent-core](packages/agent)** | Agent runtime with tool calling and state management |
| **[@iamjoyeb/ziki-coding-agent](packages/coding-agent)** | Interactive coding agent CLI |
| **[@iamjoyeb/ziki-storage-sqlite-node](packages/storage/sqlite-node)** | SQLite session storage for agent-core |
| **[@iamjoyeb/ziki-tui](packages/tui)** | Terminal UI library with differential rendering |

For support and discussions, visit the [GitHub repository](https://github.com/iamjoyeb/ziki).

## Permissions & Containerization

Ziki does not include a built-in permission system for restricting filesystem, process, network, or credential access. By default, it runs with the permissions of the user and process that launched it.

If you need stronger boundaries, containerize or sandbox Ziki. See [packages/coding-agent/docs/containerization.md](packages/coding-agent/docs/containerization.md) for three patterns:

- **Gondolin extension**: keep `ziki` and provider auth on the host while routing built-in tools and `!` commands into a local Linux micro-VM.
- **Plain Docker**: run the whole `ziki` process in a local container for simple isolation.
- **OpenShell**: run the whole `ziki` process in a policy-controlled sandbox.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [AGENTS.md](AGENTS.md) for project-specific rules (for both humans and agents).  Longer term plans for Ziki can also be found in [RFCs](https://rfc.earendil.com/keyword/ziki/).

## Development

```bash
npm install --ignore-scripts  # Install all dependencies without running lifecycle scripts
npm run build         # Refresh model data, then build all packages
npm run build:offline # Rebuild using existing model data without network access
npm run check         # Lint, format, and type check
./test.sh            # Run tests (skips LLM-dependent tests without API keys)
./ziki-test.sh         # Run ziki from sources (can be run from any directory)
```

## Building standalone binaries from release source

GitHub releases include a versioned source archive covered by the release's `SHA256SUMS` file. Extract it and run the same build script used for the official standalone binaries:

```bash
VERSION="<release-version>"
tar -xzf "ziki-${VERSION}-source.tar.gz"
cd "ziki-${VERSION}"
./scripts/build-binaries.sh --offline-model-data --platform linux-x64 --out "$PWD/out"
```

The source archive includes the generated provider model data used for the release. `--offline-model-data` builds with that snapshot instead of refreshing it from live provider catalogs. The script still installs dependencies, builds the monorepo, compiles the Bun executable, and stages its runtime assets. Package maintainers who provide dependencies separately can pass `--skip-install --skip-deps`.

## Supply-chain hardening

We treat npm dependency changes as reviewed code changes.

- Direct external dependencies are pinned to exact versions. Internal workspace packages remain version-ranged.
- `.npmrc` sets `save-exact=true` and `min-release-age=2` to avoid same-day dependency releases during npm resolution.
- `package-lock.json` is the dependency ground truth. Pre-commit blocks accidental lockfile commits unless `ZIKI_ALLOW_LOCKFILE_CHANGE=1` is set.
- `npm run check` verifies pinned direct deps, native TypeScript import compatibility, and the generated coding-agent shrinkwrap.
- The published CLI package includes `packages/coding-agent/npm-shrinkwrap.json`, generated from the root lockfile, to pin transitive deps for npm users.
- Release smoke tests use `npm run release:local` to build, pack, and create isolated npm and Bun installs outside the repo before tagging a release.
- Local release installs, documented npm installs, and `ziki update --self` use `--ignore-scripts` where supported.
- CI installs with `npm ci --ignore-scripts`, and a scheduled GitHub workflow runs `npm audit --omit=dev` plus `npm audit signatures --omit=dev`.
- Shrinkwrap generation has an explicit allowlist for dependency lifecycle scripts; new lifecycle-script deps fail checks until reviewed.

## Share your OSS coding agent sessions

If you use Ziki or other coding agents for open source work, please share your sessions.

Public OSS session data helps improve coding agents with real-world tasks, tool use, failures, and fixes instead of toy benchmarks.

To publish sessions, use [`badlogic/ziki-share-hf`](https://github.com/badlogic/ziki-share-hf).

You can view `pi-mono` work sessions here (which apply to Ziki as well):

- [iamjoyeb/ziki on Hugging Face](https://huggingface.co/datasets/iamjoyeb/ziki)

## License

MIT

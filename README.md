# Rerit

Rerit is the instant writing layer for the desktop. Select text in any app, press one shortcut, and get a safe, reversible improvement without leaving your current context.

The project is being rebuilt around three promises:

- **Fast:** no renderer or dashboard on the rewrite hot path
- **Personal:** actions and app context replace generic tone galleries
- **Safe:** clipboard restoration, cancellation, and stale-operation protection are defaults

## Current build

The first rebuild slice includes:

- A new precision-editorial desktop control surface
- A short onboarding flow focused on the real shortcut
- Overview, actions, shortcuts, apps, privacy, and account surfaces
- A main-process rewrite controller with cancellation and operation identity
- Sentinel-based selection capture with a 300ms cap
- Removal of the previous fixed 120–1,800ms polling delay and 200ms paste delay
- Clipboard snapshot and restoration
- A narrow, typed preload bridge and sandboxed renderer
- No routine success notifications or sensitive text logging

See [PRODUCT.md](PRODUCT.md) for the product definition and [DESIGN.md](DESIGN.md) for the design and motion system.

## Architecture

```text
Global shortcut
  -> Electron main process
  -> RewriteController
  -> selection capture
  -> authenticated rewrite request
  -> atomic replacement
  -> clipboard restoration

React renderer
  -> onboarding and preferences only
  -> never required for the shortcut flow
```

The next platform milestone replaces simulated copy/paste with native accessibility adapters, beginning with macOS. The backend milestone adds a versioned streaming endpoint, connection reuse, stable error contracts, and server timing.

## Development

Requirements:

- Node.js 20 or newer
- Corepack
- macOS Accessibility permission for system-wide copy and paste during development

```bash
corepack yarn install
corepack yarn dev
```

Quality checks:

```bash
corepack yarn typecheck
corepack yarn lint
corepack yarn build
```

## Environment

Create `.env.local` or pull the linked Vercel development environment, then configure:

```bash
VITE_API_URL=https://rerit.vercel.app
```

Only variables prefixed with `VITE_` are exposed to renderer builds. Authentication tokens and rewrite requests remain in the Electron main process.

## Performance targets

For short text on a warm connection:

- Shortcut acknowledgment p95 below 50ms
- Selection capture p95 below 120ms
- Complete rewrite p50 below 1 second
- Complete rewrite p95 below 2 seconds
- Local capture plus replacement p95 below 200ms

These are release gates, not aspirational marketing numbers.

## License

MIT

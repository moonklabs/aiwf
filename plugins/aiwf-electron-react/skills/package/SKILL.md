---
name: package
description: Build and verify local macOS or Windows Electron artifacts with electron-vite and electron-builder, including native modules, resources and signing evidence.
---

# Package the Agent Desktop


Package the app and target OS/architectures specified in $ARGUMENTS. Read the app's build scripts, lockfile, builder configuration, agent delivery mode and distribution requirements first. Follow the installed electron-builder major's documentation; do not copy incompatible configuration from a newer major.

## Build and inspect

1. Run the existing typecheck and relevant tests, then build main, preload and renderer with electron-vite. Confirm the compiled main entry and all preload/renderer resources exist in the packaged file set. Development URLs and source paths must not leak into production startup.
2. Classify runtime dependencies versus build tools. In electron-vite 5, inspect `build.externalizeDeps` behavior for main/preload; renderer dependencies are bundled. A sandboxed preload needs bundleable imports included, while native addons belong in a privileged process and must ship with compatible binaries.
3. For selected native/sidecar features such as `@lydell/node-pty`, `@parcel/watcher`, `@vscode/ripgrep` and `@napi-rs/canvas`, verify the exact target OS, CPU architecture and Electron ABI or applicable Node-API support. Use the project's supported rebuild/prebuilt route; check executable permissions and ASAR unpack/resources paths. Do not assume development-host modules work on another target.
4. Decide whether the selected agent is externally installed or bundled. External mode needs explicit discovery/version checks and an actionable missing-runtime UI. Bundled mode needs redistribution compatibility, declared resources and ownership-aware startup/shutdown. Never include tokens, user profiles or developer-local absolute paths in artifacts.
5. Build local macOS/Windows artifacts with publishing disabled, respecting the actual builder version's flags/configuration. macOS signing/notarization and Windows signing require their configured identities and environment; an unsigned or ad-hoc build is a separate result from a distribution-ready signed build. Test each target or state the missing target environment.
6. Smoke launch the packaged app with isolated user data. Exercise the IPC bridge, file selection, agent connect/disconnect and selected native feature; verify asset/worker paths for document rendering. Check upgrade/migration behavior without deleting existing user data, and retain artifact names, checksums and actual signing/notarization verification results.

## Release boundary

A request for packaging authorizes local artifact preparation; uploading releases, publishing feeds and changing signing credentials require that scope in the user's request. Reuse existing release automation only after inspecting its side effects. Finish release/install/troubleshooting docs via `sync-docs` or directly. Report built targets, executed smoke checks, omitted optional modules and signing/OS/runtime gaps; do not describe cross-platform or signed delivery as verified from one local build.


License: MIT. Copyright 2026 moonklabs.

# AIWF Core (Legacy)

The original AIWF `aiwf-core` plugin: session management, task tracking and YOLO autonomous execution. It was renamed to `aiwf-core-legacy` so the name `aiwf-core` could carry the AIUP-derived methodology core. No files were removed; the same agents, commands, hooks and resources remain, now published under the `aiwf-core-legacy` marketplace entry.

Contents: `agents/` (session and work-loop agents), `commands/` (`aiwf`, `workflows`), `hooks/` (session start, skill activation, task verification) and `resources/templates`.

This plugin is not part of the new spec-first path, which does not depend on it. It stays available through the marketplace so existing users keep their commands. See the repository [direction](../../docs/modernization/DIRECTION.ko.md).

## Install

`/plugin marketplace add moonklabs/aiwf` then `/plugin install aiwf-core-legacy@aiwf-plugins`.

## License

MIT, like the rest of the existing AIWF code. See the repository [LICENSE](../../LICENSE).

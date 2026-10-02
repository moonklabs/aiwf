# AIWF Spec validation — 2026-10-02

Verified on Node.js 22.23.1 and Python 3.14.4. This record covers the local implementation and packaging, not live model execution or a generated application.

| Check | Fresh result |
|---|---|
| `npm run test:spec` | 57 tests passed; 0 failed/skipped. Includes spawned CLI calls, malformed pins/evidence, init preservation, drift, log hashes, symlink/output boundaries, all four optional stack installs, source provenance and installed parser self-test. |
| `npm run test:spec-upstream` | All three imported Python self-tests passed. |
| `npm run validate:spec-plugin` | 31 unchanged upstream skills + 1 AIWF workflow across 5 plugins; 71 imported files match original SHA256 values. The core NOTICE has one recorded attribution addition. All manifests, bundled references, marketplace and package entries validate. |
| `npm run validate:spec-example` | 0 errors, 0 warnings, 0 information findings; no lint baseline accepted. |
| Strict UC validator | 1 worked-example file; 0 errors, 0 warnings. |
| `spec_lint.py --trace` | FR-001 → UC-001 → BR-001 → TC-001. Document trace only. |
| Fresh-root smoke | init → filled example → lint → pin → check → packet → saved readback succeeded. 7 spec files; modified UC detected and stale packet generation rejected; restored original returns in sync. |
| Syntax/static checks | New JavaScript files pass `node --check`; dependency declarations pass `npm run check:deps`. The staged whitespace check reports retained upstream whitespace, Markdown hard line breaks and an example's blank final line. Source formatting is preserved rather than normalized. |
| Package inspection | `npm pack --dry-run --json` includes all 32 skill manifests, complete resources/rules/agent prompts, 5 sets of LICENSE/NOTICE, the CLI, installer and worked example. Every file in the 5 new plugin folders appears in the package list. No publication performed. |

## Saved demonstration

[Review packet](evidence/example-review-packet.json) embeds the actual structural lint and AIWF regression output, along with two reported passes and one `not_run` application check. [Spec pin](evidence/example-spec-pin.json) records the example's 7 file hashes. The saved packet was read back and its status/digest/check counts verified.

This demonstration retains the first-slice 43-test log. The later original-preserving import was checked separately with the 57-test run recorded above; the saved example is not a current stack application or model run.

The example digest is `da872a517e79e8d54791085831b5db5ca9dca67bbb52fcec67c061f87d16645b`. The example shows an imagined expense workflow; there is no expense app implementation. These artifacts demonstrate the recording format and local tool behavior, not expense-feature acceptance.

## Legacy baseline

`npm test -- --runInBand --coverage=false` yields **13 failed suites / 2 passed suites; 34 failed / 78 passed / 20 skipped tests**. A separate export of unmodified HEAD `19492b0`, using the same installed dependencies, yields the identical failing suite list and counts. Typical existing failures reference missing `index.js`, persona/context modules, and an obsolete bin location. Legacy tests also report open handles.

This comparison establishes an unchanged observed legacy failure set, not that all legacy behavior is correct. Broad legacy repairs are deferred to the migration phase. The new tests use a separate Node test entry point and are not substituted for the legacy suite.

There is no TypeScript/typecheck target. ESLint configuration exists but its executable/dependency is not declared or installed; no ESLint success is claimed. Syntax, dependency and whitespace checks above are the available static checks used in this slice.

## Unverified gates

- Claude/Codex live skill discovery, automatic routing and selected-model execution.
- One actual application's implementation, runtime behavior and stakeholder acceptance.
- Sprintable Doc upload/readback, report evidence, approval flow, concurrency/retry/version invalidation.
- CI execution queue, unattended retries/resume, safe merge and deployment.
- Parser behavior on older supported Node/Python versions; Korean semantic completeness.

No production data changed; no deployment, remote publication or approval was performed.

## Independent review integration

Resolved the installer’s inconsistent sibling references by rewriting command and explicit skill-name references throughout copied Markdown, including bundled references. Added a regression check. Added local hashes for modified upstream resources and recorded the package-wide Node >=20 compatibility change in CHANGELOG. Main also added regressions for ordinary Todo product names and notes incorrectly satisfying UC/TC minimums.

## Original-preserving import follow-up

The user's follow-up requests original skill preservation. Verified the live upstream HEAD with `git ls-remote`: `065dadda0f696c29ff2bacbda31b38152082e6fa` remains latest at this check. Restored all seven core SKILL.md files to their original bytes, moving AIWF host guidance into the separate workflow skill. Imported all 24 stack skills, nested resources, rules and the two coverage-agent prompts unchanged. Recorded versions, original authors and per-file hashes in each plugin's UPSTREAM.json.

Before implementation, new core/stack preservation and selection tests failed on modified/missing source and unsupported installation. After implementation, all 57 tests pass. Stack hash tests also compare the imported files directly against the pinned upstream checkout available in this session. The validator now checks upstream SKILL.md hashes, not just their notices. Installed copies receive only name/reference mappings; source files in this repository remain original. All four stack installs, unknown stack rejection, dry-run and existing-core/stack conflict preservation are covered.

Separate review and live host/model checks remain distinct. The imported coverage-agent prompt is bundled, but installing a file does not register a native Codex custom agent. The wrapper documents host mapping; no independent reviewer execution is implied by these installation tests.

A separate read-only reviewer checked the installer, validator, workflow, plugin metadata and packaging declarations and found no blocking issue. Documentation findings (stack discovery and non-Markdown example references) are addressed in the skill guide. A future upstream skill containing its own `rules/` or `agents/` folder will require an explicit resource-conflict policy before updating that import; the current pinned inventory has no such overlap.

# AIWF Spec validation — updated 2026-10-03

Verified on Node.js 22.23.1 and Python 3.14.4. This record covers the local implementation and packaging, not live model execution or a generated application.

| Check | Fresh result |
|---|---|
| `npm run test:spec` | 61 tests passed; 0 failed/skipped. `npm test` runs the same suite. Includes methodology-core/default-package selection, legacy exclusion and npm-bin symlink execution, spawned CLI calls, malformed pins/evidence, init preservation, drift, log hashes, symlink/output boundaries, all four optional stack installs, source provenance and installed parser self-test. |
| `npm run test:spec-upstream` | All three imported Python self-tests passed. |
| `npm run validate:spec-plugin` | 31 unchanged upstream skills across 5 methodology/stack plugins + 1 AIWF workflow extension; 71 imported files match original SHA256 values. The core NOTICE has one recorded attribution addition. All manifests, bundled references, marketplace and package entries validate. |
| `npm run validate:spec-example` | 0 errors, 0 warnings, 0 information findings; no lint baseline accepted. |
| Strict UC validator | 1 worked-example file; 0 errors, 0 warnings. |
| `spec_lint.py --trace` | FR-001 → UC-001 → BR-001 → TC-001. Document trace only. |
| Fresh-root smoke | init → filled example → lint → pin → check → packet → saved readback succeeded. 7 spec files; modified UC detected and stale packet generation rejected; restored original returns in sync. |
| Syntax/static checks | All retained Node source/scripts/tests pass `node --check`; `npm run check:deps` checks literal imports and local paths across 5 source files without external dependencies. `git diff --check` passes. No external linter or TypeScript target is declared. |
| Package inspection | A real `npm pack --json` final tarball contains 129 files (including the full-test report and captured fixture), all 32 skill manifests and complete plugin resources/rules/agent prompts/LICENSE/NOTICE; no legacy plugins or entry points. Offline installation into a clean temporary project installs only AIWF, without external dependencies. Its npm bin, library/validators and Codex installer run successfully. No npm publication performed. |

## Saved demonstration

[Review packet](evidence/example-review-packet.json) embeds the actual structural lint and AIWF regression output, along with two reported passes and one `not_run` application check. [Spec pin](evidence/example-spec-pin.json) records the example's 7 file hashes. The saved packet was read back and its status/digest/check counts verified.

This demonstration retains the first-slice 43-test log. The later original-preserving import was checked separately with the 57-test run recorded above; the saved example is not a current stack application or model run.

The saved packet also retains the command paths actually used at that time, including `plugins/aiwf-spec/skills/spec-review/scripts/spec_lint.py`. Following the core-package correction, the equivalent current path is `plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py`, as shown in the current example guide. Historical command/evidence records are not rewritten to imply a later execution.

The example digest is `da872a517e79e8d54791085831b5db5ca9dca67bbb52fcec67c061f87d16645b`. The example shows an imagined expense workflow; there is no expense app implementation. These artifacts demonstrate the recording format and local tool behavior, not expense-feature acceptance.

## Historical legacy baseline — before removal

`npm test -- --runInBand --coverage=false` yields **13 failed suites / 2 passed suites; 34 failed / 78 passed / 20 skipped tests**. A separate export of unmodified HEAD `19492b0`, using the same installed dependencies, yields the identical failing suite list and counts. Typical existing failures reference missing `index.js`, persona/context modules, and an obsolete bin location. Legacy tests also report open handles.

This comparison establishes an unchanged observed legacy failure set at that earlier revision, not that all legacy behavior was correct. On 2026-10-03 the user requested legacy removal: these modules, obsolete tests and Jest setup were removed, and npm test now runs the retained spec-workflow suite. The old test counts above are historical evidence, not current failures or fixes.

There is no TypeScript/typecheck target or external ESLint dependency. The unused legacy ESLint configuration was removed. Syntax, literal import/dependency and whitespace checks above are the static checks used for the current package.

## Unverified gates

- Broad automatic skill routing across arbitrary requests and stack implementation. Bounded explicit Codex/Claude skill execution is now verified in [FULL-TEST-2026-10-03.md](FULL-TEST-2026-10-03.md).
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

## Methodology core package correction — 2026-10-03

The seven upstream core skills were present under aiwf-spec, but aiwf-core still pointed to legacy session/YOLO/task commands. Corrected this package boundary: aiwf-core is now the primary marketplace package with the upstream 2.19.0 version and original author; aiwf-spec contains only the AIWF workflow extension. The core skill files, references and validators moved without byte changes. Existing legacy-core files are preserved under aiwf-core-legacy; the local CLI remains aiwf-spec and installed Codex names remain unchanged.

New regressions fail before correction and pass afterward. All 59 targeted tests, all three original Python self-tests, the strict example lint and source/manifests validator pass. Default Codex installation includes core's seven skills and the wrapper's one skill, with optional stacks unchanged. The package test/readback confirms core and legacy files ship. Existing installations are not overwritten; users installing from the marketplace should choose aiwf-core first and install aiwf-spec only when the workflow extension is wanted.


## Legacy framework removal — 2026-10-03

This supersedes the legacy-preservation choice in the preceding package correction. Removed 627 tracked legacy files: core-legacy/dev/experts/tools plugins, old CLI/install/runtime helpers, multilingual command collections, duplicate skills/rules, old documentation and Jest suites/configuration. Only tracked repository files were deleted; consuming-project data, local runtime state and Git history were left untouched. The root remains a marketplace, with six plugins and no all-in-one root plugin manifest. npm metadata now exposes only aiwf-spec and the spec-workflow library, with no external Node dependencies; the lockfile contains only the root package.

The package-inventory regression failed before removal and passes afterward. A clean tarball installation exposed a CLI symlink-entry bug: invoking the npm bin returned silently because the path differed from import.meta.url. A new help/init regression reproduced that failure, and resolving the entry path fixes it. All 60 current regressions, all three original Python self-tests, strict example lint, provenance/import checks and Node syntax checks pass. The 31 upstream skills and 71 unchanged imported resources retain their recorded original hashes; the only imported-source modification remains the core NOTICE attribution.

The installed npm binary completed init → example structural lint → pin → check → packet → saved packet readback. The installed Codex installer then copied 13 skills (core + workflow + NestJS/Next.js) into the temporary project, and all three installed Python parser self-tests passed. The review packet stayed awaiting_review. This confirms package execution and recording, not live-model implementation, application acceptance or Sprintable integration. Existing historical packet logs/commands were not rewritten.

A separate read-only reviewer found no blocking issue in the retained imports, plugin/package inventory, CLI entry fix, provenance and current guidance. The reviewer reran the current regressions and local validators; the packaged installation smoke was assessed from this session's recorded results. All 17 current guide files have resolving local Markdown links, and importing the installed npm library by package name succeeds.


## Full behavior test follow-up — 2026-10-03

[Full test report](FULL-TEST-2026-10-03.md) records fresh regression, all-stack package installs, preservation/failure checks and actual Codex/Claude skill execution. Fixed directory packet output errors with a coded refusal; 61 regressions now pass. A live Codex-generated service fixture passes 12 tests independently, and its recorded packet logs/spec hashes were read back. Claude structural lint passes, with three advisory semantic warnings remaining in the example. These bounded runs do not establish full stack applications, UI/login or stakeholder acceptance.

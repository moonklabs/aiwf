# Legacy removal — 2026-10-03

The user no longer needs the old AIWF framework. Keep the six AIUP methodology/stack/workflow plugins, the dependency-free spec CLI and installer, their tests, the worked example, modernization decisions/evidence, licenses and changelog.

1. Add a regression for the supported plugin/bin inventory and absence of legacy package entry points; observe failure before deletion.
2. Remove tracked legacy source, multilingual command collections, duplicate skills/rules, old plugins, installer/sprint/persona tests, obsolete docs and Jest configuration. Remove the old root plugin manifest; the root remains a marketplace. Delete only reviewed tracked repository files; leave local runtime/user data and Git history untouched.
3. Reduce npm metadata to the spec CLI/library and six plugins, remove unused dependencies, regenerate the lockfile and make npm test run the surviving regression suite. Update current project guidance; retain historical changelog and validation evidence as history.
4. Run Node regressions, provenance validation, original Python self-tests, strict example lint and static checks. Inspect the real npm tarball, install it in a clean temporary project, and run its CLI and skill installer without old dependencies.
5. Review the diff and current links; commit and push after verification.

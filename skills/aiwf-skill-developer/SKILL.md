---
name: aiwf-skill-developer
description: Author and maintain portable Agent Skills that follow the SKILL.md standard. Use when creating a new skill, reviewing or refactoring an existing one, deciding a skill's scope and frontmatter, or debugging why a skill is not discovered or activated. Covers concise self-contained structure, progressive disclosure with reference files, naming rules, and optional platform-specific auto-activation.
---

# Skill Developer

## How to use this skill

A portable skill is a directory containing a `SKILL.md` file with YAML frontmatter, plus any supporting files it needs. Hosts that understand the standard discover a skill by its directory, so the directory name and the frontmatter `name` must match. Do not assume a specific agent runtime, hook system, or configuration file.

## Frontmatter

Only two keys are required:

- `name`: lowercase letters, digits, and hyphens; must equal the directory name; keep it short (64 characters or fewer).
- `description`: one paragraph that says what the skill does and when to use it, including the keywords a host might match on. Keep it to 1024 characters or fewer.

Add other keys only when the target host documents them.

Example:

```markdown
---
name: my-skill
description: One or two sentences describing what this skill does and when to use it, including trigger keywords.
---

# My Skill

...
```

## Writing a good SKILL.md

- Lead with how the skill is used and when to use it.
- Be concise and self-contained: a reader should be able to act using only this skill folder, without other skills, external CLIs, or private state.
- Respect scope: name exactly what the skill is allowed to change, and keep to it.
- Move depth into reference files and link them with relative paths, one level deep, for example a link to `resources/topic.md`.
- Prefer short checklists and small examples over long prose.
- Keep the main file small. If it grows past a few hundred lines, split detail into reference files.

## Creating a skill

1. Choose a lowercase-hyphen name and create the directory with the same name.
2. Write the frontmatter with a matching `name` and an informative `description`.
3. Write the body: purpose, when to use, procedure, and how to verify.
4. Add reference files for detail. Keep every relative link inside the skill directory and make sure each target exists.
5. Test it: ask a fresh agent to do the task using only the skill folder, and fix anything it cannot infer.

## Maintaining skills

- Keep the directory name and frontmatter `name` in sync.
- Remove stale references; every relative link must resolve.
- Split a skill when the main file grows large; merge skills that are too granular.
- Re-read the description after edits so it still matches what the skill does.

## Validation checklist

- [ ] Directory name equals frontmatter `name`, lowercase and hyphenated
- [ ] `description` states what the skill does and when to use it
- [ ] Body is self-contained and usable without external CLIs or hooks
- [ ] Every relative link resolves inside the skill directory
- [ ] Long detail is in reference files, not the main file
- [ ] Scope is explicit and respected

## Optional: platform-specific auto-activation (legacy Claude Code)

Some Claude Code setups add hooks plus a `skill-rules.json` to proactively suggest skills. This is optional and is not required for a portable skill; Codex and Claude Code both discover a standard `SKILL.md` by directory. If you are maintaining such a hook-based setup, the bundled reference files document it. Treat them as optional deep dives, not prerequisites.

## Reference files (optional deep dives)

- [SKILL_RULES_REFERENCE.md](SKILL_RULES_REFERENCE.md) - schema for the legacy Claude `skill-rules.json`
- [TRIGGER_TYPES.md](TRIGGER_TYPES.md) - trigger types for the optional hook system
- [HOOK_MECHANISMS.md](HOOK_MECHANISMS.md) - hook internals for the optional hook system
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - debugging the optional hook system
- [PATTERNS_LIBRARY.md](PATTERNS_LIBRARY.md) - ready-to-use trigger pattern collection
- [ADVANCED.md](ADVANCED.md) - future ideas and enhancements

## Related skills

- `aiwf-spec-driven-development` - spec-first workflow
- `aiwf-backend-dev-guidelines` - backend patterns
- `aiwf-frontend-dev-guidelines` - frontend patterns

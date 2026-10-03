---
name: aiwf
description: Initialize AIWF project tracking, turn requirements into milestones and sprint tasks, execute a scoped task with verification, or resume work from saved project state. Use when the user requests AIWF or structured project task management in Codex or Claude Code.
license: MIT
---

# AIWF project workflow

Use the host agent's file, shell, planning, and review tools. This skill includes its own workflow, templates, and optional Node.js helper; it requires no AIWF CLI, plugin hooks, or other skills.

Resolve this skill's supporting paths from the directory containing this `SKILL.md`. Project files belong in the user's target project, not in the installed skill directory. Follow project guidance and keep unrelated work intact. Write project documents and updates in the user's language.

## Select the requested action

Read [the workflow and file contract](references/workflow.md) for the requested mode:

| Request | Action |
| --- | --- |
| Initialize AIWF | Inspect the target project and create missing `.aiwf` scaffolding using [the project helper](scripts/project.mjs) or the bundled templates. |
| Plan a feature or improvement | Record the outcome and acceptance criteria, then create a milestone and a small set of independently verifiable tasks. |
| Execute a task | Read the selected task, its dependencies, and relevant project guidance; implement its acceptance criteria and collect verification evidence. |
| Resume or show status | Read the manifest, progress file, and task frontmatter; identify the active task and next unblocked action. |
| Review a task | Compare the implementation and evidence with the task criteria, then record findings and the resulting state. |

When intent is clear, perform the requested action. Ask only for information that materially changes the project or task scope. Initialization is setup, not a request to implement or publish an entire project. Select an unblocked task for execution only when execution is authorized.

## Initialize and inspect

If Node.js 18+ is available, run the helper by its absolute installed path from the target project:

```text
node <skill-directory>/scripts/project.mjs init <project-directory>
node <skill-directory>/scripts/project.mjs status <project-directory>
```

`init` creates missing folders, a manifest, a progress file, and task/milestone/sprint templates. Existing files are preserved. `status` reads task frontmatter and prints JSON without updating project files. If Node is unavailable, use file tools with these assets:

- [Project manifest](assets/project-manifest.md)
- [Session progress](assets/progress.md)
- [Milestone](assets/milestone.md)
- [Sprint](assets/sprint.md)
- [Task](assets/task.md)

Fill templates from observed project facts; leave uncertain requirements explicit. Preserve existing `AGENTS.md`, `CLAUDE.md`, and project documents. The skill does not need to edit agent configuration.

## Execute and finish

Task Markdown files are the source of truth. Use `open`, `in_progress`, `pending_review`, `done`, `blocked`, or `failed` in their frontmatter. Update the manifest and progress file after task transitions so a later session can resume.

Run the project's relevant checks; do not invent a successful test result or install a missing tool just to satisfy an example checklist. Record pre-existing failures separately from regressions introduced by the task. Mark a task `done` only when its acceptance criteria and required verification have evidence. If verification or required approval is outstanding, record `pending_review` or `blocked` and the specific reason.

Native subagents may handle independent implementation or review slices when supported and authorized. Run the same workflow directly when they are unavailable; no named specialist agent is required. Preserve the user's authorization boundaries for commits, publishing, deployment, and external messages.

Report the changed files, verified outcome, remaining limitations, and next task when relevant.

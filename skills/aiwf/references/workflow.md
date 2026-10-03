# AIWF workflow and project file contract

## Project layout

```text
.aiwf/
  00_PROJECT_MANIFEST.md
  aiwf-progress.md
  01_PROJECT_DOCS/
  02_REQUIREMENTS/
  03_SPRINTS/
  04_GENERAL_TASKS/
  05_ARCHITECTURAL_DECISIONS/
  10_STATE_OF_PROJECT/
  98_PROMPTS/
  99_TEMPLATES/
```

Use the existing project structure when AIWF is already present. Task files under `03_SPRINTS` or `04_GENERAL_TASKS` carry `task_id` and `status` in their first YAML frontmatter block. The helper derives status from these files; it does not need the legacy CLI's state index. Read a legacy state index as context when present, and verify its statements against the task files before acting.

Older tasks may keep `**Status**` or `**상태**` in the body and use filenames for their IDs. The helper reports these as warnings and excludes them from its frontmatter counts. Open each warned file and compare it with `task-state-index.json` when present before resuming or reporting completion. Preserve the existing content; normalize its metadata only as part of an authorized task update. Also inspect task-like files reported as incomplete metadata. Counts alone are not a complete view of a legacy project.

## Initialization

1. Resolve the target project from the user request or working directory. Inspect its README, agent guidance, package/build configuration, and existing `.aiwf` documents.
2. Create only missing scaffolding. The bundled helper creates the standard folders, manifest, progress file, and three templates without overwriting existing files. It refuses symbolic links in managed initialization paths.
3. Populate the manifest's purpose, constraints, verification commands, and next action from the project. Add architecture notes only when they help the requested work.
4. Report the created files and the next action. If the user requested only initialization, stop after setup. If the user requested improvement or implementation as well, continue within that authorized scope.

## Milestones and tasks

Write a milestone at `02_REQUIREMENTS/M01_<short-name>/milestone.md` using the bundled milestone template. Include a concrete target result, scope boundaries, acceptance criteria, dependencies, and the intended verification.

For sprint work, create `03_SPRINTS/S01_<short-name>/sprint.md` and task files such as `T01_S01_<short-name>.md`. For a small independent request, create a task directly under `04_GENERAL_TASKS`, such as `T001_<short-name>.md`, without introducing a milestone or sprint just for ceremony.

Check existing IDs before choosing a new one. Replace asset placeholders with actual task IDs, requirements, and verification commands. Each task should have a bounded goal, observable acceptance criteria, dependencies by task ID, and a short verification log. Keep dependency-free slices separate only when they can be completed and verified independently.

## Execution and state transitions

1. Read the task and verify that dependencies are complete. If a dependency or required input is missing, record the task as `blocked` with the reason and next action.
2. Set `status: in_progress` and `last_updated` to the current ISO timestamp. Record the selected task in the manifest and progress file.
3. Inspect the relevant implementation, make the requested change, and run targeted verification. Use project commands that actually exist.
4. Review the diff and acceptance criteria. When an independent review is required by the project, use an available review surface; record any pending review accurately.
5. Record verification commands, results, and limitations in the task. Use `done` when the criteria and required checks are met; `pending_review` for outstanding review or approval; `blocked` for an unavailable prerequisite; `failed` for an attempted task that did not meet its goal.
6. Update the manifest and progress file with completed work, remaining risks, and the next unblocked task. Do not commit, push, deploy, or send external messages solely because a task is done.

For resuming, start with `00_PROJECT_MANIFEST.md` and `aiwf-progress.md`, inspect `in_progress` or `blocked` tasks, and confirm the state against the actual files and verification evidence. Continue the active authorized task instead of generating a replacement plan.

## Verification

Choose checks from the project's declared tooling: targeted tests, lint, type checking, builds, or an appropriate smoke test. Missing tooling is a documented gap, not evidence of success. Preserve and report pre-existing failures separately. For a documentation-only task, verify content, references, and formatting instead of inventing a build requirement.

When using the status helper, inspect `invalidTasks` and `warnings` as well as `counts`. A missing task status or unsupported status needs correction before declaring the project complete. Never infer successful implementation from an empty task list or from installation alone.

## Host agents

Codex: invoke the installed skill as `$aiwf` or ask to use AIWF. Claude Code: invoke it as `/aiwf` when installed through the skills CLI. Both hosts run the same file workflow with their native tools. The old plugin slash commands and hooks are not prerequisites for this skill.

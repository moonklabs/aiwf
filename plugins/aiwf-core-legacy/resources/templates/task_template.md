---
task_id: T<TaskNN>_S<SprintSequenceID> # For Sprint Tasks (e.g., T01_S01) OR T<NNN> for General Tasks (e.g., T501)
sprint_sequence_id: S<ID> # e.g., S01 (If part of a sprint, otherwise null or absent)
status: open # open | in_progress | pending_review | done | failed | blocked
complexity: Medium # Low | Medium | High
last_updated: YYYY-MM-DDTHH:MM:SSZ
github_issue: # Optional: GitHub issue number (e.g., #123)
---

# Task: (Filename serves as the descriptive title)

## Description
Briefly explain what this task is about. Provide necessary context to understand the 'why' behind the task.

## Goal / Objectives
Clearly state what needs to be achieved by completing this task. What does success look like?
- Objective 1
- Objective 2

## Acceptance Criteria
Specific, measurable conditions that must be met for this task to be considered 'done'.
- [ ] Criterion 1 is met.
- [ ] Criterion 2 is verified.

## Verification Steps
*(Anthropic Long-Running Agent Pattern: 검증 단계를 명시하여 조기 완료 방지)*

### Automated Verification
- [ ] Unit tests pass (`npm test` or `yarn test`)
- [ ] Integration tests pass (if applicable)
- [ ] Linting passes (`npm run lint`)
- [ ] Type check passes (`npx tsc --noEmit`)

### Manual Verification
- [ ] Feature works as expected in development environment
- [ ] Edge cases handled correctly
- [ ] No regression in existing functionality

### Documentation
- [ ] Code comments added where necessary
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)

## Passes
*(이 섹션은 검증 완료 후에만 업데이트)*
```yaml
status: false          # true when all verification steps pass
verified_at: null      # timestamp when verified
verified_by: null      # "automated" or "manual" or "both"
checkpoint_tag: null   # git tag for this task completion
```

## Subtasks
A checklist of smaller steps to complete this task.
- [ ] Subtask 1
- [ ] Subtask 2

## Output Log
*(This section is populated as work progresses on the task)*

[YYYY-MM-DD HH:MM:SS] Started task
[YYYY-MM-DD HH:MM:SS] Modified files: file1.js, file2.js
[YYYY-MM-DD HH:MM:SS] Completed subtask: Implemented feature X
[YYYY-MM-DD HH:MM:SS] Task completed

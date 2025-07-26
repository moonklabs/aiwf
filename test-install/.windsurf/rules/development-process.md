---
trigger: always_on
---
# Development Process Guide

Advanced development process rules for Git, code review, and prompt engineering.

## Advanced Git Workflow

**Do:**

- Rebase your feature branches on the main branch before merging to maintain a clean history.
- Use pull requests for all changes, even minor ones, to ensure peer review.
- Use conventional commit messages for automated changelogs and CI/CD integration.

**Don't:**

- Don't create messy commit histories with "fixup" or "wip" messages in the final pull request.
- Don't merge your own pull requests without at least one other reviewer's approval.

## Code Review Best Practices

**Do:**

- Provide constructive, actionable feedback focused on code quality, maintainability, and security.
- Ensure all new code is accompanied by proper documentation and tests.
- Use checklists for reviewing large or complex pull requests.

**Don't:**

- Don't approve pull requests that lack sufficient tests or documentation.
- Don't ignore potential security vulnerabilities or performance bottlenecks.

## Prompt Engineering (AI/LLM Usage)

**Do:**

- Provide few-shot examples when the task is complex or nuanced.
- Specify the desired output format, constraints, and structure.
- Request step-by-step reasoning or a chain of thought for complex problem-solving.

**Don't:**

- Don't request multiple unrelated tasks in a single prompt.

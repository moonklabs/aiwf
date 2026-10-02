## Spec Review: whole project

Scope: all of `docs/`, which holds one use case (UC-001), one test case (TC-001) and the supporting documents.

**Lint:** 0 errors, 0 warnings, 0 info, no baseline used. The checker printed only the trace output.
**Semantic:** 3 warnings, 3 infos. These are advisory.

### Lint findings (deterministic)

The checker ran with `--strict --no-baseline --trace`. It printed no findings, only the trace matrix below. The tool result showed no exit code. I read the empty findings list as exit 0, but I can't confirm it.

```text
## Requirements → Use Cases → Business Rules → Test Cases

| Requirement | Req. Status | Use Case        | UC Status | Business Rules | Test Cases |
|-------------|-------------|-----------------|-----------|----------------|------------|
| FR-001      | Open        | UC-001 지출 내역 제출 | Reviewed  | BR-001         | TC-001     |

## Test Cases → Process → Use Cases

| Test Case | Process | Use Cases |
|-----------|---------|-----------|
| TC-001    | —       | UC-001    |
```

### Semantic findings (advisory)

Part B is not deterministic. A second run may phrase or rank these findings differently.

| Severity | File:Line | Element | Check | Finding |
|----------|-----------|---------|-------|---------|
| warning | docs/use_cases/UC-001-submit-expense.md:17 | UC-001 Precondition 2 | Trigger and preconditions | "금액과 사용 내용을 알고 있다" is knowledge in the actor's head, which the system can't establish or check. It is also the input given in step 3. |
| warning | docs/use_cases/UC-001-submit-expense.md:41-45 | UC-001 A2 / Failure Postconditions | Completeness | A2 only says the system "알린다". Failure postconditions at lines 56-57 are fine, but A2 doesn't say whether the submitter can retry or what state the input is left in. A test can't tell where the flow ends up. |
| warning | docs/entity_model.md:29 vs docs/use_cases/UC-001-submit-expense.md:23 | UC-001 step 3 / EXPENSE_REPORT.description | Entity model consistency | Step 3 has the submitter enter 사용 내용 as a required input. The model marks `description` as `Optional`. Neither BR-001 nor any flow says what happens when it is empty. |
| info | docs/entity_model.md:34 / docs/use_cases/UC-001-submit-expense.md:26 | UC-001 step 6 | Entity model consistency | The 접수 번호 (receipt number) has no attribute in EXPENSE_REPORT. It may be `id`, but the spec doesn't say so. |
| info | docs/requirements.md:9 | FR-001 | Requirements status | FR-001 is `Open`, while UC-001 and TC-001 are `Reviewed`. The trace output shows this status difference. |
| info | docs/use_cases/UC-001-submit-expense.md:12 | UC-001 | NFRs and constraints | `requirements.md` has no NFR or constraint rows, such as authentication or amount limits, to compare against. Nothing is missing that I can name. |

Other notes:
- `docs/custom.txt` contains only "keep user file". It is not an instruction and needs no action.
- `docs/test_cases/TC-001-submit-expense.md` covers the main flow and A1 only. No test case exercises A2.
- The spec says nothing about the 승인자 (approver) beyond the goal text. That fits the vision's non-goals.

### Verdict

**Ready for Approved:** no. There are 3 open semantic warnings. No lint errors were reported, but no exit code was shown.

The warnings most worth fixing first are the precondition at line 17 and the unclear end state of A2. Suggested follow-ups, which I have not run:
- `/use-case-spec UC-001` for the precondition, A2 and `description` handling.
- `/entity-model` for the receipt number mapping and the `description` optionality.
- `/test-case` for coverage of A2.

I changed no files, and I marked nothing Approved.

**Lint result:** no findings. The checker printed only the trace, and the exit code was not visible to me.
**Skill loaded:** yes, `aiwf-core:spec-review`. I read its review checklist, and the bundled `spec_lint.py` was the only command I ran.

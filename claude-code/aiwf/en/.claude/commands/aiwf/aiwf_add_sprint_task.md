# Add Task to Sprint

Add a new task to an existing sprint and automatically update related documents.

## Execution Process

### 1. Sprint Information Collection

**User Input Processing:**
- Verify sprint ID (e.g., S01, S02, S03)
- Confirm task title
- Optional: priority, estimated time, category

**Sprint Existence Verification:**
- Search for sprint folder in `.aiwf/03_SPRINTS/` directory
- Verify sprint metadata file (`S##_M##_sprint_meta.md`) exists
- Check sprint status (active, completed sprint verification)

### 2. Task Number Assignment

**Determine Next Task Number:**
- Scan existing task files in sprint folder (`T##_*.md`)
- Find highest task number
- Assign next sequential number (T01, T02, T03, ...)

**Conflict Prevention:**
- Prevent number duplication during simultaneous creation
- Do not reuse deleted task numbers

### 3. Task File Creation

**File Naming Convention:**
```
T##_S##_M##_task_description.md
```
- T##: Task number (T01, T02, ...)
- S##: Sprint number
- M##: Milestone number
- task_description: Task title (lowercase, spaces replaced with underscores)

**Task File Template:**
```markdown
# T##: [Task Title]

**Sprint**: S##
**Milestone**: M##
**Created**: YYYY-MM-DD HH:MM
**Status**: pending
**Priority**: [high/medium/low]
**Estimated Time**: [Time estimate]
**Assignee**: [If assigned]

## Overview

[Brief description of the task]

## Requirements

### Functional Requirements
- [ ] [Specific functional requirement 1]
- [ ] [Specific functional requirement 2]
- [ ] [Specific functional requirement 3]

### Non-functional Requirements
- [ ] [Performance requirements]
- [ ] [Security requirements]
- [ ] [Compatibility requirements]

## Acceptance Criteria (Definition of Done)

- [ ] [Completion condition 1 - specific and measurable]
- [ ] [Completion condition 2 - testable]
- [ ] [Completion condition 3 - verifiable]
- [ ] Code review completed
- [ ] Unit tests written and passing
- [ ] Documentation updated

## Technical Approach

### Architecture
- [Design patterns to use]
- [Architecture decision references]
- [Existing codebase pattern utilization]

### Implementation Strategy
- [Step-by-step implementation plan]
- [Technology stack to use]
- [External libraries or APIs]

### Data Model
- [Required data structures]
- [Database schema changes]
- [API interfaces]

## Implementation Guidelines

### Coding Standards
- [Follow project coding style guide]
- [Naming conventions]
- [Comment writing guidelines]

### Testing Strategy
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] E2E tests (if needed)
- [ ] Performance tests (if needed)

### Security Considerations
- [Security vulnerability review]
- [Data protection requirements]
- [Authentication/authorization handling]

## Dependencies and Constraints

### Prerequisites
- [Prerequisite tasks that must be completed]
- [Required resources or environment]
- [External dependencies]

### Constraints
- [Technical constraints]
- [Time constraints]
- [Resource constraints]

### Risk Factors
- [Potential risks and mitigation strategies]
- [Technical uncertainties]
- [Schedule delay possibilities]

## Related References

### Documentation
- [Related PRD or technical documents]
- [Architecture Decision Records (ADR)]
- [API documentation]

### Code
- [Related existing code files]
- [Implementation examples to reference]
- [Reusable components]

### External Resources
- [Reference documents or tutorials]
- [Library documentation]
- [Related issues or discussions]

## Progress Log

### Work Log
```
[YYYY-MM-DD HH:MM] Task created
[Date] [Worker] [Work performed]
```

### Changes
- [Major changes and reasons]
- [Scope changes]
- [Priority adjustments]

## OUTPUT LOG

### Implementation Results
[Record actual implementation results upon completion]

### Test Results
[Test execution results and coverage]

### Review Comments
[Code review comments and improvements]

### Completion Verification
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Ready for deployment
```

### 4. Sprint Metadata Update

**Modify Sprint Meta File:**
- Open `S##_M##_sprint_meta.md` file
- Add new task to "Task List" section
- Update sprint statistics (total task count)
- Update last modified date

**Update Format:**
```markdown
## Task List

### In Progress
- [Existing tasks...]

### Pending  
- [ ] T##: [New task title] - Status: pending (Created: YYYY-MM-DD)
- [Existing pending tasks...]

### Completed
- [Completed tasks...]

## Sprint Statistics
- **Total Tasks**: [Previous count + 1]
- **Completed**: [Completed task count]
- **In Progress**: [In progress task count] 
- **Pending**: [Pending task count + 1]
```

### 5. Project Manifest Update

**Modify Manifest File:**
- Open `00_PROJECT_MANIFEST.md` file
- Record task addition activity in "Recent Activities" section
- Update "Project Statistics"
- Update "Last Updated" date

**Add Activity Record:**
```markdown
## Recent Activities

### [Current Date]
- ➕ New task added: T##_S##_M## - [Task Title]
- 📊 Sprint S## task count: [Previous count] → [New count]
```

### 6. Automatic Linking and Organization

**Inter-task Connections:**
- Add cross-references if related tasks exist
- Specify dependency relationships
- Link previous/next tasks for sequential tasks

**Git Integration:**
- Option to create Git issue simultaneously with task creation
- Suggest branch creation
- Provide commit message templates

### 7. Confirmation and Feedback

**Creation Result Confirmation:**
```
✅ Task addition completed!

📄 Generated file: T03_S02_M01_implement_user_auth.md
🏃 Sprint: S02 - User Management Feature Development
📋 Task: T03 - Implement User Authentication System
⏱️  Status: pending
🎯 Priority: high
⏰ Estimated time: 8 hours

📝 Next steps:
1. Open task file to review and modify details
2. Use /aiwf:do_task T03 to start work
3. If needed, use /aiwf:update_task_status T03 in_progress to change status

💡 Useful commands:
- /aiwf:list_sprint_tasks S02 - View sprint task list
- /aiwf:project_status - Check overall project status
- /aiwf:task_dependencies T03 - Manage task dependencies
```

**Validation and Cleanup:**
- Verify file creation completion
- Verify metadata updates
- Check file permissions and encoding
- Verify link integrity

### 8. Advanced Features (Optional)

**Template Customization:**
- Use sprint-specific task templates
- Customized templates by task type
- Auto-add project-standard sections

**Automatic Analysis:**
- Estimate task complexity
- Suggest references to similar previous tasks
- Predict resource and time requirements

**Collaboration Features:**
- Task assignment functionality
- Auto-assign reviewers
- Share notifications and updates

## Usage

```bash
# Basic task addition
/aiwf:add_sprint_task

# CLI command (future implementation)
aiwf sprint-task S02 "Implement user authentication system"
aiwf st S02 "API performance optimization" --priority high --time 6h
```

## Input Parameters

- **Sprint ID** (Required): Sprint identifier to add task to (e.g., S01, S02)
- **Task Title** (Required): Brief description of the task
- **Priority** (Optional): high, medium, low (default: medium)
- **Estimated Time** (Optional): Expected work time in hours
- **Category** (Optional): Task type classification

## Important Notes

- Cannot add tasks to already completed sprints
- Task titles don't need to be unique but should be clear
- Recommend immediately editing generated tasks to add details
- Consider breaking large tasks into multiple smaller tasks
- Consider sprint capacity and team resources when adding appropriate number of tasks

This command supports agile development processes and enables systematic task management and project tracking.
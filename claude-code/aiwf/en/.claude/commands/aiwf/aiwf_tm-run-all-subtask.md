# Intelligent Execution of All Tasks

Arguments: $ARGUMENTS

Intelligently analyzes and executes all project tasks (complete tasks or subtasks of specific tasks) in an optimized order.

## Intelligent Analysis and Execution

### Context Analysis

Before execution, analyze the following elements:

- **Task Dependencies**: Identify dependency relationships between tasks (parent-child, task-to-task)
- **Task Complexity**: Assess difficulty level and estimated time for each task
- **Current Status**: Identify in-progress tasks, blocked tasks, completed tasks
- **User Patterns**: Previous task execution methods and preferences
- **Project Priorities**: Importance from overall project perspective

### Smart Execution Strategy

Optimized execution based on context:

**Dependency-Based Execution**:

- Arrange tasks with correct dependencies
- Identify parallelizable tasks
- Prioritize dependency resolution for blocked tasks

**Complexity-Based Execution**:

- Prioritize simple tasks → Quick wins and momentum
- Prioritize complex tasks → Focus when complex tasks are easier to handle

**Time-Based Optimization**:

- Morning: Prioritize complex tasks
- Afternoon: Routine tasks or review tasks
- Evening: Finish tasks or documentation

**Priority-Based Execution**:

- Prioritize tasks from overall project perspective
- Prioritize tasks for milestone completion

## Workflow

### 1. Analyze the entire project

```bash
# Get all tasks
task-master get-tasks --with-subtasks

# Validate dependencies
task-master validate-dependencies

# Analyze complexity
task-master complexity-report
```

### 2. Determine execution mode

**Run the entire project**:

- Target all pending tasks
- Goal: Complete the entire project

**Run specific tasks and their subtasks**:

- Target specific tasks and their subtasks
- Goal: Complete the specific task

### 3. Determine intelligent execution order

```bash
# Find the next executable task
task-master next

# List all executable tasks (unblocked tasks)
task-master get-tasks --status=pending --with-subtasks
```

### 4. Optimized task execution

**Run the entire project loop**:

```bash
# Loop while there are executable tasks
while [ "$(task-master next)" != "No tasks available" ]; do
  CURRENT_TASK=$(task-master next --format=id)

  # Display task information
  echo "=== Executing: Task $CURRENT_TASK ==="
  task-master show $CURRENT_TASK

  # Check if there are subtasks
  if task-master show $CURRENT_TASK | grep -q "subtasks"; then
    echo "Starting subtasks..."
    # Execute subtasks sequentially
    for subtask in $(task-master show $CURRENT_TASK --subtasks-only --format=ids); do
      echo "--- Executing subtask $subtask ---"
      task-master show $subtask

      # Actual implementation logic
      echo "Implementing task..."

      # Mark as completed
      task-master set-status --id=$subtask --status=done
      echo "Subtask $subtask completed"
    done
  else
    # Run single task
    echo "Running single task..."

    # Actual implementation logic
    echo "Implementing task..."
  fi

  # Mark task as completed
  task-master set-status --id=$CURRENT_TASK --status=done
  echo "Task $CURRENT_TASK completed"
  echo ""
done

echo "All executable tasks completed!"
```

### 5. Track progress and learn

- Record execution patterns
- Learn from expected vs actual execution time
- Collect efficiency metrics
- Propose solutions for blocked

### 6. Analyze post-completion status

```bash
# Check overall project status
task-master get-tasks --status=all

# Check blocked tasks
task-master get-tasks --status=blocked,deferred

# Analyze project progress
echo "Analyzing project progress..."
```

## Learning Mode

This command learns execution patterns:

- **Optimize execution order**: Remember successful patterns
- **Improve time prediction**: Collect actual execution time data
- **Learn personal preferences**: Adapt to user's task style
- **Improve efficiency**: Identify high-efficiency workflows
- **Learn project patterns**: Identify optimal execution strategies for project types

## Usage

```bash
# Run all tasks in the entire project
/tm run-all-tasks

# Run specific tasks and their subtasks
/tm run-all-tasks <task-id>

# Specify execution strategy
/tm run-all-tasks --strategy=dependency   # Dependency-based
/tm run-all-tasks --strategy=complexity   # Complexity-based
/tm run-all-tasks --strategy=priority     # Priority-based
/tm run-all-tasks --strategy=time         # Time-based optimization

# Run tasks with specific status
/tm run-all-tasks --status=pending        # pending tasks only
/tm run-all-tasks --status=in-progress    # in-progress tasks only

# Dry run mode (show plan without actual execution)
/tm run-all-tasks --dry-run

# Interactive mode (confirm each task before execution)
/tm run-all-tasks --interactive
```

## Intelligent Features

### Automatic pause points

- Automatic pause on blocked tasks
- Suggest dependency resolution
- Propose alternative task paths

### Progress prediction

- Predict completion time based on remaining tasks
- Analyze daily/weekly goal achievement
- Predict project completion time

- **All tasks completed** → Congratulate project completion + Suggest next project
- **Some tasks blocked** → Suggest dependency resolution + Propose alternative task paths
- **Complex tasks remaining** → Suggest rest + Propose task splitting
- **Dependency issues** → Suggest dependency reconstruction

### Smart batching

- **Consider energy level**: Morning for complex tasks, afternoon for simple tasks
- **Minimize context switching**: Group similar tasks for continuous execution
- **Parallel processing opportunities**: Suggest concurrent execution of independent tasks

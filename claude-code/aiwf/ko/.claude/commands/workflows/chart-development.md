---
model: opus
---

차트구현 - 역할별 sub-agent 활용:

[Extended thinking: This workflow orchestrates multiple specialized agents to implement a complete feature from design to deployment. Each agent receives context from previous agents to ensure coherent implementation.]

Use the Task tool to delegate to specialized agents in sequence:

1. **Backend Architecture Design**
   - Use Task tool with subagent_type="backend-architect"
   - Prompt: "Design RESTful API and data model for: $ARGUMENTS. Include endpoint definitions, database schema, and service boundaries."
   - Save the API design and schema for next agents

2. **Chart Implementation**
   - Use Task tool with subagent_type="chart-visualization-expert"
   - Prompt: "Create chart implementation for: $ARGUMENTS. Use the API design from backend-architect: [include API endpoints and data models from step 1]"
   - Ensure chart components match the backend API contract

3. **Backend Build and Check**
   - Use Task tool with subagent_type="backend-build-fixer"
   - Prompt: "Build the project and fix any errors for: $ARGUMENTS. Run build commands for backend, perform linting, type checking, and resolve any compilation or runtime errors found."
   - Include build verification, error resolution, and code quality checks

4. **Frontend Build and Check**
   - Use Task tool with subagent_type="react-build-fixer"
   - Prompt: "Build the project and fix any errors for: $ARGUMENTS. Run build commands for frontend, perform linting, type checking, and resolve any compilation or runtime errors found."
   - Include build verification, error resolution, and code quality checks

Aggregate results from all agents and present a unified implementation plan.

Feature description: $ARGUMENTS

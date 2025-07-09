# Contributing to AIWF

Thank you for your interest in contributing to AIWF (AI Workflow Framework)! This guide will help you contribute effectively to the project.

[한국어로 보기](CONTRIBUTING.ko.md)

## Table of Contents

1. [Before Contributing](#before-contributing)
2. [Development Environment Setup](#development-environment-setup)
3. [How to Contribute](#how-to-contribute)
4. [Code Style Guide](#code-style-guide)
5. [Writing Tests](#writing-tests)
6. [Pull Request Guidelines](#pull-request-guidelines)
7. [Issue Reporting](#issue-reporting)
8. [Community Guidelines](#community-guidelines)

## Before Contributing

### Understanding the Project

AIWF is an NPM CLI package that installs the AI Workflow Framework integrated with Claude Code. Before contributing, please understand:

- **Purpose**: Deploy AI-driven development workflow framework
- **Target Users**: Claude Code, Cursor, and Windsurf users
- **Core Function**: Download and install framework from GitHub

### Code of Conduct

We follow these principles to create a respectful and inclusive environment:

- **Respect**: We respect all opinions and contributions
- **Inclusivity**: We welcome contributors from diverse backgrounds
- **Constructive Feedback**: We provide helpful and constructive criticism
- **Collaboration**: We work together to solve problems

## Development Environment Setup

### Prerequisites

- **Node.js**: 14.0.0 or higher
- **npm**: Installed with Node.js
- **Git**: Latest version

### Initial Setup

```bash
# 1. Fork the repository
# Fork https://github.com/aiwf/aiwf on GitHub

# 2. Clone locally
git clone https://github.com/YOUR_USERNAME/aiwf.git
cd aiwf

# 3. Add upstream remote
git remote add upstream https://github.com/aiwf/aiwf.git

# 4. Install dependencies
npm install

# 5. Verify development environment
node index.js --force  # Run local test
npm test               # Run tests
npm run lint          # Check code style
```

## How to Contribute

### 1. Issue-Based Contributions

The recommended way to contribute:

1. **Find an Issue**: Select from [GitHub Issues](https://github.com/aiwf/aiwf/issues)
2. **Assign Yourself**: Comment to express interest
3. **Create Branch**: Use format `feature/issue-number-brief-description`

### 2. Proposing New Features

To propose new features:

1. **Create Issue**: Use Feature Request template
2. **Join Discussion**: Discuss with community
3. **Start Development**: Begin after approval

### 3. Bug Fixes

If you found a bug:

1. **Check Issues**: Verify if already reported
2. **Create New Issue**: Use Bug Report template
3. **Provide Example**: Include minimal reproducible example

## Code Style Guide

### JavaScript Style

```javascript
// Good: Use ES6+ syntax
const apiUrl = "https://api.github.com";
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Avoid: var usage, callback hell
var oldUrl = "https://api.github.com";
function fetchDataOld(url, callback) {
  // Old pattern
}
```

### Naming Conventions

- **Variables/Functions**: camelCase (`fetchGitHubContent`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **File Names**: kebab-case (`github-api.js`)
- **Classes**: PascalCase (`GitHubClient`)

### Comment Guidelines

```javascript
/**
 * Fetches repository content from GitHub API.
 * @param {string} repoUrl - Repository URL
 * @param {string} path - Path to file/directory
 * @returns {Promise<Object>} API response data
 * @throws {Error} On network error or API limits
 */
async function fetchRepositoryContent(repoUrl, path) {
  // Input validation
  if (!repoUrl || !path) {
    throw new Error("Repository URL and path are required");
  }

  // API call implementation...
}
```

### ESLint and Prettier

The project uses ESLint and Prettier:

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

## Writing Tests

### Testing Philosophy

- **All new features** require tests
- **Bug fixes** should include tests that verify the fix
- **Don't break** existing tests

### Test Structure

```javascript
// tests/unit/github-api.test.js
import { jest } from "@jest/globals";
import { fetchGitHubContent } from "../../index.js";

describe("GitHub API functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchGitHubContent", () => {
    test("should fetch data successfully", async () => {
      // Given
      const mockUrl = "https://api.github.com/repos/test/repo";
      const expectedData = { name: "test-repo" };

      // When
      const result = await fetchGitHubContent(mockUrl);

      // Then
      expect(result).toEqual(expectedData);
    });

    test("should throw error for invalid URL", async () => {
      // Given & When & Then
      await expect(fetchGitHubContent("invalid-url")).rejects.toThrow(
        "Invalid URL"
      );
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Pull Request Guidelines

### Pre-PR Checklist

- [ ] Branch created from latest `main`
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Related issue linked if applicable
- [ ] Tests added for changes

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(cli): add GitHub API retry logic
fix(installer): fix backup file timestamp error
docs(readme): update installation guide
```

### PR Description Template

```markdown
## Summary of Changes

<!-- Brief description of what this PR changes -->

## Related Issues

<!-- Link related issues if any -->

Closes #123

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## How to Test

<!-- Describe how to test these changes -->

1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)

<!-- Include screenshots for visual changes -->

## Additional Notes

<!-- Any additional information for reviewers -->
```

### Code Review Process

1. **Automated Checks**: GitHub Actions run tests automatically
2. **Code Review**: Project maintainers review code
3. **Address Feedback**: Respond actively to review comments
4. **Approval & Merge**: Squash merge after approval

## Issue Reporting

### Bug Reports

Please include:

```markdown
## Bug Description

<!-- Clear and concise description of the bug -->

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

<!-- Description of expected behavior -->

## Actual Behavior

<!-- Description of what actually happened -->

## Environment

- OS: [e.g., macOS 12.0]
- Node.js version: [e.g., 18.0.0]
- aiwf version: [e.g., 1.0.0]

## Additional Context

<!-- Any additional information or screenshots -->
```

### Feature Requests

```markdown
## Feature Description

<!-- Description of the desired feature -->

## Problem Statement

<!-- Description of the problem this feature would solve -->

## Proposed Solution

<!-- Description of how you'd like it implemented -->

## Alternatives

<!-- Other solutions you've considered -->

## Additional Context

<!-- Any additional information or screenshots -->
```

## Community Guidelines

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Pull Requests**: Code review, technical discussions

### Asking Questions

Guidelines for good questions:

1. **Search First**: Check if already answered
2. **Be Specific**: Provide concrete situations over vague questions
3. **Reproducible Example**: Include minimal reproducible example
4. **Environment Info**: OS, Node.js version, aiwf version

### Answering Questions

When answering others' questions:

1. **Be Kind**: Explain in beginner-friendly terms
2. **Be Accurate**: Say "I don't know" if unsure
3. **Be Complete**: Provide complete solutions over partial answers

## Release Process

### Version Management

AIWF follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible new features
- **PATCH**: Backward-compatible bug fixes

### Release Schedule

- **Major Releases**: As needed (breaking changes)
- **Minor Releases**: Monthly or when major features complete
- **Patch Releases**: As needed for important bug fixes

## Tools and Resources

### Development Tools

- **IDE**: VS Code, Cursor, Windsurf (Claude Code support)
- **Terminal**: Modern terminal (zsh, fish, etc.)
- **Git GUI**: SourceTree, GitHub Desktop (optional)

### Learning Resources

- [Node.js Official Docs](https://nodejs.org/docs/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## Recognition and Thanks

Thank you to all contributors! Key contributors can be found at:

- [Contributors page](https://github.com/aiwf/aiwf/graphs/contributors)
- [Release notes](https://github.com/aiwf/aiwf/releases) mention contributors per release

---

If you have questions, feel free to [create an issue](https://github.com/aiwf/aiwf/issues/new) or join the [discussions](https://github.com/aiwf/aiwf/discussions)!

Let's build a better AIWF together! 🚀
/**
 * AIWF GitHub Integration
 * GitHub Issues와 Pull Requests 통합 관리
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { StateIndexManager } from './state/state-index.js';

export class GitHubIntegration {
  constructor() {
    this.projectRoot = null;
    this.aiwfPath = null;
    this.stateIndexManager = null;
  }

  /**
   * 초기화
   */
  async init() {
    this.projectRoot = await this.findProjectRoot();
    this.aiwfPath = path.join(this.projectRoot, '.aiwf');
    this.stateIndexManager = new StateIndexManager(this.aiwfPath);
  }

  async findProjectRoot(startDir = process.cwd()) {
    let currentDir = startDir;
    
    while (currentDir !== path.parse(currentDir).root) {
      try {
        const aiwfPath = path.join(currentDir, '.aiwf');
        await fs.access(aiwfPath);
        return currentDir;
      } catch {
        currentDir = path.dirname(currentDir);
      }
    }
    
    throw new Error('.aiwf directory not found. Are you in an AIWF project?');
  }

  /**
   * GitHub CLI 사용 가능 여부 확인
   */
  checkGitHubCLI() {
    try {
      execSync('gh --version', { stdio: 'ignore' });
      return true;
    } catch {
      throw new Error('GitHub CLI (gh) is not installed. Please install it first: https://cli.github.com/');
    }
  }

  /**
   * 태스크에서 GitHub 이슈 생성
   */
  async createIssue(taskId) {
    const spinner = ora('Creating GitHub issue...').start();
    
    try {
      await this.init();
      this.checkGitHubCLI();
      
      // 상태 인덱스에서 태스크 정보 로드
      const stateIndex = await this.stateIndexManager.loadIndex();
      if (!stateIndex) {
        throw new Error('State index not found. Run "aiwf state update" first.');
      }
      
      const task = stateIndex.tasks[taskId];
      if (!task) {
        throw new Error(`Task ${taskId} not found in state index.`);
      }
      
      spinner.text = 'Generating issue template...';
      
      // 이슈 템플릿 생성
      const issueBody = this.generateIssueTemplate(task);
      const issueTitle = `${taskId}: ${task.title}`;
      
      // GitHub CLI로 이슈 생성
      spinner.text = 'Creating issue on GitHub...';
      const labels = this.generateLabels(task);
      
      const createCommand = [
        'gh', 'issue', 'create',
        '--title', `"${issueTitle}"`,
        '--body', `"${issueBody}"`,
        '--label', `"${labels.join(',')}"`,
        '--assignee', '@me'
      ].join(' ');
      
      const result = execSync(createCommand, { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      // 이슈 URL 추출
      const issueUrl = result.trim();
      const issueNumber = this.extractIssueNumber(issueUrl);
      
      // 태스크 파일에 GitHub 이슈 정보 추가
      if (task.file_path) {
        await this.updateTaskWithIssue(task.file_path, issueNumber, issueUrl);
      }
      
      spinner.succeed(`GitHub issue created successfully: ${issueUrl}`);
      
      console.log(chalk.cyan('\n📋 Issue Details:'));
      console.log(`   Title: ${issueTitle}`);
      console.log(`   URL: ${issueUrl}`);
      console.log(`   Labels: ${labels.join(', ')}`);
      
    } catch (error) {
      spinner.fail(`Failed to create GitHub issue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pull Request 생성
   */
  async createPullRequest(taskId) {
    const spinner = ora('Creating pull request...').start();
    
    try {
      await this.init();
      this.checkGitHubCLI();
      
      // 현재 브랜치 확인
      const currentBranch = execSync('git branch --show-current', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      }).trim();
      
      if (currentBranch === 'main' || currentBranch === 'master') {
        throw new Error('Cannot create PR from main/master branch. Please create a feature branch first.');
      }
      
      spinner.text = 'Checking branch status...';
      
      // 변경사항 확인
      const diffStat = execSync('git diff main...HEAD --stat', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      if (!diffStat.trim()) {
        throw new Error('No changes found between current branch and main.');
      }
      
      // 커밋 히스토리 확인
      const commits = execSync('git log main..HEAD --oneline', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      spinner.text = 'Generating PR template...';
      
      // PR 템플릿 생성
      const prBody = this.generatePRTemplate(taskId, commits, diffStat);
      const prTitle = taskId ? `${taskId}: Complete task implementation` : `Complete feature implementation`;
      
      // GitHub CLI로 PR 생성
      spinner.text = 'Creating pull request on GitHub...';
      
      const createCommand = [
        'gh', 'pr', 'create',
        '--title', `"${prTitle}"`,
        '--body', `"${prBody}"`,
        '--base', 'main',
        '--head', currentBranch
      ].join(' ');
      
      const result = execSync(createCommand, { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      const prUrl = result.trim();
      
      spinner.succeed(`Pull request created successfully: ${prUrl}`);
      
      console.log(chalk.cyan('\n🔀 Pull Request Details:'));
      console.log(`   Title: ${prTitle}`);
      console.log(`   URL: ${prUrl}`);
      console.log(`   Base: main ← ${currentBranch}`);
      
    } catch (error) {
      spinner.fail(`Failed to create pull request: ${error.message}`);
      throw error;
    }
  }

  /**
   * GitHub 이슈와 AIWF 태스크 동기화
   */
  async syncIssues() {
    const spinner = ora('Syncing GitHub issues...').start();
    
    try {
      await this.init();
      this.checkGitHubCLI();
      
      // GitHub에서 이슈 목록 가져오기
      spinner.text = 'Fetching GitHub issues...';
      const issuesJson = execSync('gh issue list --json number,title,state,labels,assignees', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      const issues = JSON.parse(issuesJson);
      
      // AIWF 태스크와 연결된 이슈들 확인
      const stateIndex = await this.stateIndexManager.loadIndex();
      if (!stateIndex) {
        throw new Error('State index not found. Run "aiwf state update" first.');
      }
      
      spinner.text = 'Analyzing synchronization...';
      
      let syncCount = 0;
      const syncResults = [];
      
      for (const issue of issues) {
        // 이슈 제목에서 태스크 ID 추출
        const taskIdMatch = issue.title.match(/^([A-Z]\d+):/);
        if (taskIdMatch) {
          const taskId = taskIdMatch[1];
          const task = stateIndex.tasks[taskId];
          
          if (task) {
            // 상태 동기화 확인
            const issueState = issue.state.toLowerCase();
            const taskState = task.status;
            
            let needsSync = false;
            if (issueState === 'closed' && taskState !== 'completed') {
              needsSync = true;
            } else if (issueState === 'open' && taskState === 'completed') {
              needsSync = true;
            }
            
            if (needsSync) {
              syncResults.push({
                taskId,
                issueNumber: issue.number,
                issueState,
                taskState,
                needsSync
              });
              syncCount++;
            }
          }
        }
      }
      
      spinner.succeed(`GitHub sync completed. Found ${syncCount} items needing attention.`);
      
      if (syncResults.length > 0) {
        console.log(chalk.cyan('\n🔄 Sync Status:'));
        for (const result of syncResults) {
          console.log(`   ${result.taskId}: Issue #${result.issueNumber} (${result.issueState}) ↔ Task (${result.taskState})`);
        }
        console.log(chalk.yellow('\nNote: Manual review recommended for state mismatches.'));
      } else {
        console.log(chalk.green('\n✅ All GitHub issues are in sync with AIWF tasks.'));
      }
      
    } catch (error) {
      spinner.fail(`Failed to sync GitHub issues: ${error.message}`);
      throw error;
    }
  }

  /**
   * 이슈 템플릿 생성
   */
  generateIssueTemplate(task) {
    return `## 📋 Task: ${task.title}

### Description
${task.description || 'No description provided.'}

### Acceptance Criteria
- [ ] Task implementation completed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed

### Additional Information
- **Task ID**: ${task.id}
- **Sprint**: ${task.sprint_id || 'N/A'}
- **Priority**: ${task.priority_score?.toFixed(2) || 'N/A'}
- **Estimated Hours**: ${task.estimated_hours || 'N/A'}
- **Complexity**: ${task.complexity || 'N/A'}

### Task File
\`${task.file_path || 'N/A'}\`

---
*This issue was automatically created by AIWF*`;
  }

  /**
   * PR 템플릿 생성
   */
  generatePRTemplate(taskId, commits, diffStat) {
    return `## 🎯 Overview
${taskId ? `Completed implementation of ${taskId}.` : 'Completed feature implementation.'}

## 📝 Changes
\`\`\`
${commits}
\`\`\`

## 📊 Changed Files
\`\`\`
${diffStat}
\`\`\`

## ✅ Checklist
- [ ] Tests pass
- [ ] Code review completed
- [ ] Documentation updated

## 🔗 Related Information
${taskId ? `- Related Task: ${taskId}` : '- No specific task linked'}

---
*This pull request was automatically created by AIWF*`;
  }

  /**
   * 태스크 타입과 상태에 따른 라벨 생성
   */
  generateLabels(task) {
    const labels = ['aiwf-task'];
    
    if (task.type) {
      labels.push(task.type);
    }
    
    if (task.sprint_id && task.sprint_id !== 'general') {
      labels.push('sprint-task');
    }
    
    if (task.priority_score && task.priority_score > 0.8) {
      labels.push('high-priority');
    }
    
    if (task.complexity === 'high' || task.complexity === 'very-high') {
      labels.push('complex');
    }
    
    return labels;
  }

  /**
   * 이슈 URL에서 이슈 번호 추출
   */
  extractIssueNumber(issueUrl) {
    const match = issueUrl.match(/\/issues\/(\d+)$/);
    return match ? match[1] : null;
  }

  /**
   * 태스크 파일에 GitHub 이슈 정보 추가
   */
  async updateTaskWithIssue(filePath, issueNumber, issueUrl) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // 이미 GitHub 정보가 있는지 확인
      if (content.includes('github_issue:') || content.includes('GitHub Issue:')) {
        return; // 이미 있으면 업데이트하지 않음
      }
      
      // YAML frontmatter가 있는지 확인
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      let updatedContent;
      if (frontmatterMatch) {
        // YAML frontmatter에 추가
        const frontmatter = frontmatterMatch[1];
        const body = frontmatterMatch[2];
        const updatedFrontmatter = `${frontmatter}\ngithub_issue: ${issueNumber}\ngithub_url: ${issueUrl}`;
        updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
      } else {
        // 파일 시작 부분에 GitHub 정보 추가
        updatedContent = `<!-- GitHub Issue: #${issueNumber} - ${issueUrl} -->\n\n${content}`;
      }
      
      await fs.writeFile(filePath, updatedContent, 'utf8');
    } catch (error) {
      console.warn(`Failed to update task file with GitHub issue: ${error.message}`);
    }
  }
}
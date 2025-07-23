#!/usr/bin/env node

/**
 * AIWF State Management Command
 * 중앙 상태 인덱스를 통한 프로젝트 상태 관리
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';

export default class StateCommand {
  constructor() {
    this.stateFile = 'task-state-index.json';
    this.workflowRulesFile = 'workflow-rules.json';
    this.projectRoot = null;
    this.aiwfPath = null;
    this.workflowRules = null;
  }

  async execute(args) {
    const subcommand = args[0] || 'show';
    
    try {
      // 프로젝트 루트 찾기
      this.projectRoot = await this.findProjectRoot();
      this.aiwfPath = path.join(this.projectRoot, '.aiwf');
      
      switch (subcommand) {
        case 'update':
          await this.updateStateIndex();
          break;
        case 'show':
          await this.showState();
          break;
        case 'focus':
          await this.focusTask(args[1]);
          break;
        case 'complete':
          await this.completeTask(args[1]);
          break;
        case 'next':
          await this.suggestNext();
          break;
        case 'init':
          await this.initStateIndex();
          break;
        case 'validate':
          await this.validateCommand();
          break;
        default:
          console.error(chalk.red(`Unknown subcommand: ${subcommand}`));
          this.showHelp();
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
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

  async initStateIndex() {
    const spinner = ora('Initializing state index...').start();
    
    try {
      const indexPath = path.join(this.aiwfPath, this.stateFile);
      const exists = await this.fileExists(indexPath);
      
      if (exists) {
        spinner.warn('State index already exists');
        return;
      }

      const initialState = {
        version: '1.0.0',
        last_updated: new Date().toISOString(),
        last_updated_by: 'aiwf-state-init',
        project_info: {
          name: path.basename(this.projectRoot),
          current_milestone: null,
          current_sprint: null,
          phase: 'planning'
        },
        current_focus: {
          primary_task: null,
          secondary_tasks: [],
          blocked_tasks: [],
          last_worked_on: null,
          session_notes: ''
        },
        tasks: {},
        sprint_summary: {},
        next_actions: [],
        ai_context: {
          last_session: new Date().toISOString(),
          session_count: 0,
          learned_patterns: {},
          working_hours: {}
        },
        metrics: {
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          pending_tasks: 0,
          blocked_tasks: 0,
          overall_progress: 0
        }
      };

      await fs.writeFile(indexPath, JSON.stringify(initialState, null, 2));
      spinner.succeed('State index initialized successfully');
    } catch (error) {
      spinner.fail(`Failed to initialize state index: ${error.message}`);
      throw error;
    }
  }

  async updateStateIndex() {
    const spinner = ora('Updating state index...').start();
    
    try {
      const indexPath = path.join(this.aiwfPath, this.stateFile);
      let stateIndex = await this.loadStateIndex();
      
      if (!stateIndex) {
        spinner.info('State index not found. Creating new one...');
        await this.initStateIndex();
        stateIndex = await this.loadStateIndex();
      }

      // 스프린트 폴더들 스캔
      const sprintDirs = await glob('03_SPRINTS/S*/', { cwd: this.aiwfPath });
      let totalTasks = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let pendingTasks = 0;
      let blockedTasks = 0;

      // 각 스프린트 폴더에서 태스크 파일들 스캔
      for (const sprintDir of sprintDirs) {
        const sprintPath = path.join(this.aiwfPath, sprintDir);
        const sprintId = path.basename(sprintDir).split('_')[0];
        
        // 스프린트 메타 파일 읽기
        const metaFiles = await glob('*_sprint_meta.md', { cwd: sprintPath });
        let sprintName = sprintDir;
        let sprintStatus = 'active';
        
        if (metaFiles.length > 0) {
          const metaContent = await fs.readFile(path.join(sprintPath, metaFiles[0]), 'utf-8');
          const nameMatch = metaContent.match(/^#\s+(.+)$/m);
          if (nameMatch) sprintName = nameMatch[1];
          
          // 스프린트 상태 확인
          if (metaContent.includes('상태: 완료') || metaContent.includes('Status: Completed')) {
            sprintStatus = 'completed';
          } else if (metaContent.includes('상태: 계획') || metaContent.includes('Status: Planning')) {
            sprintStatus = 'planning';
          }
        }

        // 태스크 파일들 스캔
        const taskFiles = await glob('T*.md', { cwd: sprintPath });
        const sprintTasks = taskFiles.filter(f => !f.includes('_template'));
        
        let sprintCompleted = 0;
        let sprintInProgress = 0;
        let sprintPending = 0;
        
        for (const taskFile of sprintTasks) {
          totalTasks++;
          const taskPath = path.join(sprintPath, taskFile);
          const taskContent = await fs.readFile(taskPath, 'utf-8');
          
          // 태스크 ID 추출
          const taskId = taskFile.replace('.md', '').split('_').slice(0, 3).join('_');
          
          // 태스크 정보 파싱
          const titleMatch = taskContent.match(/^#\s+T\d+:\s+(.+)$/m);
          const statusMatch = taskContent.match(/\*\*상태\*\*:\s*(\w+)|\*\*Status\*\*:\s*(\w+)/i);
          const milestoneMatch = taskContent.match(/\*\*마일스톤\*\*:\s*(M\d+)|\*\*Milestone\*\*:\s*(M\d+)/i);
          
          const title = titleMatch ? titleMatch[1] : taskFile;
          const status = statusMatch ? (statusMatch[1] || statusMatch[2]).toLowerCase() : 'pending';
          const milestone = milestoneMatch ? (milestoneMatch[1] || milestoneMatch[2]) : 'M01';
          
          // 태스크 상태 카운트
          switch (status) {
            case 'completed':
            case 'done':
              completedTasks++;
              sprintCompleted++;
              break;
            case 'in_progress':
            case 'in-progress':
            case 'active':
              inProgressTasks++;
              sprintInProgress++;
              if (!stateIndex.current_focus.primary_task) {
                stateIndex.current_focus.primary_task = taskId;
              }
              break;
            case 'blocked':
              blockedTasks++;
              break;
            default:
              pendingTasks++;
              sprintPending++;
          }
          
          // 태스크 정보 업데이트
          stateIndex.tasks[taskId] = {
            id: taskId,
            title: title,
            status: status,
            sprint: sprintId,
            milestone: milestone,
            location: path.relative(this.projectRoot, taskPath),
            last_updated: new Date().toISOString()
          };
          
          // OUTPUT LOG 확인
          if (taskContent.includes('## OUTPUT LOG')) {
            const outputSection = taskContent.split('## OUTPUT LOG')[1];
            if (outputSection.includes('✅') || outputSection.includes('완료')) {
              stateIndex.tasks[taskId].status = 'completed';
            }
          }
        }
        
        // 스프린트 요약 업데이트
        stateIndex.sprint_summary[sprintId] = {
          name: sprintName,
          status: sprintStatus,
          total_tasks: sprintTasks.length,
          completed_tasks: sprintCompleted,
          in_progress_tasks: sprintInProgress,
          pending_tasks: sprintPending,
          completion_rate: sprintTasks.length > 0 ? Math.round((sprintCompleted / sprintTasks.length) * 100) : 0
        };
      }

      // 현재 마일스톤/스프린트 찾기
      const manifestPath = path.join(this.aiwfPath, '00_PROJECT_MANIFEST.md');
      if (await this.fileExists(manifestPath)) {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const currentMilestoneMatch = manifestContent.match(/\*\*현재 마일스톤\*\*:\s*(M\d+)|\*\*Current Milestone\*\*:\s*(M\d+)/);
        const currentSprintMatch = manifestContent.match(/\*\*활성 스프린트\*\*:\s*(S\d+)|\*\*Active Sprint\*\*:\s*(S\d+)/);
        
        if (currentMilestoneMatch) {
          stateIndex.project_info.current_milestone = currentMilestoneMatch[1] || currentMilestoneMatch[2];
        }
        if (currentSprintMatch) {
          stateIndex.project_info.current_sprint = currentSprintMatch[1] || currentSprintMatch[2];
        }
      }

      // 메트릭스 업데이트
      stateIndex.metrics = {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        pending_tasks: pendingTasks,
        blocked_tasks: blockedTasks,
        overall_progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };

      // 워크플로우 규칙 로드
      if (!this.workflowRules) {
        this.workflowRules = await this.loadWorkflowRules();
      }

      // 의존성 분석
      const dependencies = await this.analyzeDependencies(stateIndex);
      
      // 다음 액션 제안을 우선순위 기반으로 생성
      stateIndex.next_actions = [];
      const taskPriorities = [];
      
      // 모든 태스크의 우선순위 계산
      Object.values(stateIndex.tasks).forEach(task => {
        // 의존성 정보 추가
        task.dependencies = dependencies[task.id]?.dependsOn || [];
        task.blockedBy = dependencies[task.id]?.blockedBy || [];
        task.blocks = dependencies[task.id]?.blocks || [];
        
        // 우선순위 계산
        const priority = this.calculateTaskPriority(task, stateIndex);
        taskPriorities.push({ task, priority, dependencies: dependencies[task.id] });
      });
      
      // 우선순위로 정렬
      taskPriorities.sort((a, b) => b.priority - a.priority);
      
      // 진행 중인 태스크 우선
      taskPriorities.forEach(({ task, priority }) => {
        if (task.status === 'in_progress') {
          stateIndex.next_actions.push({
            priority: 'high',
            score: priority,
            action: `Continue working on ${task.title}`,
            task_id: task.id,
            reason: 'Already in progress',
            estimated_time: '2-4 hours',
            blockedBy: task.blockedBy
          });
        }
      });
      
      // 차단되지 않은 대기 중인 태스크 추가
      taskPriorities.forEach(({ task, priority }) => {
        if (task.status === 'pending' && 
            task.sprint === stateIndex.project_info.current_sprint &&
            task.blockedBy.length === 0) {
          stateIndex.next_actions.push({
            priority: priority >= 70 ? 'high' : priority >= 40 ? 'medium' : 'low',
            score: priority,
            action: `Start ${task.title}`,
            task_id: task.id,
            reason: task.blocks.length > 0 ? `Blocks ${task.blocks.length} other tasks` : 'Ready to start',
            estimated_time: '4-8 hours',
            dependencies: task.dependencies
          });
        }
      });
      
      // 차단된 태스크 정보
      taskPriorities.forEach(({ task, priority }) => {
        if (task.status === 'pending' && task.blockedBy.length > 0) {
          stateIndex.next_actions.push({
            priority: 'blocked',
            score: priority,
            action: `Blocked: ${task.title}`,
            task_id: task.id,
            reason: `Waiting for: ${task.blockedBy.join(', ')}`,
            blockedBy: task.blockedBy
          });
        }
      });
      
      // 워크플로우 검증
      const validation = await this.validateWorkflow(stateIndex);
      stateIndex.workflow_validation = validation;

      // 타임스탬프 업데이트
      stateIndex.last_updated = new Date().toISOString();
      stateIndex.last_updated_by = 'aiwf-state-update';

      // 저장
      await fs.writeFile(indexPath, JSON.stringify(stateIndex, null, 2));
      
      spinner.succeed(`State index updated: ${totalTasks} tasks tracked`);
      console.log(chalk.green(`  ✅ Completed: ${completedTasks}`));
      console.log(chalk.yellow(`  🔄 In Progress: ${inProgressTasks}`));
      console.log(chalk.blue(`  ⏳ Pending: ${pendingTasks}`));
      console.log(chalk.red(`  ❌ Blocked: ${blockedTasks}`));
      console.log(chalk.cyan(`  📊 Overall Progress: ${stateIndex.metrics.overall_progress}%`));
      
    } catch (error) {
      spinner.fail(`Failed to update state index: ${error.message}`);
      throw error;
    }
  }

  async showState() {
    try {
      const stateIndex = await this.loadStateIndex();
      if (!stateIndex) {
        console.log(chalk.yellow('No state index found. Run "aiwf state init" or "aiwf state update" first.'));
        return;
      }

      console.log(chalk.bold('\n🏗️  AIWF Project State\n'));
      
      // 프로젝트 정보
      console.log(chalk.cyan('📋 Project Information:'));
      console.log(`  Name: ${stateIndex.project_info.name}`);
      console.log(`  Current Milestone: ${stateIndex.project_info.current_milestone || 'None'}`);
      console.log(`  Active Sprint: ${stateIndex.project_info.current_sprint || 'None'}`);
      console.log(`  Phase: ${stateIndex.project_info.phase}`);
      console.log(`  Last Updated: ${new Date(stateIndex.last_updated).toLocaleString()}`);
      
      // 현재 포커스
      console.log(chalk.yellow('\n🎯 Current Focus:'));
      if (stateIndex.current_focus.primary_task) {
        const task = stateIndex.tasks[stateIndex.current_focus.primary_task];
        if (task) {
          console.log(`  Primary Task: ${task.id} - ${task.title}`);
          console.log(`  Status: ${task.status}`);
        }
      } else {
        console.log('  No task currently in focus');
      }
      
      // 메트릭스
      console.log(chalk.green('\n📊 Metrics:'));
      const m = stateIndex.metrics;
      console.log(`  Total Tasks: ${m.total_tasks}`);
      console.log(`  Completed: ${m.completed_tasks} (${Math.round((m.completed_tasks/m.total_tasks)*100) || 0}%)`);
      console.log(`  In Progress: ${m.in_progress_tasks}`);
      console.log(`  Pending: ${m.pending_tasks}`);
      console.log(`  Blocked: ${m.blocked_tasks}`);
      
      // 진행률 바
      const progressBar = this.createProgressBar(m.overall_progress);
      console.log(`\n  Overall Progress: ${progressBar} ${m.overall_progress}%`);
      
      // 다음 액션
      if (stateIndex.next_actions.length > 0) {
        console.log(chalk.magenta('\n🚀 Next Actions:'));
        stateIndex.next_actions.slice(0, 3).forEach((action, i) => {
          const priority = action.priority === 'high' ? '🔴' : action.priority === 'medium' ? '🟡' : '🟢';
          console.log(`  ${i + 1}. ${priority} ${action.action} (${action.estimated_time})`);
        });
      }
      
      // 스프린트 요약
      const activeSprints = Object.entries(stateIndex.sprint_summary)
        .filter(([_, sprint]) => sprint.status === 'active');
      
      if (activeSprints.length > 0) {
        console.log(chalk.blue('\n📅 Active Sprints:'));
        activeSprints.forEach(([id, sprint]) => {
          const sprintProgress = this.createProgressBar(sprint.completion_rate);
          console.log(`  ${id}: ${sprint.name}`);
          console.log(`    Progress: ${sprintProgress} ${sprint.completion_rate}%`);
          console.log(`    Tasks: ${sprint.completed_tasks}/${sprint.total_tasks} completed`);
        });
      }
      
      console.log('');
    } catch (error) {
      console.error(chalk.red(`Failed to show state: ${error.message}`));
      throw error;
    }
  }

  async focusTask(taskId) {
    if (!taskId) {
      console.error(chalk.red('Please provide a task ID'));
      return;
    }

    const spinner = ora(`Setting focus to ${taskId}...`).start();
    
    try {
      const stateIndex = await this.loadStateIndex();
      if (!stateIndex) {
        spinner.fail('No state index found. Run "aiwf state update" first.');
        return;
      }

      if (!stateIndex.tasks[taskId]) {
        spinner.fail(`Task ${taskId} not found in state index.`);
        return;
      }

      const task = stateIndex.tasks[taskId];
      stateIndex.current_focus.primary_task = taskId;
      stateIndex.current_focus.last_worked_on = taskId;
      stateIndex.current_focus.session_notes = `Focused on ${task.title}`;
      
      // AI 컨텍스트 업데이트
      stateIndex.ai_context.last_session = new Date().toISOString();
      stateIndex.ai_context.session_count++;

      await this.saveStateIndex(stateIndex);
      
      spinner.succeed(`Focus set to ${taskId}: ${task.title}`);
      console.log(chalk.cyan(`\n📍 Task Location: ${task.location}`));
      console.log(chalk.yellow(`📊 Current Status: ${task.status}`));
      
      // 관련 태스크 표시
      const relatedTasks = Object.values(stateIndex.tasks)
        .filter(t => t.sprint === task.sprint && t.id !== taskId && t.status !== 'completed');
      
      if (relatedTasks.length > 0) {
        console.log(chalk.dim('\n📎 Related tasks in same sprint:'));
        relatedTasks.forEach(t => {
          console.log(chalk.dim(`   - ${t.id}: ${t.title} (${t.status})`));
        });
      }
    } catch (error) {
      spinner.fail(`Failed to set focus: ${error.message}`);
      throw error;
    }
  }

  async completeTask(taskId) {
    if (!taskId) {
      console.error(chalk.red('Please provide a task ID'));
      return;
    }

    const spinner = ora(`Marking ${taskId} as completed...`).start();
    
    try {
      const stateIndex = await this.loadStateIndex();
      if (!stateIndex) {
        spinner.fail('No state index found. Run "aiwf state update" first.');
        return;
      }

      if (!stateIndex.tasks[taskId]) {
        spinner.fail(`Task ${taskId} not found in state index.`);
        return;
      }

      const task = stateIndex.tasks[taskId];
      const previousStatus = task.status;
      
      // 태스크 상태 업데이트
      task.status = 'completed';
      task.completed = new Date().toISOString();
      
      // 메트릭스 업데이트
      if (previousStatus !== 'completed') {
        stateIndex.metrics.completed_tasks++;
        if (previousStatus === 'in_progress') {
          stateIndex.metrics.in_progress_tasks--;
        } else if (previousStatus === 'pending') {
          stateIndex.metrics.pending_tasks--;
        }
        
        // 전체 진행률 재계산
        stateIndex.metrics.overall_progress = Math.round(
          (stateIndex.metrics.completed_tasks / stateIndex.metrics.total_tasks) * 100
        );
      }
      
      // 현재 포커스가 완료된 태스크였다면 비우기
      if (stateIndex.current_focus.primary_task === taskId) {
        stateIndex.current_focus.primary_task = null;
        stateIndex.current_focus.session_notes = `Completed ${task.title}`;
      }
      
      // 스프린트 요약 업데이트
      const sprint = stateIndex.sprint_summary[task.sprint];
      if (sprint && previousStatus !== 'completed') {
        sprint.completed_tasks++;
        sprint.completion_rate = Math.round(
          (sprint.completed_tasks / sprint.total_tasks) * 100
        );
        
        if (previousStatus === 'in_progress') {
          sprint.in_progress_tasks--;
        } else if (previousStatus === 'pending') {
          sprint.pending_tasks--;
        }
      }

      await this.saveStateIndex(stateIndex);
      
      spinner.succeed(`Task ${taskId} marked as completed!`);
      console.log(chalk.green(`\n✅ ${task.title}`));
      console.log(chalk.cyan(`📊 Sprint ${task.sprint} progress: ${sprint.completion_rate}%`));
      console.log(chalk.cyan(`📈 Overall progress: ${stateIndex.metrics.overall_progress}%`));
      
      // 다음 추천 태스크
      await this.suggestNext();
      
    } catch (error) {
      spinner.fail(`Failed to complete task: ${error.message}`);
      throw error;
    }
  }

  async suggestNext() {
    try {
      const stateIndex = await this.loadStateIndex();
      if (!stateIndex) {
        console.log(chalk.yellow('No state index found. Run "aiwf state update" first.'));
        return;
      }

      if (!this.workflowRules) {
        this.workflowRules = await this.loadWorkflowRules();
      }

      console.log(chalk.bold('\n🎯 Workflow-Based Next Actions:\n'));
      
      // 워크플로우 검증 결과 표시
      if (stateIndex.workflow_validation) {
        const { errors, warnings, suggestions } = stateIndex.workflow_validation;
        
        if (errors.length > 0) {
          console.log(chalk.red('❌ Workflow Errors:'));
          errors.forEach(error => {
            console.log(`  - ${error.message}`);
          });
          console.log('');
        }
        
        if (suggestions.length > 0) {
          console.log(chalk.yellow('💡 Workflow Suggestions:'));
          suggestions.forEach(suggestion => {
            console.log(`  - ${suggestion.message}`);
          });
          console.log('');
        }
      }
      
      // 우선순위 기반 액션 표시
      const actions = stateIndex.next_actions || [];
      const inProgress = actions.filter(a => a.task_id && stateIndex.tasks[a.task_id]?.status === 'in_progress');
      const ready = actions.filter(a => a.priority !== 'blocked' && !inProgress.find(ip => ip.task_id === a.task_id));
      const blocked = actions.filter(a => a.priority === 'blocked');
      
      if (inProgress.length > 0) {
        console.log(chalk.yellow('🔄 Continue In-Progress Tasks:'));
        inProgress.forEach(action => {
          const task = stateIndex.tasks[action.task_id];
          console.log(`  ${chalk.yellow('→')} ${task.id}: ${task.title}`);
          console.log(chalk.dim(`     Priority Score: ${action.score}/100`));
          console.log(chalk.dim(`     Location: ${task.location}`));
          if (task.blocks?.length > 0) {
            console.log(chalk.cyan(`     🔗 Blocks: ${task.blocks.join(', ')}`));
          }
        });
      }
      
      if (ready.length > 0) {
        console.log(chalk.blue('\n📋 Ready to Start (Priority Order):'));
        ready.slice(0, 5).forEach((action, i) => {
          const task = stateIndex.tasks[action.task_id];
          const priorityIcon = action.priority === 'high' ? '🔴' : action.priority === 'medium' ? '🟡' : '🟢';
          console.log(`  ${i + 1}. ${priorityIcon} ${task.id}: ${task.title}`);
          console.log(chalk.dim(`     Priority Score: ${action.score}/100 - ${action.reason}`));
          console.log(chalk.dim(`     Location: ${task.location}`));
          if (task.blocks?.length > 0) {
            console.log(chalk.cyan(`     🔗 Unblocks: ${task.blocks.join(', ')}`));
          }
        });
      }
      
      if (blocked.length > 0) {
        console.log(chalk.red('\n⛔ Blocked Tasks:'));
        blocked.slice(0, 3).forEach(action => {
          const task = stateIndex.tasks[action.task_id];
          console.log(`  ❌ ${task.id}: ${task.title}`);
          console.log(chalk.dim(`     ${action.reason}`));
          console.log(chalk.dim(`     Priority Score: ${action.score}/100 (when unblocked)`));
        });
      }
      
      // 병렬 작업 기회 식별
      if (this.workflowRules.ai_behavior.suggest_parallelization && ready.length >= 2) {
        const parallelizable = ready.filter(a => {
          const task = stateIndex.tasks[a.task_id];
          // 서로 의존하지 않는 태스크 찾기
          return !ready.some(other => 
            other.task_id !== a.task_id && 
            (task.dependencies.includes(other.task_id) || 
             stateIndex.tasks[other.task_id].dependencies.includes(task.id))
          );
        });
        
        if (parallelizable.length >= 2) {
          console.log(chalk.magenta('\n⚡ Parallel Work Opportunity:'));
          console.log('  These tasks can be worked on simultaneously:');
          parallelizable.slice(0, 3).forEach(action => {
            const task = stateIndex.tasks[action.task_id];
            console.log(`  - ${task.id}: ${task.title}`);
          });
        }
      }
      
      // 스프린트 전환 조건 확인
      const currentSprint = stateIndex.project_info.current_sprint;
      if (currentSprint && stateIndex.sprint_summary[currentSprint]) {
        const sprint = stateIndex.sprint_summary[currentSprint];
        
        if (sprint.completion_rate === 100) {
          console.log(chalk.green(`\n🎉 Sprint ${currentSprint} Complete!`));
          console.log('  Next actions:');
          console.log('  1. Run sprint review: aiwf sprint review');
          console.log('  2. Transition to next sprint: aiwf transition sprint');
          console.log('  3. Update project documentation');
        } else if (sprint.completion_rate >= 80) {
          console.log(chalk.yellow(`\n📊 Sprint ${currentSprint} is ${sprint.completion_rate}% complete`));
          console.log('  Consider:');
          console.log('  - Preparing next sprint tasks');
          console.log('  - Reviewing remaining tasks');
          console.log('  - Planning sprint transition');
        }
      }
      
      console.log(chalk.dim('\n💡 Commands:'));
      console.log(chalk.dim('  Start task: aiwf state focus <task-id>'));
      console.log(chalk.dim('  Update state: aiwf state update'));
      console.log(chalk.dim('  Validate workflow: aiwf validate workflow'));
      
    } catch (error) {
      console.error(chalk.red(`Failed to suggest next actions: ${error.message}`));
      throw error;
    }
  }

  async loadStateIndex() {
    try {
      const indexPath = path.join(this.aiwfPath, this.stateFile);
      const exists = await this.fileExists(indexPath);
      
      if (!exists) {
        return null;
      }
      
      const content = await fs.readFile(indexPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load state index: ${error.message}`);
    }
  }

  async loadWorkflowRules() {
    try {
      const rulesPath = path.join(this.aiwfPath, this.workflowRulesFile);
      const exists = await this.fileExists(rulesPath);
      
      if (!exists) {
        // 기본 워크플로우 규칙 생성
        const defaultRules = {
          version: '1.0.0',
          hierarchy: {
            milestone: {
              contains: 'sprints',
              completion_rule: 'all_sprints_completed',
              transition_rule: 'manual_review_required'
            },
            sprint: {
              contains: 'tasks',
              completion_rule: 'all_tasks_completed',
              transition_rule: 'auto_when_complete',
              preparation_rule: '80_percent_trigger'
            },
            task: {
              completion_rule: 'acceptance_criteria_met',
              transition_rule: 'immediate'
            }
          },
          priority_matrix: {
            factors: {
              urgency: { weight: 0.4, range: [1, 5] },
              importance: { weight: 0.3, range: [1, 5] },
              dependencies_blocking: { weight: 0.2, range: [0, 10] },
              effort: { weight: 0.1, range: [1, 10] }
            },
            calculation: 'weighted_sum'
          },
          dependency_rules: {
            strict_mode: true,
            allow_circular: false,
            max_chain_length: 10
          },
          transition_rules: {
            task_to_task: {
              conditions: ['current_complete', 'next_unblocked'],
              auto_transition: true
            },
            sprint_to_sprint: {
              conditions: ['current_80_percent', 'next_planned'],
              auto_transition: false,
              requires_approval: true
            },
            milestone_to_milestone: {
              conditions: ['current_complete', 'review_passed'],
              auto_transition: false,
              requires_approval: true
            }
          },
          ai_behavior: {
            decision_mode: 'conservative',
            auto_prioritize: true,
            suggest_parallelization: true,
            risk_tolerance: 'low'
          }
        };
        
        await fs.writeFile(rulesPath, JSON.stringify(defaultRules, null, 2));
        return defaultRules;
      }
      
      const content = await fs.readFile(rulesPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load workflow rules: ${error.message}`);
    }
  }

  async saveStateIndex(stateIndex) {
    try {
      const indexPath = path.join(this.aiwfPath, this.stateFile);
      stateIndex.last_updated = new Date().toISOString();
      await fs.writeFile(indexPath, JSON.stringify(stateIndex, null, 2));
    } catch (error) {
      throw new Error(`Failed to save state index: ${error.message}`);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  createProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${chalk.green('█'.repeat(filled))}${chalk.gray('░'.repeat(empty))}]`;
  }

  calculateTaskPriority(task, stateIndex) {
    if (!this.workflowRules || !this.workflowRules.priority_matrix) {
      return 50; // 기본 우선순위
    }

    const factors = this.workflowRules.priority_matrix.factors;
    let totalWeight = 0;
    let weightedSum = 0;

    // 긴급도 계산 (마감일 기반)
    const urgency = task.deadline ? this.calculateUrgency(task.deadline) : 3;
    weightedSum += urgency * factors.urgency.weight;
    totalWeight += factors.urgency.weight;

    // 중요도 (마일스톤/스프린트 우선순위 기반)
    const importance = task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1;
    weightedSum += importance * factors.importance.weight;
    totalWeight += factors.importance.weight;

    // 블로킹 의존성 수
    const blockingCount = this.countBlockingDependencies(task, stateIndex);
    weightedSum += blockingCount * factors.dependencies_blocking.weight;
    totalWeight += factors.dependencies_blocking.weight;

    // 노력 (예상 시간 기반)
    const effort = task.estimated_hours ? Math.min(task.estimated_hours / 8, 10) : 5;
    weightedSum += (10 - effort) * factors.effort.weight; // 낮은 노력이 높은 우선순위

    return Math.round((weightedSum / totalWeight) * 20); // 0-100 스케일로 변환
  }

  calculateUrgency(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 1) return 5;
    if (daysUntilDeadline <= 3) return 4;
    if (daysUntilDeadline <= 7) return 3;
    if (daysUntilDeadline <= 14) return 2;
    return 1;
  }

  countBlockingDependencies(task, stateIndex) {
    // 이 태스크를 의존하는 다른 태스크 수 계산
    let count = 0;
    Object.values(stateIndex.tasks).forEach(otherTask => {
      if (otherTask.dependencies && otherTask.dependencies.includes(task.id)) {
        count++;
      }
    });
    return Math.min(count, 10);
  }

  async analyzeDependencies(stateIndex) {
    const dependencies = {};
    
    // 태스크 파일에서 의존성 정보 추출
    for (const [taskId, task] of Object.entries(stateIndex.tasks)) {
      dependencies[taskId] = {
        dependsOn: [],
        blockedBy: [],
        blocks: []
      };
      
      // 태스크 파일 읽기
      try {
        const taskPath = path.join(this.projectRoot, task.location);
        const taskContent = await fs.readFile(taskPath, 'utf-8');
        
        // 의존성 섹션 찾기
        const dependencyMatch = taskContent.match(/##\s*의존성.*?\n([\s\S]*?)(?=\n##|$)/i);
        if (dependencyMatch) {
          const depSection = dependencyMatch[1];
          const taskRefs = depSection.match(/T\d+_S\d+/g) || [];
          dependencies[taskId].dependsOn = taskRefs.filter(ref => ref !== taskId);
        }
      } catch (error) {
        console.warn(`Could not analyze dependencies for ${taskId}: ${error.message}`);
      }
    }
    
    // 역방향 의존성 계산
    for (const [taskId, deps] of Object.entries(dependencies)) {
      deps.dependsOn.forEach(depId => {
        if (dependencies[depId]) {
          dependencies[depId].blocks.push(taskId);
        }
      });
    }
    
    // 블로킹 태스크 확인
    for (const [taskId, deps] of Object.entries(dependencies)) {
      deps.dependsOn.forEach(depId => {
        const depTask = stateIndex.tasks[depId];
        if (depTask && depTask.status !== 'completed') {
          deps.blockedBy.push(depId);
        }
      });
    }
    
    return dependencies;
  }

  async validateWorkflow(stateIndex) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    
    if (!this.workflowRules) {
      this.workflowRules = await this.loadWorkflowRules();
    }
    
    // 스프린트-태스크 일관성 검증
    for (const [sprintId, sprint] of Object.entries(stateIndex.sprint_summary)) {
      if (sprint.status === 'completed') {
        const incompleteTasks = Object.values(stateIndex.tasks)
          .filter(t => t.sprint === sprintId && t.status !== 'completed');
        
        if (incompleteTasks.length > 0) {
          errors.push({
            type: 'INCONSISTENT_STATE',
            message: `Sprint ${sprintId} marked complete but has ${incompleteTasks.length} incomplete tasks`,
            sprint: sprintId,
            tasks: incompleteTasks.map(t => t.id)
          });
        }
      }
    }
    
    // 의존성 순환 확인
    const dependencies = await this.analyzeDependencies(stateIndex);
    const cycles = this.detectCycles(dependencies);
    if (cycles.length > 0) {
      errors.push({
        type: 'CIRCULAR_DEPENDENCY',
        message: 'Circular dependencies detected',
        cycles: cycles
      });
    }
    
    // 80% 규칙 확인
    const currentSprint = stateIndex.project_info.current_sprint;
    if (currentSprint && stateIndex.sprint_summary[currentSprint]) {
      const sprint = stateIndex.sprint_summary[currentSprint];
      if (sprint.completion_rate >= 80 && sprint.completion_rate < 100) {
        suggestions.push({
          type: 'SPRINT_PREPARATION',
          message: `Sprint ${currentSprint} is ${sprint.completion_rate}% complete. Consider preparing the next sprint.`,
          sprint: currentSprint
        });
      }
    }
    
    return { errors, warnings, suggestions };
  }

  detectCycles(dependencies) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (taskId, path = []) => {
      if (recursionStack.has(taskId)) {
        const cycleStart = path.indexOf(taskId);
        cycles.push(path.slice(cycleStart));
        return;
      }
      
      if (visited.has(taskId)) return;
      
      visited.add(taskId);
      recursionStack.add(taskId);
      path.push(taskId);
      
      const deps = dependencies[taskId]?.dependsOn || [];
      deps.forEach(depId => dfs(depId, [...path]));
      
      recursionStack.delete(taskId);
    };
    
    Object.keys(dependencies).forEach(taskId => {
      if (!visited.has(taskId)) {
        dfs(taskId);
      }
    });
    
    return cycles;
  }

  async validateCommand() {
    const spinner = ora('Validating workflow...').start();
    
    try {
      // 상태 인덱스 로드
      const stateIndex = await this.loadStateIndex();
      if (!stateIndex) {
        spinner.fail('No state index found. Run "aiwf state update" first.');
        return;
      }
      
      // 워크플로우 규칙 로드
      if (!this.workflowRules) {
        this.workflowRules = await this.loadWorkflowRules();
      }
      
      // 검증 실행
      const validation = await this.validateWorkflow(stateIndex);
      spinner.stop();
      
      console.log(chalk.bold('\n🔍 Workflow Validation Report\n'));
      
      const { errors, warnings, suggestions } = validation;
      const totalIssues = errors.length + warnings.length;
      
      if (totalIssues === 0) {
        console.log(chalk.green('✅ Workflow validation passed!'));
        console.log(chalk.dim('  No errors or warnings found.'));
      } else {
        console.log(chalk.yellow(`Found ${totalIssues} issue(s):`));
      }
      
      // 오류 표시
      if (errors.length > 0) {
        console.log(chalk.red(`\n❌ Errors (${errors.length}):`));
        errors.forEach((error, i) => {
          console.log(chalk.red(`  ${i + 1}. ${error.type}`));
          console.log(`     ${error.message}`);
          if (error.tasks) {
            console.log(chalk.dim(`     Affected tasks: ${error.tasks.join(', ')}`));
          }
          if (error.cycles) {
            error.cycles.forEach(cycle => {
              console.log(chalk.dim(`     Cycle: ${cycle.join(' → ')} → ${cycle[0]}`));
            });
          }
        });
      }
      
      // 경고 표시
      if (warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠️  Warnings (${warnings.length}):`));
        warnings.forEach((warning, i) => {
          console.log(chalk.yellow(`  ${i + 1}. ${warning.type}`));
          console.log(`     ${warning.message}`);
        });
      }
      
      // 제안사항 표시
      if (suggestions.length > 0) {
        console.log(chalk.cyan(`\n💡 Suggestions (${suggestions.length}):`));
        suggestions.forEach((suggestion, i) => {
          console.log(chalk.cyan(`  ${i + 1}. ${suggestion.type}`));
          console.log(`     ${suggestion.message}`);
        });
      }
      
      // 통계 표시
      console.log(chalk.bold('\n📊 Workflow Statistics:'));
      console.log(`  Total Tasks: ${Object.keys(stateIndex.tasks).length}`);
      console.log(`  Active Sprints: ${Object.values(stateIndex.sprint_summary).filter(s => s.status === 'active').length}`);
      console.log(`  Overall Progress: ${stateIndex.metrics.overall_progress}%`);
      
      // 의존성 분석
      const dependencies = await this.analyzeDependencies(stateIndex);
      const tasksWithDeps = Object.values(dependencies).filter(d => d.dependsOn.length > 0).length;
      const blockedTasks = Object.values(dependencies).filter(d => d.blockedBy.length > 0).length;
      
      console.log(chalk.bold('\n🔗 Dependency Analysis:'));
      console.log(`  Tasks with dependencies: ${tasksWithDeps}`);
      console.log(`  Currently blocked tasks: ${blockedTasks}`);
      console.log(`  Circular dependencies: ${errors.filter(e => e.type === 'CIRCULAR_DEPENDENCY').length}`);
      
      // 권장 조치
      if (totalIssues > 0 || suggestions.length > 0) {
        console.log(chalk.bold('\n🎯 Recommended Actions:'));
        if (errors.some(e => e.type === 'INCONSISTENT_STATE')) {
          console.log('  1. Fix inconsistent sprint/task states');
          console.log('     - Update task statuses to match sprint status');
          console.log('     - Or reopen completed sprints if needed');
        }
        if (errors.some(e => e.type === 'CIRCULAR_DEPENDENCY')) {
          console.log('  2. Resolve circular dependencies');
          console.log('     - Review and break dependency cycles');
          console.log('     - Restructure tasks if necessary');
        }
        if (suggestions.some(s => s.type === 'SPRINT_PREPARATION')) {
          console.log('  3. Prepare next sprint');
          console.log('     - Current sprint is nearing completion');
          console.log('     - Create tasks for the next sprint');
        }
      }
      
      console.log('');
      
    } catch (error) {
      spinner.fail(`Validation failed: ${error.message}`);
      throw error;
    }
  }

  showHelp() {
    console.log('\nUsage: aiwf state <subcommand> [options]');
    console.log('\nSubcommands:');
    console.log('  init            Initialize a new state index');
    console.log('  update          Update state index by scanning all task files');
    console.log('  show            Show current project state');
    console.log('  focus <id>      Set focus to a specific task');
    console.log('  complete <id>   Mark a task as completed');
    console.log('  next            Suggest next actions based on workflow rules');
    console.log('  validate        Validate workflow consistency and dependencies');
    console.log('\nExamples:');
    console.log('  aiwf state update          # Scan and update all task states');
    console.log('  aiwf state show            # Display current project state');
    console.log('  aiwf state focus T03_S02   # Start working on a task');
    console.log('  aiwf state complete T03_S02 # Mark task as completed');
    console.log('  aiwf state next            # Get smart task recommendations');
    console.log('  aiwf state validate        # Check workflow health');
    console.log('\nWorkflow Features:');
    console.log('  - Priority-based task recommendations');
    console.log('  - Dependency tracking and validation');
    console.log('  - Sprint 80% rule notifications');
    console.log('  - Parallel work opportunity detection');
    console.log('  - Workflow consistency validation');
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = new StateCommand();
  command.execute(process.argv.slice(2));
}
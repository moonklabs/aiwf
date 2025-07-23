#!/usr/bin/env node

/**
 * AIWF State Management Command (Refactored)
 * 모듈화된 구조로 중앙 상태 인덱스를 통한 프로젝트 상태 관리
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

// 분할된 모듈들 import
import { StateIndexManager } from '../lib/state/state-index.js';
import { PriorityCalculator } from '../lib/state/priority-calculator.js';
import { TaskScanner } from '../lib/state/task-scanner.js';

export default class StateCommand {
  constructor() {
    this.projectRoot = null;
    this.aiwfPath = null;
    this.stateIndexManager = null;
    this.priorityCalculator = null;
    this.taskScanner = null;
    this.workflowRules = null;
  }

  async execute(args) {
    const subcommand = args[0] || 'show';
    
    try {
      // 프로젝트 루트 찾기 및 모듈 초기화
      await this.initializeModules();
      
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

  /**
   * 모듈들 초기화
   */
  async initializeModules() {
    this.projectRoot = await this.findProjectRoot();
    this.aiwfPath = path.join(this.projectRoot, '.aiwf');
    
    this.stateIndexManager = new StateIndexManager(this.aiwfPath);
    this.taskScanner = new TaskScanner(this.aiwfPath);
    
    // 워크플로우 규칙 로드
    this.workflowRules = await this.stateIndexManager.loadWorkflowRules();
    this.priorityCalculator = new PriorityCalculator(this.workflowRules);
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
   * 상태 인덱스 초기화
   */
  async initStateIndex() {
    const spinner = ora('Initializing state index...').start();
    
    try {
      const result = await this.stateIndexManager.initializeIndex(this.projectRoot);
      
      if (result.success) {
        spinner.succeed(result.message);
      } else {
        spinner.warn(result.message);
      }
    } catch (error) {
      spinner.fail(`Failed to initialize state index: ${error.message}`);
      throw error;
    }
  }

  /**
   * 상태 인덱스 업데이트
   */
  async updateStateIndex() {
    const spinner = ora('Updating state index...').start();
    
    try {
      let stateIndex = await this.stateIndexManager.loadIndex();
      
      if (!stateIndex) {
        spinner.info('State index not found. Creating new one...');
        await this.initStateIndex();
        stateIndex = await this.stateIndexManager.loadIndex();
      }

      // 1. 스프린트 데이터 스캔
      spinner.text = 'Scanning sprint directories...';
      const sprintData = await this.taskScanner.scanSprintDirectories();
      
      // 2. 일반 태스크 스캔
      spinner.text = 'Scanning general tasks...';
      const generalTasks = await this.taskScanner.scanGeneralTasks();
      
      // 3. 태스크 데이터 통합
      spinner.text = 'Consolidating task data...';
      const allTasks = {};
      
      // 스프린트 태스크들 추가
      for (const [sprintId, sprint] of Object.entries(sprintData)) {
        Object.assign(allTasks, sprint.tasks);
      }
      
      // 일반 태스크들 추가
      Object.assign(allTasks, generalTasks);
      
      // 4. 우선순위 계산
      spinner.text = 'Calculating priorities...';
      stateIndex.tasks = this.priorityCalculator.recalculateAllPriorities({
        ...stateIndex,
        tasks: allTasks
      });
      
      // 5. 스프린트 요약 업데이트
      spinner.text = 'Updating sprint summaries...';
      stateIndex.sprint_summary = this.generateSprintSummaries(sprintData, stateIndex.tasks);
      
      // 6. 프로젝트 메트릭스 업데이트
      spinner.text = 'Updating project metrics...';
      stateIndex.metrics = this.calculateProjectMetrics(stateIndex.tasks);
      
      // 7. 다음 작업 제안 생성
      spinner.text = 'Generating next action suggestions...';
      stateIndex.next_actions = this.generateNextActions(stateIndex);
      
      // 8. 프로젝트 정보 업데이트
      await this.updateProjectInfo(stateIndex);
      
      // 9. 상태 인덱스 저장
      await this.stateIndexManager.saveIndex(stateIndex);
      
      spinner.succeed(`State index updated successfully (${Object.keys(stateIndex.tasks).length} tasks processed)`);
      
      // 간단한 요약 출력
      this.printUpdateSummary(stateIndex);
      
    } catch (error) {
      spinner.fail(`Failed to update state index: ${error.message}`);
      throw error;
    }
  }

  /**
   * 스프린트 요약 생성
   */
  generateSprintSummaries(sprintData, tasks) {
    const summaries = {};
    
    for (const [sprintId, sprint] of Object.entries(sprintData)) {
      const sprintTasks = Object.values(tasks).filter(task => task.sprint_id === sprintId);
      const completedTasks = sprintTasks.filter(task => task.status === 'completed');
      
      summaries[sprintId] = {
        ...sprint.meta,
        total_tasks: sprintTasks.length,
        completed_tasks: completedTasks.length,
        progress: sprintTasks.length > 0 ? completedTasks.length / sprintTasks.length : 0,
        avg_priority: sprintTasks.length > 0 
          ? sprintTasks.reduce((sum, task) => sum + (task.priority_score || 0), 0) / sprintTasks.length 
          : 0,
        path: sprint.path
      };
    }
    
    return summaries;
  }

  /**
   * 프로젝트 메트릭스 계산
   */
  calculateProjectMetrics(tasks) {
    const taskArray = Object.values(tasks);
    const completed = taskArray.filter(t => t.status === 'completed');
    const inProgress = taskArray.filter(t => t.status === 'in_progress');
    const pending = taskArray.filter(t => t.status === 'pending');
    const blocked = taskArray.filter(t => t.status === 'blocked');
    
    return {
      total_tasks: taskArray.length,
      completed_tasks: completed.length,
      in_progress_tasks: inProgress.length,
      pending_tasks: pending.length,
      blocked_tasks: blocked.length,
      overall_progress: taskArray.length > 0 ? completed.length / taskArray.length : 0,
      avg_priority: taskArray.length > 0 
        ? taskArray.reduce((sum, task) => sum + (task.priority_score || 0), 0) / taskArray.length 
        : 0,
      last_calculated: new Date().toISOString()
    };
  }

  /**
   * 다음 작업 제안 생성
   */
  generateNextActions(stateIndex) {
    const tasks = Object.values(stateIndex.tasks);
    const availableTasks = tasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    );
    
    // 우선순위순으로 정렬
    availableTasks.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    
    const suggestions = [];
    
    // 최고 우선순위 태스크들
    const topTasks = availableTasks.slice(0, 3);
    for (const task of topTasks) {
      suggestions.push({
        type: 'high-priority',
        task_id: task.id,
        reason: `High priority (${task.priority_score?.toFixed(2)})`,
        action: `Focus on ${task.title}`
      });
    }
    
    // 차단된 태스크들 확인
    const blockedTasks = tasks.filter(task => task.status === 'blocked');
    for (const task of blockedTasks.slice(0, 2)) {
      suggestions.push({
        type: 'unblock',
        task_id: task.id,
        reason: 'Currently blocked - needs attention',
        action: `Resolve blocking issues for ${task.title}`
      });
    }
    
    return suggestions.slice(0, 5); // 최대 5개 제안
  }

  /**
   * 현재 상태 표시
   */
  async showState() {
    const spinner = ora('Loading state...').start();
    
    try {
      const stateIndex = await this.stateIndexManager.loadIndex();
      
      if (!stateIndex) {
        spinner.fail('State index not found. Run "aiwf state init" first.');
        return;
      }
      
      spinner.succeed('State loaded successfully');
      
      // 상태 정보 출력
      console.log(chalk.cyan('\n📊 AIWF Project State Dashboard'));
      console.log(chalk.gray('='.repeat(50)));
      
      // 프로젝트 기본 정보
      console.log(chalk.bold('\n🏗️  Project Info:'));
      console.log(`   Name: ${stateIndex.project_info?.name || 'Unknown'}`);
      console.log(`   Phase: ${stateIndex.project_info?.phase || 'Unknown'}`);
      console.log(`   Current Milestone: ${stateIndex.project_info?.current_milestone || 'None'}`);
      console.log(`   Current Sprint: ${stateIndex.project_info?.current_sprint || 'None'}`);
      
      // 메트릭스
      const metrics = stateIndex.metrics;
      console.log(chalk.bold('\n📈 Metrics:'));
      console.log(`   Total Tasks: ${metrics?.total_tasks || 0}`);
      console.log(`   Completed: ${chalk.green(metrics?.completed_tasks || 0)}`);
      console.log(`   In Progress: ${chalk.yellow(metrics?.in_progress_tasks || 0)}`);
      console.log(`   Pending: ${chalk.gray(metrics?.pending_tasks || 0)}`);
      console.log(`   Blocked: ${chalk.red(metrics?.blocked_tasks || 0)}`);
      console.log(`   Overall Progress: ${chalk.cyan((metrics?.overall_progress * 100 || 0).toFixed(1))}%`);
      
      // 현재 포커스
      if (stateIndex.current_focus?.primary_task) {
        console.log(chalk.bold('\n🎯 Current Focus:'));
        console.log(`   Primary: ${stateIndex.current_focus.primary_task}`);
        if (stateIndex.current_focus.secondary_tasks?.length > 0) {
          console.log(`   Secondary: ${stateIndex.current_focus.secondary_tasks.join(', ')}`);
        }
      }
      
      // 다음 작업 제안
      if (stateIndex.next_actions?.length > 0) {
        console.log(chalk.bold('\n🚀 Suggested Next Actions:'));
        stateIndex.next_actions.slice(0, 3).forEach((action, index) => {
          console.log(`   ${index + 1}. ${action.action} ${chalk.gray(`(${action.reason})`)}`);
        });
      }
      
      console.log(chalk.gray(`\nLast updated: ${stateIndex.last_updated}`));
      
    } catch (error) {
      spinner.fail(`Failed to show state: ${error.message}`);
      throw error;
    }
  }

  /**
   * 업데이트 요약 출력
   */
  printUpdateSummary(stateIndex) {
    const metrics = stateIndex.metrics;
    console.log(chalk.cyan('\n📊 Update Summary:'));
    console.log(`   ${chalk.green('✅')} ${metrics.completed_tasks} completed tasks`);
    console.log(`   ${chalk.yellow('🔄')} ${metrics.in_progress_tasks} in progress`);
    console.log(`   ${chalk.gray('⏳')} ${metrics.pending_tasks} pending tasks`);
    if (metrics.blocked_tasks > 0) {
      console.log(`   ${chalk.red('❌')} ${metrics.blocked_tasks} blocked tasks`);
    }
    console.log(`   ${chalk.cyan('📈')} ${(metrics.overall_progress * 100).toFixed(1)}% overall progress`);
  }

  /**
   * 프로젝트 정보 업데이트
   */
  async updateProjectInfo(stateIndex) {
    try {
      // PROJECT_MANIFEST.md에서 현재 마일스톤/스프린트 정보 읽기
      const manifestPath = path.join(this.aiwfPath, '00_PROJECT_MANIFEST.md');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      
      // 현재 마일스톤 추출
      const milestoneMatch = manifestContent.match(/current_milestone:\s*([^\n]+)/i);
      if (milestoneMatch) {
        stateIndex.project_info.current_milestone = milestoneMatch[1].trim();
      }
      
      // 현재 스프린트 추출
      const sprintMatch = manifestContent.match(/current_sprint:\s*([^\n]+)/i);
      if (sprintMatch) {
        stateIndex.project_info.current_sprint = sprintMatch[1].trim();
      }
      
    } catch (error) {
      // 매니페스트 파일이 없거나 읽을 수 없으면 무시
      console.warn(`Could not update project info from manifest: ${error.message}`);
    }
  }

  /**
   * 기타 메서드들 (focusTask, completeTask, suggestNext, validateCommand 등)
   * 기존 state.js에서 가져와야 함
   */
  async focusTask(taskId) {
    // 구현 필요
    console.log(chalk.yellow('focusTask method needs implementation'));
  }

  async completeTask(taskId) {
    // 구현 필요
    console.log(chalk.yellow('completeTask method needs implementation'));
  }

  async suggestNext() {
    // 구현 필요
    console.log(chalk.yellow('suggestNext method needs implementation'));
  }

  async validateCommand() {
    // 구현 필요
    console.log(chalk.yellow('validateCommand method needs implementation'));
  }

  showHelp() {
    console.log(chalk.cyan('\n🤖 AIWF State Management'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log('Usage: aiwf state [command]');
    console.log('');
    console.log('Commands:');
    console.log('  init      Initialize state index');
    console.log('  update    Update state index');
    console.log('  show      Show current state');
    console.log('  focus     Focus on a specific task');
    console.log('  complete  Mark task as completed');
    console.log('  next      Suggest next actions');
    console.log('  validate  Validate state consistency');
  }
}
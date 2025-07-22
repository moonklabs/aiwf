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
    this.projectRoot = null;
    this.aiwfPath = null;
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

      // 다음 액션 제안
      stateIndex.next_actions = [];
      
      // 진행 중인 태스크 우선
      Object.values(stateIndex.tasks).forEach(task => {
        if (task.status === 'in_progress') {
          stateIndex.next_actions.push({
            priority: 'high',
            action: `Continue working on ${task.title}`,
            task_id: task.id,
            estimated_time: '2-4 hours'
          });
        }
      });
      
      // 대기 중인 태스크 추가
      Object.values(stateIndex.tasks).forEach(task => {
        if (task.status === 'pending' && task.sprint === stateIndex.project_info.current_sprint) {
          stateIndex.next_actions.push({
            priority: 'medium',
            action: `Start ${task.title}`,
            task_id: task.id,
            estimated_time: '4-8 hours'
          });
        }
      });

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

      console.log(chalk.bold('\n🎯 Suggested Next Actions:\n'));
      
      // 현재 진행 중인 태스크
      const inProgressTasks = Object.values(stateIndex.tasks)
        .filter(t => t.status === 'in_progress');
      
      if (inProgressTasks.length > 0) {
        console.log(chalk.yellow('Continue with in-progress tasks:'));
        inProgressTasks.forEach(task => {
          console.log(`  🔄 ${task.id}: ${task.title}`);
          console.log(chalk.dim(`     Location: ${task.location}`));
        });
      }
      
      // 현재 스프린트의 대기 중인 태스크
      const currentSprint = stateIndex.project_info.current_sprint;
      if (currentSprint) {
        const pendingTasks = Object.values(stateIndex.tasks)
          .filter(t => t.sprint === currentSprint && t.status === 'pending')
          .slice(0, 3);
        
        if (pendingTasks.length > 0) {
          console.log(chalk.blue('\nStart new tasks from current sprint:'));
          pendingTasks.forEach((task, i) => {
            console.log(`  ${i + 1}. ${task.id}: ${task.title}`);
            console.log(chalk.dim(`     Location: ${task.location}`));
          });
        }
      }
      
      // 블록된 태스크 확인
      const blockedTasks = Object.values(stateIndex.tasks)
        .filter(t => t.status === 'blocked');
      
      if (blockedTasks.length > 0) {
        console.log(chalk.red('\nBlocked tasks requiring attention:'));
        blockedTasks.forEach(task => {
          console.log(`  ❌ ${task.id}: ${task.title}`);
        });
      }
      
      // 스프린트 완료 확인
      if (currentSprint && stateIndex.sprint_summary[currentSprint]) {
        const sprint = stateIndex.sprint_summary[currentSprint];
        if (sprint.completion_rate === 100) {
          console.log(chalk.green(`\n🎉 Sprint ${currentSprint} is complete! Consider:`));
          console.log('  - Running a sprint review');
          console.log('  - Planning the next sprint');
          console.log('  - Updating project documentation');
        }
      }
      
      console.log(chalk.dim('\nUse "aiwf state focus <task-id>" to start working on a task'));
      
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

  showHelp() {
    console.log('\nUsage: aiwf state <subcommand> [options]');
    console.log('\nSubcommands:');
    console.log('  init            Initialize a new state index');
    console.log('  update          Update state index by scanning all task files');
    console.log('  show            Show current project state');
    console.log('  focus <id>      Set focus to a specific task');
    console.log('  complete <id>   Mark a task as completed');
    console.log('  next            Suggest next actions');
    console.log('\nExamples:');
    console.log('  aiwf state update');
    console.log('  aiwf state show');
    console.log('  aiwf state focus T03_S02_M01');
    console.log('  aiwf state complete T03_S02_M01');
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = new StateCommand();
  command.execute(process.argv.slice(2));
}
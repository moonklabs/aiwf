/**
 * YOLO 모드 체크포인트 매니저
 * 진행 상황을 저장하고 복구할 수 있는 시스템
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export class CheckpointManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.stateFile = path.join(projectRoot, '.aiwf', 'yolo-state.json');
    this.checkpointDir = path.join(projectRoot, '.aiwf', 'checkpoints');
    this.currentState = null;
  }

  /**
   * 체크포인트 디렉토리 초기화
   */
  async initialize() {
    await fs.mkdir(this.checkpointDir, { recursive: true });
    await this.loadState();
  }

  /**
   * 현재 상태 로드
   */
  async loadState() {
    try {
      const content = await fs.readFile(this.stateFile, 'utf-8');
      this.currentState = JSON.parse(content);
    } catch {
      // 새로운 상태 생성
      this.currentState = {
        session_id: Date.now().toString(),
        started_at: new Date().toISOString(),
        sprint_id: null,
        mode: null,
        completed_tasks: [],
        current_task: null,
        checkpoints: [],
        metrics: {
          total_tasks: 0,
          completed_tasks: 0,
          failed_tasks: 0,
          skipped_tasks: 0,
          total_time: 0,
          avg_task_time: 0
        }
      };
    }
  }

  /**
   * 상태 저장
   */
  async saveState() {
    await fs.writeFile(this.stateFile, JSON.stringify(this.currentState, null, 2));
  }

  /**
   * YOLO 세션 시작
   */
  async startSession(sprintId, mode = 'sprint') {
    this.currentState = {
      session_id: Date.now().toString(),
      started_at: new Date().toISOString(),
      sprint_id: sprintId,
      mode: mode, // sprint, sprint-all, milestone-all
      completed_tasks: [],
      current_task: null,
      checkpoints: [],
      metrics: {
        total_tasks: 0,
        completed_tasks: 0,
        failed_tasks: 0,
        skipped_tasks: 0,
        total_time: 0,
        avg_task_time: 0
      },
      git_info: this.getGitInfo()
    };
    
    await this.saveState();
    await this.createCheckpoint('session_start');
  }

  /**
   * Git 정보 수집
   */
  getGitInfo() {
    try {
      return {
        branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        status: execSync('git status --porcelain', { encoding: 'utf8' }).trim()
      };
    } catch {
      return null;
    }
  }

  /**
   * 체크포인트 생성
   */
  async createCheckpoint(type = 'auto', metadata = {}) {
    const checkpointId = `cp_${Date.now()}`;
    const checkpoint = {
      id: checkpointId,
      type: type, // session_start, task_complete, sprint_complete, auto, manual
      created_at: new Date().toISOString(),
      state_snapshot: { ...this.currentState },
      git_info: this.getGitInfo(),
      metadata: metadata
    };
    
    // 체크포인트 파일로 저장
    const checkpointPath = path.join(this.checkpointDir, `${checkpointId}.json`);
    await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
    
    // 상태에 체크포인트 추가
    this.currentState.checkpoints.push({
      id: checkpointId,
      type: type,
      created_at: checkpoint.created_at,
      metadata: metadata
    });
    
    await this.saveState();
    
    return checkpointId;
  }

  /**
   * 태스크 시작
   */
  async startTask(taskId, taskInfo = {}) {
    this.currentState.current_task = {
      id: taskId,
      started_at: new Date().toISOString(),
      info: taskInfo,
      attempts: 1
    };
    
    await this.saveState();
  }

  /**
   * 태스크 완료
   */
  async completeTask(taskId, result = {}) {
    if (this.currentState.current_task?.id !== taskId) {
      throw new Error(`현재 태스크(${this.currentState.current_task?.id})와 완료하려는 태스크(${taskId})가 일치하지 않습니다.`);
    }
    
    const taskDuration = Date.now() - new Date(this.currentState.current_task.started_at).getTime();
    
    this.currentState.completed_tasks.push({
      id: taskId,
      completed_at: new Date().toISOString(),
      duration: taskDuration,
      result: result,
      attempts: this.currentState.current_task.attempts
    });
    
    // 메트릭 업데이트
    this.currentState.metrics.completed_tasks++;
    this.currentState.metrics.total_time += taskDuration;
    this.currentState.metrics.avg_task_time = 
      this.currentState.metrics.total_time / this.currentState.metrics.completed_tasks;
    
    this.currentState.current_task = null;
    
    await this.saveState();
    
    // 일정 간격으로 자동 체크포인트
    if (this.currentState.completed_tasks.length % 5 === 0) {
      await this.createCheckpoint('auto', { 
        tasks_completed: this.currentState.completed_tasks.length 
      });
    }
  }

  /**
   * 태스크 실패
   */
  async failTask(taskId, error = {}) {
    if (this.currentState.current_task?.id !== taskId) {
      return;
    }
    
    this.currentState.metrics.failed_tasks++;
    
    // 재시도 가능 여부 확인
    if (this.currentState.current_task.attempts < 3) {
      this.currentState.current_task.attempts++;
      this.currentState.current_task.last_error = error;
      await this.saveState();
      return { retry: true, attempts: this.currentState.current_task.attempts };
    }
    
    // 최종 실패
    this.currentState.current_task = null;
    await this.saveState();
    return { retry: false, final_failure: true };
  }

  /**
   * 태스크 스킵
   */
  async skipTask(taskId, reason = '') {
    this.currentState.metrics.skipped_tasks++;
    this.currentState.current_task = null;
    
    await this.saveState();
  }

  /**
   * 체크포인트에서 복구
   */
  async restoreFromCheckpoint(checkpointId) {
    const checkpointPath = path.join(this.checkpointDir, `${checkpointId}.json`);
    
    try {
      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content);
      
      // Git 상태 확인
      const currentGitInfo = this.getGitInfo();
      if (checkpoint.git_info && currentGitInfo) {
        console.log(`⚠️  Git 상태 차이:`);
        console.log(`  체크포인트 브랜치: ${checkpoint.git_info.branch}`);
        console.log(`  현재 브랜치: ${currentGitInfo.branch}`);
        
        if (checkpoint.git_info.branch !== currentGitInfo.branch) {
          console.log(`브랜치 전환: git checkout ${checkpoint.git_info.branch}`);
        }
      }
      
      // 상태 복원
      this.currentState = checkpoint.state_snapshot;
      this.currentState.restored_from = checkpointId;
      this.currentState.restored_at = new Date().toISOString();
      
      await this.saveState();
      
      return {
        success: true,
        checkpoint: checkpoint,
        tasks_to_resume: this.getResumableTasks()
      };
      
    } catch (error) {
      throw new Error(`체크포인트 복원 실패: ${error.message}`);
    }
  }

  /**
   * 재개 가능한 태스크 목록
   */
  getResumableTasks() {
    const completedIds = this.currentState.completed_tasks.map(t => t.id);
    return {
      completed: completedIds,
      current: this.currentState.current_task?.id,
      next_task_hint: this.currentState.current_task ? 
        `마지막 작업: ${this.currentState.current_task.id}` : 
        `완료된 태스크 수: ${completedIds.length}`
    };
  }

  /**
   * 진행 상황 리포트
   */
  async generateProgressReport() {
    const report = {
      session: {
        id: this.currentState.session_id,
        started: this.currentState.started_at,
        sprint: this.currentState.sprint_id,
        mode: this.currentState.mode
      },
      progress: {
        completed: this.currentState.completed_tasks.length,
        failed: this.currentState.metrics.failed_tasks,
        skipped: this.currentState.metrics.skipped_tasks,
        current: this.currentState.current_task?.id || 'none'
      },
      performance: {
        total_time: this.formatDuration(this.currentState.metrics.total_time),
        avg_task_time: this.formatDuration(this.currentState.metrics.avg_task_time),
        success_rate: this.currentState.metrics.total_tasks > 0 ?
          (this.currentState.metrics.completed_tasks / this.currentState.metrics.total_tasks * 100).toFixed(1) + '%' :
          'N/A'
      },
      checkpoints: this.currentState.checkpoints.map(cp => ({
        id: cp.id,
        type: cp.type,
        created: cp.created_at,
        metadata: cp.metadata
      })),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  /**
   * 시간 포맷팅
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  }

  /**
   * 권장사항 생성
   */
  generateRecommendations() {
    const recommendations = [];
    
    // 실패율이 높은 경우
    if (this.currentState.metrics.failed_tasks > this.currentState.metrics.completed_tasks * 0.2) {
      recommendations.push('실패율이 높습니다. 태스크 범위를 재검토하세요.');
    }
    
    // 평균 시간이 긴 경우
    if (this.currentState.metrics.avg_task_time > 30 * 60 * 1000) { // 30분
      recommendations.push('태스크당 평균 시간이 깁니다. 더 작은 단위로 분할을 고려하세요.');
    }
    
    // 체크포인트가 없는 경우
    if (this.currentState.checkpoints.length === 0 && this.currentState.completed_tasks.length > 10) {
      recommendations.push('체크포인트를 생성하여 진행 상황을 보호하세요.');
    }
    
    return recommendations;
  }

  /**
   * 세션 종료
   */
  async endSession(summary = {}) {
    this.currentState.ended_at = new Date().toISOString();
    this.currentState.summary = summary;
    
    await this.createCheckpoint('session_end', summary);
    await this.saveState();
    
    // 최종 리포트 생성
    const finalReport = await this.generateProgressReport();
    
    // 리포트 파일로 저장
    const reportPath = path.join(
      this.checkpointDir, 
      `session_${this.currentState.session_id}_report.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(finalReport, null, 2));
    
    return finalReport;
  }

  /**
   * 체크포인트 목록
   */
  async listCheckpoints() {
    try {
      const files = await fs.readdir(this.checkpointDir);
      const checkpoints = [];
      
      for (const file of files) {
        if (file.startsWith('cp_') && file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.checkpointDir, file), 
            'utf-8'
          );
          const checkpoint = JSON.parse(content);
          checkpoints.push({
            id: checkpoint.id,
            type: checkpoint.type,
            created: checkpoint.created_at,
            tasks_completed: checkpoint.state_snapshot.completed_tasks.length,
            metadata: checkpoint.metadata
          });
        }
      }
      
      return checkpoints.sort((a, b) => 
        new Date(b.created).getTime() - new Date(a.created).getTime()
      );
      
    } catch {
      return [];
    }
  }

  /**
   * 정리 - 오래된 체크포인트 삭제
   */
  async cleanup(keepLast = 10) {
    const checkpoints = await this.listCheckpoints();
    
    if (checkpoints.length <= keepLast) {
      return;
    }
    
    const toDelete = checkpoints.slice(keepLast);
    for (const cp of toDelete) {
      const filePath = path.join(this.checkpointDir, `${cp.id}.json`);
      await fs.unlink(filePath).catch(() => {});
    }
  }
}

export default CheckpointManager;
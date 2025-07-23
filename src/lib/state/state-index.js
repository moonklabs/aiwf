/**
 * AIWF State Index Manager
 * 중앙 상태 인덱스 파일의 생성, 로드, 저장을 담당
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export class StateIndexManager {
  constructor(aiwfPath) {
    this.aiwfPath = aiwfPath;
    this.stateFile = 'task-state-index.json';
    this.workflowRulesFile = 'workflow-rules.json';
  }

  get indexPath() {
    return path.join(this.aiwfPath, this.stateFile);
  }

  get workflowRulesPath() {
    return path.join(this.aiwfPath, this.workflowRulesFile);
  }

  /**
   * 파일 존재 여부 확인
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 초기 상태 구조 생성
   */
  createInitialState(projectRoot) {
    return {
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      last_updated_by: 'aiwf-state-init',
      project_info: {
        name: path.basename(projectRoot),
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
  }

  /**
   * 상태 인덱스 초기화
   */
  async initializeIndex(projectRoot) {
    const exists = await this.fileExists(this.indexPath);
    
    if (exists) {
      return { success: false, message: 'State index already exists' };
    }

    const initialState = this.createInitialState(projectRoot);
    await fs.writeFile(this.indexPath, JSON.stringify(initialState, null, 2));
    
    return { success: true, message: 'State index initialized successfully' };
  }

  /**
   * 상태 인덱스 로드
   */
  async loadIndex() {
    if (!existsSync(this.indexPath)) {
      return null;
    }

    try {
      const content = await fs.readFile(this.indexPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load state index: ${error.message}`);
    }
  }

  /**
   * 상태 인덱스 저장
   */
  async saveIndex(stateIndex) {
    stateIndex.last_updated = new Date().toISOString();
    stateIndex.last_updated_by = 'aiwf-state-update';
    
    await fs.writeFile(this.indexPath, JSON.stringify(stateIndex, null, 2));
  }

  /**
   * 워크플로우 규칙 로드
   */
  async loadWorkflowRules() {
    if (!existsSync(this.workflowRulesPath)) {
      // 기본 워크플로우 규칙 생성
      const defaultRules = {
        priority_weights: {
          urgency: 0.4,
          importance: 0.3,
          dependencies: 0.2,
          effort: 0.1
        },
        completion_threshold: 0.8,
        max_active_tasks: 3,
        dependency_timeout_days: 7,
        status_transitions: {
          'pending': ['in_progress', 'blocked'],
          'in_progress': ['completed', 'blocked', 'pending'],
          'blocked': ['in_progress', 'pending'],
          'completed': []
        }
      };
      
      await fs.writeFile(this.workflowRulesPath, JSON.stringify(defaultRules, null, 2));
      return defaultRules;
    }

    try {
      const content = await fs.readFile(this.workflowRulesPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load workflow rules: ${error.message}`);
    }
  }
}
/**
 * AIWF Task Scanner
 * 프로젝트 디렉토리에서 태스크 파일들을 스캔하고 파싱
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class TaskScanner {
  constructor(aiwfPath) {
    this.aiwfPath = aiwfPath;
  }

  /**
   * 스프린트 디렉토리 스캔
   */
  async scanSprintDirectories() {
    try {
      const sprintDirs = await glob('03_SPRINTS/S*/', { cwd: this.aiwfPath });
      const sprintData = {};

      for (const sprintDir of sprintDirs) {
        const sprintId = path.basename(sprintDir);
        const fullSprintPath = path.join(this.aiwfPath, sprintDir);
        
        // 스프린트 메타 파일 찾기
        const metaFiles = await glob('*_meta.md', { cwd: fullSprintPath });
        let sprintMeta = {};
        
        if (metaFiles.length > 0) {
          const metaPath = path.join(fullSprintPath, metaFiles[0]);
          sprintMeta = await this.parseSprintMeta(metaPath);
        }

        // 태스크 파일들 스캔
        const taskFiles = await glob('T*.md', { cwd: fullSprintPath });
        const tasks = {};
        
        for (const taskFile of taskFiles) {
          const taskPath = path.join(fullSprintPath, taskFile);
          const taskData = await this.parseTaskFile(taskPath, sprintId);
          if (taskData) {
            tasks[taskData.id] = taskData;
          }
        }

        sprintData[sprintId] = {
          meta: sprintMeta,
          tasks: tasks,
          task_count: taskFiles.length,
          path: sprintDir
        };
      }

      return sprintData;
    } catch (error) {
      throw new Error(`Failed to scan sprint directories: ${error.message}`);
    }
  }

  /**
   * 일반 태스크 디렉토리 스캔
   */
  async scanGeneralTasks() {
    try {
      const generalTasksPath = path.join(this.aiwfPath, '04_GENERAL_TASKS');
      const taskFiles = await glob('*.md', { cwd: generalTasksPath });
      const tasks = {};

      for (const taskFile of taskFiles) {
        const taskPath = path.join(generalTasksPath, taskFile);
        const taskData = await this.parseTaskFile(taskPath, 'general');
        if (taskData) {
          tasks[taskData.id] = taskData;
        }
      }

      return tasks;
    } catch (error) {
      // 일반 태스크 디렉토리가 없으면 빈 객체 반환
      return {};
    }
  }

  /**
   * 스프린트 메타 파일 파싱
   */
  async parseSprintMeta(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const meta = {
        status: 'planned',
        progress: 0,
        start_date: null,
        end_date: null,
        goals: [],
        deliverables: []
      };

      // YAML frontmatter 파싱
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        
        // 간단한 YAML 파싱 (key: value 형태)
        const lines = frontmatter.split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            meta[key.trim()] = value;
          }
        }
      }

      // 본문에서 목표와 결과물 추출
      const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      
      // 목표 섹션 찾기
      const goalsMatch = bodyContent.match(/## 목표[^#]*?((?:- .*\n?)*)/i);
      if (goalsMatch) {
        meta.goals = goalsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
      }

      // 결과물 섹션 찾기
      const deliverablesMatch = bodyContent.match(/## 결과물[^#]*?((?:- .*\n?)*)/i);
      if (deliverablesMatch) {
        meta.deliverables = deliverablesMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
      }

      return meta;
    } catch (error) {
      console.warn(`Failed to parse sprint meta ${filePath}: ${error.message}`);
      return {};
    }
  }

  /**
   * 태스크 파일 파싱
   */
  async parseTaskFile(filePath, sprintId) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const fileName = path.basename(filePath, '.md');
      
      const task = {
        id: fileName,
        sprint_id: sprintId,
        title: this.extractTitle(content),
        status: this.determineStatus(content),
        description: this.extractDescription(content),
        tags: this.extractTags(content),
        dependencies: this.extractDependencies(content),
        assignee: this.extractAssignee(content),
        created_date: this.extractCreatedDate(filePath),
        updated_date: this.extractUpdatedDate(filePath),
        estimated_hours: this.extractEstimatedHours(content),
        complexity: this.extractComplexity(content),
        type: this.extractTaskType(content),
        milestone_id: this.extractMilestoneId(sprintId),
        file_path: filePath,
        progress_notes: this.extractProgressNotes(content)
      };

      return task;
    } catch (error) {
      console.warn(`Failed to parse task file ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * 태스크 제목 추출
   */
  extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Untitled Task';
  }

  /**
   * 태스크 상태 결정
   */
  determineStatus(content) {
    // OUTPUT LOG에서 완료 표시 확인
    if (content.includes('## OUTPUT LOG') || content.includes('✅ 완료')) {
      const outputSection = content.match(/## OUTPUT LOG([\s\S]*?)(?=##|$)/i);
      if (outputSection && outputSection[1].trim().length > 50) {
        return 'completed';
      }
    }

    // 진행 중 표시 확인
    if (content.includes('🔄') || content.includes('진행 중') || content.includes('in progress')) {
      return 'in_progress';
    }

    // 차단됨 표시 확인
    if (content.includes('❌') || content.includes('차단') || content.includes('blocked')) {
      return 'blocked';
    }

    return 'pending';
  }

  /**
   * 태스크 설명 추출
   */
  extractDescription(content) {
    // 첫 번째 헤더 다음부터 두 번째 헤더 전까지
    const descMatch = content.match(/^#[^#\n]*\n([\s\S]*?)(?=\n##|\n#|$)/);
    return descMatch ? descMatch[1].trim().substring(0, 200) : '';
  }

  /**
   * 태그 추출
   */
  extractTags(content) {
    const tagMatches = content.match(/#(\w+)/g);
    return tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
  }

  /**
   * 종속성 추출
   */
  extractDependencies(content) {
    const depMatches = content.match(/depends on:?\s*([T\d\s,]+)/i);
    if (depMatches) {
      return depMatches[1]
        .split(/[,\s]+/)
        .filter(dep => dep.match(/^T\d+$/))
        .map(dep => dep.trim());
    }
    return [];
  }

  /**
   * 담당자 추출
   */
  extractAssignee(content) {
    const assigneeMatch = content.match(/assignee:?\s*([^\n]+)/i);
    return assigneeMatch ? assigneeMatch[1].trim() : null;
  }

  /**
   * 생성일 추출 (파일 생성 시간 기반)
   */
  async extractCreatedDate(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.birthtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * 수정일 추출 (파일 수정 시간 기반)
   */
  async extractUpdatedDate(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.mtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * 예상 시간 추출
   */
  extractEstimatedHours(content) {
    const hourMatch = content.match(/estimated:?\s*(\d+\.?\d*)\s*hours?/i);
    return hourMatch ? parseFloat(hourMatch[1]) : null;
  }

  /**
   * 복잡도 추출
   */
  extractComplexity(content) {
    const complexityMatch = content.match(/complexity:?\s*(low|medium|high|very-high)/i);
    return complexityMatch ? complexityMatch[1].toLowerCase() : null;
  }

  /**
   * 태스크 타입 추출
   */
  extractTaskType(content) {
    const typeMatch = content.match(/type:?\s*([^\n]+)/i);
    if (typeMatch) {
      return typeMatch[1].trim().toLowerCase();
    }

    // 제목이나 내용에서 타입 추정
    const title = this.extractTitle(content).toLowerCase();
    if (title.includes('bug') || title.includes('fix')) return 'bug-fix';
    if (title.includes('test')) return 'testing';
    if (title.includes('doc')) return 'documentation';
    if (title.includes('refactor')) return 'refactoring';
    if (title.includes('feature')) return 'core-feature';
    
    return 'enhancement';
  }

  /**
   * 마일스톤 ID 추출 (스프린트 ID에서)
   */
  extractMilestoneId(sprintId) {
    if (sprintId === 'general') return null;
    
    const milestoneMatch = sprintId.match(/S\d+_M(\d+)/);
    return milestoneMatch ? `M${milestoneMatch[1].padStart(2, '0')}` : null;
  }

  /**
   * 진행 노트 추출
   */
  extractProgressNotes(content) {
    const notesMatch = content.match(/## 진행 상황([\s\S]*?)(?=##|$)/i);
    return notesMatch ? notesMatch[1].trim() : '';
  }
}
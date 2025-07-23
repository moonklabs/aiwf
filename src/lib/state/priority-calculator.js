/**
 * AIWF Priority Calculator
 * 태스크 우선순위 계산 및 관리
 */

export class PriorityCalculator {
  constructor(workflowRules) {
    this.weights = workflowRules?.priority_weights || {
      urgency: 0.4,
      importance: 0.3,
      dependencies: 0.2,
      effort: 0.1
    };
  }

  /**
   * 태스크의 긴급도 계산
   * - 마감일까지 남은 시간
   * - 차단된 다른 태스크 수
   * - 마일스톤 내 위치
   */
  calculateUrgency(task, stateIndex) {
    let urgencyScore = 0;

    // 마감일 기반 점수 (0-1)
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 0) urgencyScore += 1.0;      // 이미 지남
      else if (daysUntilDue <= 1) urgencyScore += 0.9; // 1일 이내
      else if (daysUntilDue <= 3) urgencyScore += 0.7; // 3일 이내
      else if (daysUntilDue <= 7) urgencyScore += 0.5; // 1주 이내
      else urgencyScore += Math.max(0, 1 - daysUntilDue / 30); // 선형 감소
    }

    // 차단된 태스크 수 기반 점수
    const blockedByThis = this.countTasksBlockedBy(task.id, stateIndex);
    urgencyScore += Math.min(blockedByThis * 0.2, 0.5);

    // 스프린트 진행도 기반 점수
    if (task.sprint_id && stateIndex.sprint_summary[task.sprint_id]) {
      const sprintProgress = stateIndex.sprint_summary[task.sprint_id].progress || 0;
      if (sprintProgress > 0.8) urgencyScore += 0.3; // 스프린트 거의 완료
      else if (sprintProgress > 0.5) urgencyScore += 0.1;
    }

    return Math.min(urgencyScore, 1.0);
  }

  /**
   * 태스크의 중요도 계산
   * - 비즈니스 가치
   * - 아키텍처적 영향
   * - 프로젝트 목표와의 연관성
   */
  calculateImportance(task, stateIndex) {
    let importanceScore = 0;

    // 태스크 타입별 기본 중요도
    const typeWeights = {
      'architecture': 0.9,
      'security': 0.8,
      'core-feature': 0.7,
      'bug-fix': 0.6,
      'enhancement': 0.5,
      'documentation': 0.3,
      'refactoring': 0.4,
      'testing': 0.5
    };

    importanceScore += typeWeights[task.type] || 0.5;

    // 마일스톤 중요도 반영
    if (task.milestone_id) {
      const milestoneId = task.milestone_id;
      // M01, M02 등에서 숫자 추출하여 초기 마일스톤일수록 높은 점수
      const milestoneNum = parseInt(milestoneId.replace(/\D/g, ''));
      if (milestoneNum <= 2) importanceScore += 0.2;
      else if (milestoneNum <= 5) importanceScore += 0.1;
    }

    // 태그 기반 중요도 조정
    if (task.tags) {
      if (task.tags.includes('critical')) importanceScore += 0.3;
      if (task.tags.includes('high-priority')) importanceScore += 0.2;
      if (task.tags.includes('low-priority')) importanceScore -= 0.2;
    }

    return Math.min(importanceScore, 1.0);
  }

  /**
   * 종속성 점수 계산
   * - 이 태스크에 의존하는 태스크 수
   * - 이 태스크가 의존하는 태스크의 완료 상태
   */
  calculateDependencyScore(task, stateIndex) {
    let dependencyScore = 0;

    // 이 태스크를 차단하는 미완료 종속성
    const blockingDependencies = task.dependencies?.filter(depId => {
      const depTask = stateIndex.tasks[depId];
      return depTask && depTask.status !== 'completed';
    }) || [];

    if (blockingDependencies.length === 0) {
      dependencyScore += 0.5; // 차단 요소 없음
    } else {
      dependencyScore -= blockingDependencies.length * 0.2; // 차단 요소마다 감점
    }

    // 이 태스크에 의존하는 태스크 수
    const dependentCount = this.countTasksBlockedBy(task.id, stateIndex);
    dependencyScore += Math.min(dependentCount * 0.15, 0.5);

    return Math.max(0, Math.min(dependencyScore, 1.0));
  }

  /**
   * 노력 점수 계산 (낮을수록 높은 점수)
   * - 예상 작업 시간
   * - 복잡도
   * - 필요한 리소스
   */
  calculateEffortScore(task) {
    let effortScore = 1.0; // 기본값: 쉬운 태스크

    // 예상 시간 기반 점수
    if (task.estimated_hours) {
      if (task.estimated_hours <= 1) effortScore = 1.0;      // 1시간 이하
      else if (task.estimated_hours <= 4) effortScore = 0.8; // 4시간 이하
      else if (task.estimated_hours <= 8) effortScore = 0.6; // 1일 이하
      else if (task.estimated_hours <= 16) effortScore = 0.4; // 2일 이하
      else effortScore = 0.2; // 2일 초과
    }

    // 복잡도 기반 조정
    if (task.complexity) {
      const complexityWeights = {
        'low': 1.0,
        'medium': 0.7,
        'high': 0.4,
        'very-high': 0.2
      };
      effortScore *= complexityWeights[task.complexity] || 0.7;
    }

    // 태그 기반 조정 (간단한 태스크들)
    if (task.tags) {
      if (task.tags.includes('quick-fix')) effortScore += 0.2;
      if (task.tags.includes('research-heavy')) effortScore -= 0.3;
    }

    return Math.max(0.1, Math.min(effortScore, 1.0));
  }

  /**
   * 전체 우선순위 점수 계산
   */
  calculatePriority(task, stateIndex) {
    const urgency = this.calculateUrgency(task, stateIndex);
    const importance = this.calculateImportance(task, stateIndex);
    const dependency = this.calculateDependencyScore(task, stateIndex);
    const effort = this.calculateEffortScore(task);

    const priority = (
      urgency * this.weights.urgency +
      importance * this.weights.importance +
      dependency * this.weights.dependencies +
      effort * this.weights.effort
    );

    return {
      total: Math.round(priority * 100) / 100,
      breakdown: {
        urgency: Math.round(urgency * 100) / 100,
        importance: Math.round(importance * 100) / 100,
        dependency: Math.round(dependency * 100) / 100,
        effort: Math.round(effort * 100) / 100
      }
    };
  }

  /**
   * 특정 태스크에 의해 차단된 태스크 수 계산
   */
  countTasksBlockedBy(taskId, stateIndex) {
    let count = 0;
    for (const [, task] of Object.entries(stateIndex.tasks)) {
      if (task.dependencies?.includes(taskId) && task.status !== 'completed') {
        count++;
      }
    }
    return count;
  }

  /**
   * 모든 태스크의 우선순위 재계산
   */
  recalculateAllPriorities(stateIndex) {
    const updatedTasks = {};
    
    for (const [taskId, task] of Object.entries(stateIndex.tasks)) {
      const priorityData = this.calculatePriority(task, stateIndex);
      updatedTasks[taskId] = {
        ...task,
        priority_score: priorityData.total,
        priority_breakdown: priorityData.breakdown,
        last_priority_update: new Date().toISOString()
      };
    }

    return updatedTasks;
  }
}
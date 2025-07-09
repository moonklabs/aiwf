#!/usr/bin/env node

/**
 * AI 페르소나 명령어 (한국어)
 * 다양한 개발 작업을 위한 AI 행동 페르소나 관리
 */

import { AIPersonaManager } from '../../../../lib/ai-persona-manager.js';
import path from 'path';
import chalk from 'chalk';

// 전역 페르소나 매니저 인스턴스
let personaManager = null;

/**
 * 페르소나 매니저 인스턴스 가져오기 또는 생성
 */
async function getPersonaManager() {
  if (!personaManager) {
    personaManager = new AIPersonaManager({
      personaConfigPath: path.join(process.cwd(), '.aiwf', 'personas'),
      metricsPath: path.join(process.cwd(), '.aiwf', 'metrics'),
      metricsEnabled: true,
      autoDetectionEnabled: true
    });
    
    await personaManager.init();
  }
  
  return personaManager;
}

/**
 * 페르소나 상태 포맷팅
 */
function formatPersonaStatus(persona, metrics) {
  const lines = [];
  
  lines.push(chalk.cyan('🎭 AI 페르소나 상태'));
  lines.push(chalk.gray('━'.repeat(50)));
  lines.push(`현재 페르소나: ${chalk.yellow(persona.name)}`);
  lines.push(`설명: ${getKoreanDescription(persona.name)}`);
  
  if (persona.behaviors?.length) {
    lines.push('\n주요 동작:');
    getKoreanBehaviors(persona.name).forEach(behavior => {
      lines.push(`  • ${behavior}`);
    });
  }
  
  if (persona.recommendedTools?.length) {
    lines.push(`\n권장 도구: ${persona.recommendedTools.join(', ')}`);
  }
  
  if (metrics && metrics.duration !== undefined) {
    lines.push('\n현재 세션:');
    lines.push(`  진행 시간: ${Math.round(metrics.duration / 1000)}초`);
    lines.push(`  상호작용: ${metrics.interactions}회`);
    lines.push(`  토큰 사용량: ${metrics.tokenUsage.current}`);
  }
  
  return lines.join('\n');
}

/**
 * 페르소나 리포트 포맷팅
 */
function formatPersonaReport(report) {
  const lines = [];
  
  lines.push(chalk.cyan('📊 AI 페르소나 성능 리포트'));
  lines.push(chalk.gray('━'.repeat(50)));
  lines.push(`생성 시간: ${new Date(report.generatedAt).toLocaleString('ko-KR')}`);
  lines.push(`기간: ${getKoreanTimeRange(report.timeRange)}`);
  
  // 요약
  lines.push('\n' + chalk.yellow('요약:'));
  lines.push(`총 세션 수: ${report.summary.totalSessions}`);
  lines.push(`평균 완료 시간: ${Math.round(report.summary.averageCompletionTime / 1000)}초`);
  
  // 페르소나 사용량
  if (report.summary.personaUsage) {
    lines.push('\n' + chalk.yellow('페르소나 사용량:'));
    Object.entries(report.summary.personaUsage).forEach(([persona, stats]) => {
      lines.push(`  ${getKoreanPersonaName(persona)}: ${stats.count}회 (${stats.percentage.toFixed(1)}%)`);
    });
  }
  
  // 품질 트렌드
  if (report.summary.qualityTrend) {
    lines.push('\n' + chalk.yellow('품질 트렌드:'));
    lines.push(`  추세: ${getKoreanTrend(report.summary.qualityTrend.trend)}`);
    if (report.summary.qualityTrend.averageScore) {
      lines.push(`  평균 점수: ${(report.summary.qualityTrend.averageScore * 100).toFixed(1)}%`);
    }
  }
  
  // 페르소나 분석
  if (report.personaAnalysis) {
    lines.push('\n' + chalk.yellow('페르소나 성능:'));
    Object.entries(report.personaAnalysis).forEach(([persona, analysis]) => {
      lines.push(`\n  ${chalk.green(getKoreanPersonaName(persona))}:`);
      lines.push(`    세션 수: ${analysis.sessionCount}`);
      lines.push(`    완료율: ${(analysis.completionRate * 100).toFixed(1)}%`);
      lines.push(`    평균 품질: ${(analysis.averageQualityScore * 100).toFixed(1)}%`);
      lines.push(`    토큰 효율성: ${(analysis.tokenEfficiency * 100).toFixed(1)}%`);
      
      if (analysis.bestUseCases?.length) {
        lines.push(`    최적 사용 사례: ${analysis.bestUseCases.join(', ')}`);
      }
    });
  }
  
  // 권장사항
  if (report.recommendations?.length) {
    lines.push('\n' + chalk.yellow('권장사항:'));
    report.recommendations.forEach(rec => {
      const icon = rec.priority === 'high' ? '🔴' : '🟡';
      lines.push(`  ${icon} ${translateRecommendation(rec.message)}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * 한국어 번역 헬퍼 함수들
 */
function getKoreanPersonaName(persona) {
  const names = {
    architect: '아키텍트',
    debugger: '디버거',
    reviewer: '리뷰어',
    documenter: '문서화 전문가',
    optimizer: '최적화 전문가',
    developer: '개발자'
  };
  return names[persona] || persona;
}

function getKoreanDescription(persona) {
  const descriptions = {
    architect: '시스템 설계 및 아키텍처',
    debugger: '버그 감지 및 문제 해결',
    reviewer: '코드 품질 및 표준',
    documenter: '문서화 및 가이드',
    optimizer: '성능 최적화',
    developer: '일반 개발 (기본값)'
  };
  return descriptions[persona] || '';
}

function getKoreanBehaviors(persona) {
  const behaviors = {
    architect: [
      '큰 그림과 전체 시스템 구조에 집중',
      '확장성과 유지보수성 우선시',
      '디자인 패턴과 아키텍처 원칙 적용',
      '통합 지점과 인터페이스 고려'
    ],
    debugger: [
      '체계적이고 방법론적인 접근',
      '근본 원인 분석에 집중',
      '엣지 케이스와 오류 시나리오 고려',
      '실행 흐름을 단계별로 추적'
    ],
    reviewer: [
      '코딩 표준 준수 확인',
      '보안 취약점 식별',
      '최적화 및 개선 사항 제안',
      '모범 사례 준수 확인'
    ],
    documenter: [
      '명확하고 이해하기 쉬운 설명 작성',
      '실용적인 예제 제공',
      '포괄적인 커버리지 보장',
      '일관된 문서 스타일 유지'
    ],
    optimizer: [
      '성능 병목 현상 분석',
      '효율성과 리소스 사용에 집중',
      '개선 사항 측정 및 벤치마크',
      '최적화 기법 적용'
    ],
    developer: [
      '균형 잡힌 코딩 접근법',
      '기능성과 정확성에 집중',
      '깨끗하고 유지보수 가능한 코드 작성',
      '프로젝트 규칙 준수'
    ]
  };
  return behaviors[persona] || [];
}

function getKoreanTimeRange(range) {
  const ranges = {
    hour: '1시간',
    day: '1일',
    week: '1주일',
    month: '1개월',
    all: '전체'
  };
  return ranges[range] || range;
}

function getKoreanTrend(trend) {
  const trends = {
    improving: '개선 중',
    declining: '하락 중',
    stable: '안정적',
    insufficient_data: '데이터 부족'
  };
  return trends[trend] || trend;
}

function translateRecommendation(message) {
  // 간단한 권장사항 번역
  if (message.includes('Consider using')) {
    return message.replace('Consider using', '다음 페르소나 사용을 고려하세요:');
  }
  if (message.includes('has low quality scores')) {
    return message.replace('tasks have low quality scores', '작업의 품질 점수가 낮습니다');
  }
  if (message.includes('has high error rate')) {
    return message.replace('has high error rate', '오류율이 높습니다');
  }
  return message;
}

/**
 * 명령어 핸들러
 */
export const commands = {
  /**
   * 특정 페르소나로 전환
   */
  '/프로젝트:aiwf:ai_페르소나:전환': async (args) => {
    const personaName = args[0];
    
    if (!personaName) {
      return chalk.red('오류: 페르소나 이름을 지정하세요 (architect, debugger, reviewer, documenter, optimizer, developer)');
    }
    
    try {
      const manager = await getPersonaManager();
      
      if (!manager.isValidPersona(personaName)) {
        return chalk.red(`오류: 잘못된 페르소나 '${personaName}'. 사용 가능한 페르소나: ${manager.getAvailablePersonas().join(', ')}`);
      }
      
      await manager.switchPersona(personaName, { manual: true });
      
      return chalk.green(`✅ ${getKoreanPersonaName(personaName)} 페르소나로 전환했습니다`);
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 특정 페르소나 단축키
   */
  '/프로젝트:aiwf:ai_페르소나:아키텍트': async () => {
    return commands['/프로젝트:aiwf:ai_페르소나:전환'](['architect']);
  },

  '/프로젝트:aiwf:ai_페르소나:디버거': async () => {
    return commands['/프로젝트:aiwf:ai_페르소나:전환'](['debugger']);
  },

  '/프로젝트:aiwf:ai_페르소나:리뷰어': async () => {
    return commands['/프로젝트:aiwf:ai_페르소나:전환'](['reviewer']);
  },

  '/프로젝트:aiwf:ai_페르소나:문서화전문가': async () => {
    return commands['/프로젝트:aiwf:ai_페르소나:전환'](['documenter']);
  },

  '/프로젝트:aiwf:ai_페르소나:최적화전문가': async () => {
    return commands['/프로젝트:aiwf:ai_페르소나:전환'](['optimizer']);
  },

  '/프로젝트:aiwf:ai_페르소나:개발자': async () => {
    return commands['/프로젝트:aiwf:ai_페르소나:전환'](['developer']);
  },

  /**
   * 자동 감지 활성화/비활성화
   */
  '/프로젝트:aiwf:ai_페르소나:자동': async (args) => {
    const enabled = args[0] !== 'false' && args[0] !== '끄기';
    
    try {
      const manager = await getPersonaManager();
      manager.options.autoDetectionEnabled = enabled;
      
      return chalk.green(`✅ 자동 감지가 ${enabled ? '활성화' : '비활성화'}되었습니다`);
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 현재 페르소나 상태 표시
   */
  '/프로젝트:aiwf:ai_페르소나:상태': async () => {
    try {
      const manager = await getPersonaManager();
      const current = manager.getCurrentPersona();
      
      if (!current) {
        return chalk.yellow('현재 활성화된 페르소나가 없습니다');
      }
      
      const metrics = await manager.metricsCollector.getCurrentSessionMetrics();
      
      return formatPersonaStatus(current, metrics);
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 페르소나 성능 리포트 생성
   */
  '/프로젝트:aiwf:ai_페르소나:리포트': async (args) => {
    const timeRange = args[0] || 'all';
    
    try {
      const manager = await getPersonaManager();
      const report = await manager.generateReport({ timeRange });
      
      return formatPersonaReport(report);
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 사용 가능한 페르소나 목록
   */
  '/프로젝트:aiwf:ai_페르소나:목록': async () => {
    try {
      const manager = await getPersonaManager();
      const personas = manager.getAvailablePersonas();
      const current = manager.getCurrentPersona();
      
      const lines = [];
      lines.push(chalk.cyan('🎭 사용 가능한 AI 페르소나'));
      lines.push(chalk.gray('━'.repeat(50)));
      
      for (const personaName of personas) {
        const isCurrent = current?.name === personaName;
        
        lines.push(`\n${isCurrent ? '▶ ' : '  '}${chalk.yellow(getKoreanPersonaName(personaName))}${isCurrent ? ' (현재)' : ''}`);
        lines.push(`  ${getKoreanDescription(personaName)}`);
        
        const persona = manager.availablePersonas[personaName];
        if (persona.focusAreas?.length) {
          lines.push(`  주요 영역: ${persona.focusAreas.slice(0, 3).join(', ')}`);
        }
      }
      
      lines.push('\n' + chalk.gray('/프로젝트:aiwf:ai_페르소나:전환 <이름> 명령으로 페르소나를 변경하세요'));
      
      return lines.join('\n');
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 페르소나 통계 조회
   */
  '/프로젝트:aiwf:ai_페르소나:통계': async (args) => {
    const personaName = args[0];
    
    try {
      const manager = await getPersonaManager();
      
      if (personaName && !manager.isValidPersona(personaName)) {
        return chalk.red(`오류: 잘못된 페르소나 '${personaName}'`);
      }
      
      const targetPersona = personaName || manager.getCurrentPersona()?.name;
      
      if (!targetPersona) {
        return chalk.yellow('지정된 페르소나가 없거나 활성화된 페르소나가 없습니다');
      }
      
      const stats = await manager.getPersonaStats(targetPersona);
      
      if (stats.message) {
        return chalk.yellow(stats.message);
      }
      
      const lines = [];
      lines.push(chalk.cyan(`📊 ${getKoreanPersonaName(targetPersona)} 페르소나 통계`));
      lines.push(chalk.gray('━'.repeat(50)));
      lines.push(`총 세션 수: ${stats.totalSessions}`);
      lines.push(`완료율: ${(stats.completionRate * 100).toFixed(1)}%`);
      lines.push(`평균 진행 시간: ${Math.round(stats.averageDuration / 1000)}초`);
      lines.push(`평균 토큰 사용: ${Math.round(stats.averageTokens)}`);
      lines.push(`오류율: 세션당 ${stats.errorRate.toFixed(2)}회`);
      lines.push(`평균 품질: ${(stats.averageQualityScore * 100).toFixed(1)}%`);
      
      if (stats.taskDistribution && Object.keys(stats.taskDistribution).length > 0) {
        lines.push('\n작업 분포:');
        Object.entries(stats.taskDistribution).forEach(([task, count]) => {
          lines.push(`  ${task}: ${count}`);
        });
      }
      
      return lines.join('\n');
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 페르소나 시스템 리셋
   */
  '/프로젝트:aiwf:ai_페르소나:리셋': async () => {
    try {
      const manager = await getPersonaManager();
      await manager.reset();
      
      return chalk.green('✅ 페르소나 시스템이 기본값(개발자)으로 리셋되었습니다');
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  },

  /**
   * 현재 작업에 최적인 페르소나 감지
   */
  '/프로젝트:aiwf:ai_페르소나:감지': async (args) => {
    const command = args.join(' ');
    
    if (!command) {
      return chalk.red('오류: 작업 설명을 입력하세요');
    }
    
    try {
      const manager = await getPersonaManager();
      
      const taskContext = {
        command,
        description: command
      };
      
      const optimal = await manager.detectOptimalPersona(taskContext);
      
      const lines = [];
      lines.push(chalk.cyan('🔍 페르소나 감지 결과'));
      lines.push(chalk.gray('━'.repeat(50)));
      lines.push(`작업: "${command}"`);
      lines.push(`권장 페르소나: ${chalk.yellow(getKoreanPersonaName(optimal))}`);
      
      const persona = manager.availablePersonas[optimal];
      if (persona) {
        lines.push(`\n이유: ${getKoreanDescription(optimal)}`);
        lines.push(`주요 영역: ${persona.focusAreas.join(', ')}`);
      }
      
      lines.push('\n' + chalk.gray('/프로젝트:aiwf:ai_페르소나:전환 ' + optimal + ' 명령으로 활성화하세요'));
      
      return lines.join('\n');
    } catch (error) {
      return chalk.red(`오류: ${error.message}`);
    }
  }
};

// 테스트를 위한 export
export { getPersonaManager };

// 직접 실행 시 명령줄 인자 처리
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  if (commands[command]) {
    commands[command](args)
      .then(console.log)
      .catch(console.error);
  } else {
    console.error('알 수 없는 명령어:', command);
    console.log('사용 가능한 명령어:', Object.keys(commands).join('\n'));
  }
}
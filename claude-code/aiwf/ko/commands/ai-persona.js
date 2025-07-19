#!/usr/bin/env node

/**
 * AI 페르소나 명령어 (한국어)
 * 다양한 개발 작업을 위한 AI 행동 페르소나 관리
 */

import { AIPersonaManager } from '../../../../src/lib/ai-persona-manager.js';
import { getBackgroundMonitor } from '../utils/background-monitor.js';
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
    security: '보안 전문가',
    frontend: '프론트엔드 전문가',
    backend: '백엔드 전문가',
    data_analyst: '데이터 분석가'
  };
  return names[persona] || persona;
}

function getKoreanDescription(persona) {
  const descriptions = {
    architect: '시스템 설계 및 아키텍처',
    security: '보안 취약점 분석 및 방어',
    frontend: 'UI/UX 및 프론트엔드 개발',
    backend: 'API 설계 및 백엔드 개발',
    data_analyst: '데이터 분석 및 인사이트 도출'
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
    security: [
      'OWASP Top 10 기준 보안 취약점 분석',
      '위험 기반 접근으로 우선순위 설정',
      '공격 시나리오 구성 및 방어 전략 수립',
      '최소 권한 원칙과 다층 보안 적용'
    ],
    frontend: [
      '사용자 경험과 인터페이스 최적화',
      '성능과 접근성을 고려한 구현',
      '반응형 디자인과 크로스 브라우저 호환성',
      '컴포넌트 재사용성과 유지보수성'
    ],
    backend: [
      'API 설계와 데이터베이스 최적화',
      '확장 가능한 서버 아키텍처 구축',
      '캐싱 전략과 성능 튜닝',
      '비동기 처리와 트랜잭션 관리'
    ],
    data_analyst: [
      '데이터 패턴과 트렌드 분석',
      '통계적 검증과 가설 검정',
      '시각화와 대시보드 설계',
      '예측 모델 구축과 평가'
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
      
      // 백그라운드 모니터 초기화 (비차단)
      const monitor = getBackgroundMonitor();
      monitor.initialize().catch(() => {}); // 에러 무시
      
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

// 명령행 인자 처리 함수
async function handlePersonaCommand(personaName) {
  try {
    const fs = await import('fs');
    
    // 기본 모드인 경우
    if (personaName === 'default') {
      // .aiwf 디렉토리에서 실행되는 경우 상위 디렉토리로 이동
      const baseDir = process.cwd().endsWith('.aiwf') ? path.dirname(process.cwd()) : process.cwd();
      const statusPath = path.join(baseDir, '.aiwf', 'current_persona.json');
      const status = {
        active: false,
        persona: null,
        activatedAt: null,
        contextRules: null,
        description: null
      };
      
      fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
      
      console.log(chalk.cyan('🎭 기본 모드로 복원 완료'));
      console.log(chalk.gray('모든 페르소나 컨텍스트가 해제되었습니다'));
      return;
    }
    
    // 유효한 페르소나인지 확인
    const validPersonas = ['architect', 'security', 'frontend', 'backend', 'data_analyst'];
    if (!validPersonas.includes(personaName)) {
      console.log(chalk.red(`❌ 잘못된 페르소나: ${personaName}`));
      console.log(chalk.yellow('사용 가능한 페르소나: ' + validPersonas.join(', ')));
      return;
    }
    
    // .aiwf 디렉토리에서 실행되는 경우 상위 디렉토리로 이동
    const baseDir = process.cwd().endsWith('.aiwf') ? path.dirname(process.cwd()) : process.cwd();
    
    // 컨텍스트 규칙 로드
    const contextRulesPath = path.join(baseDir, '.aiwf', '07_AI_PERSONAS', personaName, 'context_rules.md');
    let contextRules = null;
    
    if (fs.existsSync(contextRulesPath)) {
      contextRules = fs.readFileSync(contextRulesPath, 'utf8');
    }
    
    // 현재 페르소나 상태 저장
    const statusPath = path.join(baseDir, '.aiwf', 'current_persona.json');
    const status = {
      active: true,
      persona: personaName,
      activatedAt: new Date().toISOString(),
      contextRules: contextRules,
      description: getKoreanDescription(personaName)
    };
    
    fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
    
    console.log(chalk.cyan('🎭 AI 페르소나 활성화 완료'));
    console.log(chalk.yellow(`현재 페르소나: ${getKoreanPersonaName(personaName)}`));
    console.log(chalk.gray(`전문 분야: ${getKoreanDescription(personaName)}`));
    
    if (contextRules) {
      console.log(chalk.green('✅ 페르소나 컨텍스트 규칙이 적용되었습니다'));
      console.log(chalk.blue('📋 주요 동작 특성:'));
      getKoreanBehaviors(personaName).forEach(behavior => {
        console.log(chalk.blue(`  • ${behavior}`));
      });
    }
    
    console.log(chalk.yellow('\n💡 이제 Claude Code가 ' + getKoreanPersonaName(personaName) + ' 모드로 동작합니다!'));
    console.log(chalk.gray('페르소나 상태 확인: node ai-persona.js status'));
    
  } catch (error) {
    console.log(chalk.red(`❌ 오류: ${error.message}`));
  }
}

// 직접 실행 시 명령줄 인자 처리
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  // 새로운 5개 페르소나 명령어 처리
  const validPersonas = ['architect', 'security', 'frontend', 'backend', 'data_analyst'];
  
  if (validPersonas.includes(command)) {
    handlePersonaCommand(command);
  } else if (command === 'status') {
    try {
      const fs = await import('fs');
      const baseDir = process.cwd().endsWith('.aiwf') ? path.dirname(process.cwd()) : process.cwd();
      const statusPath = path.join(baseDir, '.aiwf', 'current_persona.json');
      
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        
        if (status.active) {
          console.log(chalk.cyan('🎭 현재 페르소나 상태'));
          console.log(chalk.gray('━'.repeat(50)));
          console.log(chalk.yellow(`활성 페르소나: ${getKoreanPersonaName(status.persona)}`));
          console.log(chalk.gray(`전문 분야: ${status.description}`));
          console.log(chalk.blue(`활성화 시간: ${new Date(status.activatedAt).toLocaleString('ko-KR')}`));
          
          console.log('\n📋 주요 동작 특성:');
          getKoreanBehaviors(status.persona).forEach(behavior => {
            console.log(chalk.blue(`  • ${behavior}`));
          });
        } else {
          console.log(chalk.gray('🎭 현재 기본 모드입니다'));
          console.log(chalk.yellow('사용 가능한 페르소나: architect, security, frontend, backend, data_analyst'));
        }
      } else {
        console.log(chalk.gray('🎭 페르소나가 활성화되지 않았습니다'));
        console.log(chalk.yellow('사용 가능한 페르소나: architect, security, frontend, backend, data_analyst'));
      }
    } catch (error) {
      console.log(chalk.red(`❌ 상태 확인 오류: ${error.message}`));
    }
  } else if (command === 'default') {
    handlePersonaCommand('default');
  } else if (commands[command]) {
    commands[command](args)
      .then(console.log)
      .catch(console.error);
  } else {
    console.error('알 수 없는 명령어:', command);
    console.log('사용 가능한 페르소나: ' + validPersonas.join(', '));
    console.log('기타 명령어: status, default');
  }
}
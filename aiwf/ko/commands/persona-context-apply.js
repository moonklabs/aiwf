/**
 * 페르소나 컨텍스트 적용 명령어
 * AI 페르소나 컨텍스트를 실제로 적용하고 관리하는 CLI 명령어
 */

const fs = require('fs').promises;
const path = require('path');
const ContextRuleParser = require('../utils/context-rule-parser');
const PromptInjector = require('../utils/prompt-injector');
const PersonaBehaviorValidator = require('../utils/persona-behavior-validator');
const ContextUpdateManager = require('../utils/context-update-manager');
const ContextTokenMonitor = require('../utils/context-token-monitor');
const PersonaQualityEvaluator = require('../utils/persona-quality-evaluator');

class PersonaContextApplyCommand {
  constructor() {
    this.contextParser = new ContextRuleParser();
    this.promptInjector = new PromptInjector();
    this.behaviorValidator = new PersonaBehaviorValidator();
    this.updateManager = new ContextUpdateManager();
    this.tokenMonitor = new ContextTokenMonitor();
    this.qualityEvaluator = new PersonaQualityEvaluator();
  }

  /**
   * 명령어 정의
   * @returns {Object} 명령어 설정
   */
  static command() {
    return {
      command: 'persona-context <action>',
      description: 'AI 페르소나 컨텍스트 적용 및 관리',
      builder: (yargs) => {
        return yargs
          .positional('action', {
            describe: '수행할 작업',
            type: 'string',
            choices: ['apply', 'switch', 'validate', 'monitor', 'evaluate', 'watch', 'report']
          })
          .option('persona', {
            alias: 'p',
            describe: '대상 페르소나',
            type: 'string',
            choices: ['architect', 'frontend', 'backend', 'data_analyst', 'security']
          })
          .option('prompt', {
            describe: '적용할 프롬프트',
            type: 'string'
          })
          .option('response', {
            describe: '검증할 응답',
            type: 'string'
          })
          .option('output', {
            alias: 'o',
            describe: '결과 출력 형식',
            type: 'string',
            choices: ['json', 'table', 'detailed'],
            default: 'table'
          })
          .option('save', {
            alias: 's',
            describe: '결과를 파일로 저장',
            type: 'boolean',
            default: false
          });
      },
      handler: async (argv) => {
        const command = new PersonaContextApplyCommand();
        await command.execute(argv);
      }
    };
  }

  /**
   * 명령어 실행
   * @param {Object} argv - 명령어 인자
   */
  async execute(argv) {
    const { action, persona, prompt, response, output, save } = argv;

    try {
      switch (action) {
        case 'apply':
          await this.applyContext(persona, prompt, output, save);
          break;
        
        case 'switch':
          await this.switchPersona(persona);
          break;
        
        case 'validate':
          await this.validateResponse(persona, response, prompt, output);
          break;
        
        case 'monitor':
          await this.monitorTokenUsage(persona, output);
          break;
        
        case 'evaluate':
          await this.evaluateQuality(persona, prompt, response, output);
          break;
        
        case 'watch':
          await this.watchContextChanges();
          break;
        
        case 'report':
          await this.generateReport(persona, output, save);
          break;
        
        default:
          console.error(`알 수 없는 작업: ${action}`);
          process.exit(1);
      }
    } catch (error) {
      console.error('오류 발생:', error.message);
      process.exit(1);
    }
  }

  /**
   * 컨텍스트 적용
   * @param {string} persona - 페르소나 이름
   * @param {string} prompt - 프롬프트
   * @param {string} outputFormat - 출력 형식
   * @param {boolean} save - 저장 여부
   */
  async applyContext(persona, prompt, outputFormat, save) {
    if (!persona || !prompt) {
      throw new Error('페르소나와 프롬프트를 모두 지정해야 합니다.');
    }

    console.log(`\n📋 페르소나 컨텍스트 적용: ${persona}`);
    console.log('━'.repeat(50));

    // 컨텍스트 적용
    const result = await this.promptInjector.injectContext(prompt, persona);

    if (!result.success) {
      throw new Error(`컨텍스트 적용 실패: ${result.error}`);
    }

    // 토큰 사용량 추적
    const tokenUsage = await this.tokenMonitor.trackContextUsage(result);

    // 결과 출력
    this.displayApplyResult(result, tokenUsage, outputFormat);

    // 저장
    if (save) {
      await this.saveResult({
        type: 'context_application',
        persona,
        result,
        tokenUsage
      });
    }
  }

  /**
   * 페르소나 전환
   * @param {string} persona - 새 페르소나
   */
  async switchPersona(persona) {
    if (!persona) {
      throw new Error('전환할 페르소나를 지정해야 합니다.');
    }

    console.log(`\n🔄 페르소나 전환: ${persona}`);
    console.log('━'.repeat(50));

    const switchResult = await this.promptInjector.switchPersona(persona);

    console.log(`이전 페르소나: ${switchResult.previousPersona || '없음'}`);
    console.log(`현재 페르소나: ${switchResult.currentPersona}`);
    console.log(`전환 시각: ${switchResult.switchedAt}`);

    // 새 컨텍스트 정보 표시
    if (switchResult.context) {
      console.log('\n새 페르소나 컨텍스트:');
      console.log(`- 분석 접근법: ${switchResult.context.analysis_approach}`);
      console.log(`- 소통 스타일: ${switchResult.context.communication_style}`);
      if (switchResult.context.design_principles) {
        console.log(`- 설계 원칙: ${switchResult.context.design_principles.join(', ')}`);
      }
    }
  }

  /**
   * 응답 검증
   * @param {string} persona - 페르소나
   * @param {string} response - 응답
   * @param {string} prompt - 원본 프롬프트
   * @param {string} outputFormat - 출력 형식
   */
  async validateResponse(persona, response, prompt, outputFormat) {
    if (!persona || !response) {
      throw new Error('페르소나와 응답을 모두 지정해야 합니다.');
    }

    console.log(`\n✅ 페르소나 행동 패턴 검증: ${persona}`);
    console.log('━'.repeat(50));

    const validation = this.behaviorValidator.validateResponse(
      response,
      persona,
      prompt || '검증용 프롬프트'
    );

    this.displayValidationResult(validation, outputFormat);
  }

  /**
   * 토큰 사용량 모니터링
   * @param {string} persona - 페르소나 (선택)
   * @param {string} outputFormat - 출력 형식
   */
  async monitorTokenUsage(persona, outputFormat) {
    console.log(`\n📊 토큰 사용량 모니터링${persona ? `: ${persona}` : ''}`);
    console.log('━'.repeat(50));

    const report = this.tokenMonitor.generateReport({
      personaName: persona,
      format: outputFormat === 'detailed' ? 'detailed' : 'summary'
    });

    this.displayTokenReport(report, outputFormat);

    // 최적화 제안
    if (persona) {
      const suggestions = this.tokenMonitor.getOptimizationSuggestions(persona);
      if (suggestions.suggestions && suggestions.suggestions.length > 0) {
        console.log('\n💡 최적화 제안:');
        suggestions.suggestions.forEach((suggestion, idx) => {
          console.log(`${idx + 1}. ${suggestion.message}`);
        });
      }
    }
  }

  /**
   * 품질 평가
   * @param {string} persona - 페르소나
   * @param {string} prompt - 프롬프트
   * @param {string} response - 응답
   * @param {string} outputFormat - 출력 형식
   */
  async evaluateQuality(persona, prompt, response, outputFormat) {
    if (!persona || !prompt || !response) {
      throw new Error('페르소나, 프롬프트, 응답을 모두 지정해야 합니다.');
    }

    console.log(`\n⭐ 응답 품질 평가: ${persona}`);
    console.log('━'.repeat(50));

    // 컨텍스트 로드
    const context = await this.contextParser.parseContextRules(persona);

    // 품질 평가
    const evaluation = await this.qualityEvaluator.evaluateResponse({
      prompt,
      response,
      personaName: persona,
      context
    });

    this.displayQualityEvaluation(evaluation, outputFormat);
  }

  /**
   * 컨텍스트 변경 감시
   */
  async watchContextChanges() {
    console.log('\n👁️  컨텍스트 파일 실시간 감시 시작');
    console.log('━'.repeat(50));

    // 이벤트 핸들러 설정
    this.updateManager.on('contextUpdated', (data) => {
      console.log(`\n[${new Date().toISOString()}] 컨텍스트 업데이트 감지`);
      console.log(`- 페르소나: ${data.persona}`);
      console.log(`- 업데이트 유형: ${data.updateType}`);
    });

    this.updateManager.on('error', (data) => {
      console.error(`\n[오류] ${data.error.message}`);
    });

    // 감시 시작
    this.updateManager.startWatching();

    console.log('모든 페르소나 컨텍스트 파일을 감시 중입니다.');
    console.log('종료하려면 Ctrl+C를 누르세요.');

    // 프로세스 종료 처리
    process.on('SIGINT', () => {
      console.log('\n감시 중지 중...');
      this.updateManager.stopWatching();
      process.exit(0);
    });

    // 계속 실행
    await new Promise(() => {});
  }

  /**
   * 종합 리포트 생성
   * @param {string} persona - 페르소나 (선택)
   * @param {string} outputFormat - 출력 형식
   * @param {boolean} save - 저장 여부
   */
  async generateReport(persona, outputFormat, save) {
    console.log(`\n📑 종합 리포트 생성${persona ? `: ${persona}` : ''}`);
    console.log('━'.repeat(50));

    // 검증 통계
    const validationStats = this.behaviorValidator.generateStatistics(persona);
    
    // 품질 평가 통계
    const qualityStats = this.qualityEvaluator.generateStatistics(persona);
    
    // 토큰 사용량 리포트
    const tokenReport = this.tokenMonitor.generateReport({
      personaName: persona,
      format: 'summary'
    });

    const report = {
      generatedAt: new Date().toISOString(),
      persona: persona || 'all',
      validation: validationStats,
      quality: qualityStats,
      tokenUsage: tokenReport
    };

    this.displayComprehensiveReport(report, outputFormat);

    if (save) {
      const filename = `persona-report-${persona || 'all'}-${Date.now()}.json`;
      await this.saveResult(report, filename);
    }
  }

  /**
   * 적용 결과 표시
   * @param {Object} result - 적용 결과
   * @param {Object} tokenUsage - 토큰 사용량
   * @param {string} format - 출력 형식
   */
  displayApplyResult(result, tokenUsage, format) {
    if (format === 'json') {
      console.log(JSON.stringify({ result, tokenUsage }, null, 2));
      return;
    }

    console.log('\n✅ 컨텍스트 적용 완료');
    console.log(`페르소나: ${result.personaName}`);
    console.log(`원본 프롬프트 토큰: ${tokenUsage.originalTokens}`);
    console.log(`컨텍스트 토큰: ${tokenUsage.contextTokens}`);
    console.log(`전체 토큰: ${tokenUsage.totalTokens}`);
    console.log(`토큰 증가율: ${tokenUsage.percentageIncrease}`);

    if (tokenUsage.alert) {
      console.log(`\n⚠️  알림: ${tokenUsage.alert.message}`);
    }

    if (format === 'detailed') {
      console.log('\n주입된 프롬프트:');
      console.log('─'.repeat(40));
      console.log(result.injectedPrompt);
      console.log('─'.repeat(40));
    }
  }

  /**
   * 검증 결과 표시
   * @param {Object} validation - 검증 결과
   * @param {string} format - 출력 형식
   */
  displayValidationResult(validation, format) {
    if (format === 'json') {
      console.log(JSON.stringify(validation, null, 2));
      return;
    }

    console.log(`\n검증 결과: ${validation.valid ? '✅ 유효' : '❌ 무효'}`);
    console.log(`전체 점수: ${(validation.overallScore * 100).toFixed(1)}%`);

    console.log('\n세부 점수:');
    console.log(`- 키워드 일치도: ${(validation.scores.keywordMatch * 100).toFixed(1)}%`);
    console.log(`- 구조 일치도: ${(validation.scores.structureMatch * 100).toFixed(1)}%`);
    console.log(`- 소통 스타일: ${(validation.scores.communicationMatch * 100).toFixed(1)}%`);
    console.log(`- 관심 영역: ${(validation.scores.focusMatch * 100).toFixed(1)}%`);
  }

  /**
   * 토큰 리포트 표시
   * @param {Object} report - 토큰 리포트
   * @param {string} format - 출력 형식
   */
  displayTokenReport(report, format) {
    if (format === 'json') {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    if (report.message) {
      console.log(report.message);
      return;
    }

    console.log(`\n기간: ${report.period.start} ~ ${report.period.end}`);
    console.log(`총 사용 횟수: ${report.totalUsages}`);
    console.log(`총 컨텍스트 토큰: ${report.tokenStats.total}`);
    console.log(`평균 컨텍스트 토큰: ${report.tokenStats.average}`);

    if (report.personaSummary) {
      console.log('\n페르소나별 요약:');
      Object.entries(report.personaSummary).forEach(([persona, stats]) => {
        console.log(`\n${persona}:`);
        console.log(`  - 사용 횟수: ${stats.count}`);
        console.log(`  - 총 토큰: ${stats.totalTokens}`);
        console.log(`  - 평균 토큰: ${Math.round(stats.totalTokens / stats.count)}`);
        if (stats.alerts.warning > 0 || stats.alerts.critical > 0) {
          console.log(`  - 알림: 경고 ${stats.alerts.warning}, 위험 ${stats.alerts.critical}`);
        }
      });
    }

    if (format === 'detailed' && report.trendAnalysis) {
      console.log(`\n트렌드: ${report.trendAnalysis.direction} (${report.trendAnalysis.changePercentage})`);
      if (report.trendAnalysis.prediction !== null) {
        console.log(`예상 다음 사용량: ${report.trendAnalysis.prediction} 토큰`);
      }
    }
  }

  /**
   * 품질 평가 표시
   * @param {Object} evaluation - 평가 결과
   * @param {string} format - 출력 형식
   */
  displayQualityEvaluation(evaluation, format) {
    if (format === 'json') {
      console.log(JSON.stringify(evaluation, null, 2));
      return;
    }

    console.log(`\n품질 수준: ${this.getQualityEmoji(evaluation.quality)} ${evaluation.quality}`);
    console.log(`최종 점수: ${(evaluation.scores.final * 100).toFixed(1)}%`);

    console.log('\n평가 항목:');
    Object.entries(evaluation.scores.individual).forEach(([metric, score]) => {
      const emoji = score >= 0.8 ? '✅' : score >= 0.6 ? '⚠️' : '❌';
      console.log(`${emoji} ${this.getMetricName(metric)}: ${(score * 100).toFixed(1)}%`);
    });

    if (evaluation.feedback && evaluation.feedback.length > 0) {
      console.log('\n피드백:');
      evaluation.feedback.forEach((fb) => {
        console.log(`- ${fb.message}`);
      });
    }

    if (evaluation.recommendations && evaluation.recommendations.length > 0) {
      console.log('\n권장사항:');
      evaluation.recommendations.forEach((rec) => {
        const priorityEmoji = rec.priority === 'high' ? '🔴' : '🟡';
        console.log(`${priorityEmoji} [${rec.area}] ${rec.suggestion}`);
      });
    }
  }

  /**
   * 종합 리포트 표시
   * @param {Object} report - 종합 리포트
   * @param {string} format - 출력 형식
   */
  displayComprehensiveReport(report, format) {
    if (format === 'json') {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log('\n=== 행동 패턴 검증 통계 ===');
    if (report.validation.message) {
      console.log(report.validation.message);
    } else {
      console.log(`검증 횟수: ${report.validation.totalValidations}`);
      console.log(`유효율: ${report.validation.validationRate}`);
      console.log(`평균 점수: ${report.validation.averageScore}`);
    }

    console.log('\n=== 응답 품질 평가 통계 ===');
    if (report.quality.message) {
      console.log(report.quality.message);
    } else {
      console.log(`평가 횟수: ${report.quality.evaluationCount}`);
      console.log(`평균 최종 점수: ${report.quality.averageScores.final}`);
      console.log(`최고 성과 지표: ${this.getMetricName(report.quality.bestPerformingMetric)}`);
      console.log(`개선 필요 지표: ${this.getMetricName(report.quality.worstPerformingMetric)}`);
    }

    console.log('\n=== 토큰 사용량 요약 ===');
    if (report.tokenUsage.message) {
      console.log(report.tokenUsage.message);
    } else {
      console.log(`총 사용 횟수: ${report.tokenUsage.totalUsages}`);
      console.log(`평균 컨텍스트 토큰: ${report.tokenUsage.tokenStats.average}`);
      console.log(`알림 발생: 경고 ${report.tokenUsage.alerts.warning}, 위험 ${report.tokenUsage.alerts.critical}`);
    }
  }

  /**
   * 결과 저장
   * @param {Object} data - 저장할 데이터
   * @param {string} filename - 파일명 (선택)
   */
  async saveResult(data, filename) {
    const reportsDir = path.join(process.cwd(), '.aiwf', 'reports', 'persona-context');
    await fs.mkdir(reportsDir, { recursive: true });

    const defaultFilename = `${data.type || 'report'}-${Date.now()}.json`;
    const filepath = path.join(reportsDir, filename || defaultFilename);

    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n💾 결과 저장됨: ${filepath}`);
  }

  /**
   * 품질 수준 이모지 반환
   * @param {string} quality - 품질 수준
   * @returns {string} 이모지
   */
  getQualityEmoji(quality) {
    const emojis = {
      excellent: '🌟',
      good: '✨',
      fair: '⭐',
      poor: '💫'
    };
    return emojis[quality] || '❓';
  }

  /**
   * 지표 이름 한글 변환
   * @param {string} metric - 지표 키
   * @returns {string} 한글 이름
   */
  getMetricName(metric) {
    const names = {
      relevance: '관련성',
      consistency: '일관성',
      completeness: '완전성',
      clarity: '명확성',
      actionability: '실행가능성'
    };
    return names[metric] || metric;
  }
}

module.exports = PersonaContextApplyCommand;
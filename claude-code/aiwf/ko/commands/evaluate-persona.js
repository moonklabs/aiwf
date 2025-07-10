#!/usr/bin/env node

/**
 * 페르소나 평가 시스템 CLI
 * 페르소나 응답 품질 평가 및 행동 검증
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import prompts from 'prompts';
import PersonaQualityEvaluator from '../utils/persona-quality-evaluator.js';
import PersonaBehaviorValidator from '../utils/persona-behavior-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 헬퍼 함수
function getProjectRoot() {
  const cwd = process.cwd();
  return cwd.endsWith('.aiwf') ? path.dirname(cwd) : cwd;
}

function getCurrentPersona() {
  const statusPath = path.join(getProjectRoot(), '.aiwf', 'current_persona.json');
  if (fs.existsSync(statusPath)) {
    try {
      return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch (error) {
      return null;
    }
  }
  return null;
}

function loadPersonaContext(personaName) {
  const contextPath = path.join(__dirname, '..', 'personas', personaName, 'context_rules.json');
  if (fs.existsSync(contextPath)) {
    try {
      return JSON.parse(fs.readFileSync(contextPath, 'utf8'));
    } catch (error) {
      console.error(chalk.yellow(`컨텍스트 로드 실패: ${error.message}`));
      return null;
    }
  }
  return null;
}

// 평가 관리자
class EvaluationManager {
  constructor() {
    this.qualityEvaluator = new PersonaQualityEvaluator();
    this.behaviorValidator = new PersonaBehaviorValidator();
    this.evaluationDir = path.join(getProjectRoot(), '.aiwf', 'evaluations');
    this.ensureEvaluationDir();
  }

  ensureEvaluationDir() {
    if (!fs.existsSync(this.evaluationDir)) {
      fs.mkdirSync(this.evaluationDir, { recursive: true });
    }
  }

  // 응답 평가
  async evaluateResponse() {
    console.log(chalk.cyan('🎯 페르소나 응답 평가'));
    console.log(chalk.gray('━'.repeat(50)));

    // 현재 페르소나 확인
    const currentPersona = getCurrentPersona();
    if (!currentPersona) {
      console.log(chalk.red('❌ 활성화된 페르소나가 없습니다.'));
      console.log(chalk.yellow('💡 먼저 페르소나를 활성화하세요: aiwf persona use <name>'));
      return;
    }

    // 평가할 내용 입력 받기
    const inputs = await prompts([
      {
        type: 'text',
        name: 'prompt',
        message: '원본 프롬프트를 입력하세요:',
        validate: value => value.length > 0 || '프롬프트는 필수입니다'
      },
      {
        type: 'text',
        name: 'response',
        message: 'AI 응답을 입력하세요:',
        validate: value => value.length > 0 || '응답은 필수입니다',
        multiline: true
      },
      {
        type: 'text',
        name: 'expectedOutcome',
        message: '예상 결과 (선택사항):',
        initial: ''
      }
    ]);

    if (!inputs.prompt || !inputs.response) return;

    console.log(chalk.yellow('\n평가 중...'));

    // 페르소나 컨텍스트 로드
    const context = loadPersonaContext(currentPersona.persona);

    // 품질 평가 수행
    const evaluationResult = await this.qualityEvaluator.evaluateResponse({
      prompt: inputs.prompt,
      response: inputs.response,
      personaName: currentPersona.persona,
      context: context,
      expectedOutcome: inputs.expectedOutcome || null
    });

    // 결과 표시
    this.displayEvaluationResult(evaluationResult);

    // 결과 저장
    this.saveEvaluationResult(evaluationResult);
  }

  // 행동 검증
  async validateBehavior() {
    console.log(chalk.cyan('🔍 페르소나 행동 패턴 검증'));
    console.log(chalk.gray('━'.repeat(50)));

    const currentPersona = getCurrentPersona();
    if (!currentPersona) {
      console.log(chalk.red('❌ 활성화된 페르소나가 없습니다.'));
      return;
    }

    const inputs = await prompts([
      {
        type: 'text',
        name: 'prompt',
        message: '원본 프롬프트를 입력하세요:',
        validate: value => value.length > 0 || '프롬프트는 필수입니다'
      },
      {
        type: 'text',
        name: 'response',
        message: 'AI 응답을 입력하세요:',
        validate: value => value.length > 0 || '응답은 필수입니다',
        multiline: true
      }
    ]);

    if (!inputs.prompt || !inputs.response) return;

    console.log(chalk.yellow('\n검증 중...'));

    // 행동 검증 수행
    const validationResult = this.behaviorValidator.validateResponse(
      inputs.response,
      currentPersona.persona,
      inputs.prompt
    );

    // 결과 표시
    this.displayValidationResult(validationResult);

    // 결과 저장
    this.saveValidationResult(validationResult);
  }

  // 페르소나 비교
  async comparePersonas() {
    console.log(chalk.cyan('🔄 페르소나 비교 평가'));
    console.log(chalk.gray('━'.repeat(50)));

    const inputs = await prompts([
      {
        type: 'text',
        name: 'prompt',
        message: '공통 프롬프트를 입력하세요:',
        validate: value => value.length > 0 || '프롬프트는 필수입니다'
      },
      {
        type: 'multiselect',
        name: 'personas',
        message: '비교할 페르소나를 선택하세요:',
        choices: [
          { title: 'Architect', value: 'architect' },
          { title: 'Security', value: 'security' },
          { title: 'Frontend', value: 'frontend' },
          { title: 'Backend', value: 'backend' },
          { title: 'Data Analyst', value: 'data_analyst' }
        ],
        min: 2,
        hint: '최소 2개 이상 선택'
      }
    ]);

    if (!inputs.prompt || inputs.personas.length < 2) return;

    const responses = [];
    
    // 각 페르소나별 응답 입력 받기
    for (const personaName of inputs.personas) {
      console.log(chalk.yellow(`\n${personaName} 페르소나 응답:`));
      const response = await prompts({
        type: 'text',
        name: 'response',
        message: `${personaName}의 응답을 입력하세요:`,
        multiline: true,
        validate: value => value.length > 0 || '응답은 필수입니다'
      });

      if (response.response) {
        const context = loadPersonaContext(personaName);
        responses.push({
          personaName,
          response: response.response,
          context
        });
      }
    }

    if (responses.length < 2) return;

    console.log(chalk.yellow('\n비교 분석 중...'));

    // 비교 평가 수행
    const comparisonResult = await this.qualityEvaluator.comparePersonaResponses(
      responses,
      inputs.prompt
    );

    // 결과 표시
    this.displayComparisonResult(comparisonResult);

    // 결과 저장
    this.saveComparisonResult(comparisonResult);
  }

  // 평가 리포트 생성
  async generateReport() {
    console.log(chalk.cyan('📊 페르소나 평가 리포트'));
    console.log(chalk.gray('━'.repeat(50)));

    const options = await prompts([
      {
        type: 'select',
        name: 'reportType',
        message: '리포트 유형을 선택하세요:',
        choices: [
          { title: '전체 페르소나 리포트', value: 'all' },
          { title: '특정 페르소나 리포트', value: 'specific' },
          { title: '비교 분석 리포트', value: 'comparison' }
        ]
      }
    ]);

    if (!options.reportType) return;

    let reportData;

    switch (options.reportType) {
      case 'all':
        reportData = this.generateAllPersonasReport();
        break;
      
      case 'specific':
        const persona = await prompts({
          type: 'select',
          name: 'persona',
          message: '페르소나를 선택하세요:',
          choices: [
            { title: 'Architect', value: 'architect' },
            { title: 'Security', value: 'security' },
            { title: 'Frontend', value: 'frontend' },
            { title: 'Backend', value: 'backend' },
            { title: 'Data Analyst', value: 'data_analyst' }
          ]
        });
        
        if (persona.persona) {
          reportData = this.generatePersonaReport(persona.persona);
        }
        break;
      
      case 'comparison':
        reportData = this.generateComparisonReport();
        break;
    }

    if (reportData) {
      this.displayReport(reportData);
      this.saveReport(reportData);
    }
  }

  // 평가 결과 표시
  displayEvaluationResult(result) {
    console.log(chalk.green('\n✅ 평가 완료'));
    console.log(chalk.gray('━'.repeat(50)));
    
    // 점수 표시
    console.log(chalk.cyan('📊 평가 점수:'));
    console.log(`  최종 점수: ${this.getScoreColor(result.scores.final)}(${(result.scores.final * 100).toFixed(1)}%)`);
    console.log(`  품질 수준: ${this.getQualityColor(result.quality)}`);
    
    // 세부 점수
    console.log(chalk.cyan('\n📈 세부 점수:'));
    Object.entries(result.scores.individual).forEach(([metric, score]) => {
      const metricName = this.getMetricName(metric);
      console.log(`  ${metricName}: ${this.getScoreColor(score)}(${(score * 100).toFixed(1)}%)`);
    });
    
    // 피드백
    if (result.feedback.length > 0) {
      console.log(chalk.cyan('\n💬 피드백:'));
      result.feedback.forEach(fb => {
        console.log(`  ${chalk.yellow('•')} ${fb.message}`);
      });
    }
    
    // 권장사항
    if (result.recommendations.length > 0) {
      console.log(chalk.cyan('\n💡 개선 권장사항:'));
      result.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? chalk.red('높음') : chalk.yellow('중간');
        console.log(`  [${priority}] ${rec.area}: ${rec.suggestion}`);
      });
    }
  }

  // 검증 결과 표시
  displayValidationResult(result) {
    console.log(chalk.green('\n✅ 검증 완료'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(`검증 결과: ${result.valid ? chalk.green('유효') : chalk.red('무효')}`);
    console.log(`전체 점수: ${this.getScoreColor(result.overallScore)}(${(result.overallScore * 100).toFixed(1)}%)`);
    
    console.log(chalk.cyan('\n🔍 세부 분석:'));
    Object.entries(result.scores).forEach(([key, score]) => {
      const name = this.getValidationMetricName(key);
      console.log(`  ${name}: ${this.getScoreColor(score)}(${(score * 100).toFixed(1)}%)`);
    });
    
    // 통계 표시
    const stats = this.behaviorValidator.generateStatistics(result.personaName);
    if (stats.totalValidations > 0) {
      console.log(chalk.cyan('\n📊 누적 통계:'));
      console.log(`  총 검증 횟수: ${stats.totalValidations}`);
      console.log(`  유효율: ${stats.validationRate}`);
      console.log(`  평균 점수: ${stats.averageScore}`);
    }
  }

  // 비교 결과 표시
  displayComparisonResult(result) {
    console.log(chalk.green('\n✅ 비교 평가 완료'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(chalk.cyan('🏆 종합 순위:'));
    result.ranking.forEach((item, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${item.persona}: ${this.getScoreColor(item.score)}(${(item.score * 100).toFixed(1)}%) - ${this.getQualityColor(item.quality)}`);
    });
    
    console.log(chalk.cyan('\n📊 지표별 최고 성과:'));
    Object.entries(result.analysis).forEach(([metric, data]) => {
      const metricName = this.getMetricName(metric);
      console.log(`  ${metricName}: ${chalk.green(data.best.persona)} (${(data.best.score * 100).toFixed(1)}%)`);
    });
  }

  // 리포트 표시
  displayReport(reportData) {
    console.log(chalk.green('\n📄 평가 리포트'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(chalk.cyan(`📅 생성일시: ${reportData.generatedAt}`));
    console.log(chalk.cyan(`📋 리포트 유형: ${reportData.type}`));
    
    if (reportData.summary) {
      console.log(chalk.cyan('\n📊 요약:'));
      Object.entries(reportData.summary).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    if (reportData.details) {
      console.log(chalk.cyan('\n📈 상세 내용:'));
      console.log(reportData.details);
    }
  }

  // 유틸리티 메서드들
  getScoreColor(score) {
    if (score >= 0.8) return chalk.green(score.toFixed(3));
    if (score >= 0.6) return chalk.yellow(score.toFixed(3));
    return chalk.red(score.toFixed(3));
  }

  getQualityColor(quality) {
    const colors = {
      excellent: chalk.green('우수'),
      good: chalk.cyan('양호'),
      fair: chalk.yellow('보통'),
      poor: chalk.red('개선필요')
    };
    return colors[quality] || quality;
  }

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

  getValidationMetricName(metric) {
    const names = {
      keywordMatch: '키워드 매칭',
      structureMatch: '구조 일치도',
      communicationMatch: '소통 스타일',
      focusMatch: '관심 영역'
    };
    return names[metric] || metric;
  }

  // 결과 저장 메서드들
  saveEvaluationResult(result) {
    const filename = `evaluation_${result.personaName}_${Date.now()}.json`;
    const filepath = path.join(this.evaluationDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(chalk.gray(`\n💾 결과 저장: ${path.relative(getProjectRoot(), filepath)}`));
  }

  saveValidationResult(result) {
    const filename = `validation_${result.personaName}_${Date.now()}.json`;
    const filepath = path.join(this.evaluationDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(chalk.gray(`\n💾 결과 저장: ${path.relative(getProjectRoot(), filepath)}`));
  }

  saveComparisonResult(result) {
    const filename = `comparison_${Date.now()}.json`;
    const filepath = path.join(this.evaluationDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(chalk.gray(`\n💾 결과 저장: ${path.relative(getProjectRoot(), filepath)}`));
  }

  saveReport(reportData) {
    const filename = `report_${reportData.type}_${Date.now()}.json`;
    const filepath = path.join(this.evaluationDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
    console.log(chalk.gray(`\n💾 리포트 저장: ${path.relative(getProjectRoot(), filepath)}`));
  }

  // 리포트 생성 메서드들
  generateAllPersonasReport() {
    const personas = ['architect', 'security', 'frontend', 'backend', 'data_analyst'];
    const report = {
      type: '전체 페르소나',
      generatedAt: new Date().toISOString(),
      summary: {},
      details: {}
    };

    personas.forEach(persona => {
      const stats = this.qualityEvaluator.generateStatistics(persona);
      report.details[persona] = stats;
    });

    // 전체 요약
    const allStats = this.qualityEvaluator.generateStatistics();
    report.summary = {
      '총 평가 횟수': allStats.evaluationCount || 0,
      '평균 최종 점수': allStats.averageScores?.final || 'N/A'
    };

    return report;
  }

  generatePersonaReport(personaName) {
    const stats = this.qualityEvaluator.generateStatistics(personaName);
    const validationStats = this.behaviorValidator.generateStatistics(personaName);
    
    return {
      type: `${personaName} 페르소나`,
      generatedAt: new Date().toISOString(),
      summary: {
        '평가 횟수': stats.evaluationCount || 0,
        '평균 점수': stats.averageScores?.final || 'N/A',
        '검증 유효율': validationStats.validationRate || 'N/A'
      },
      details: {
        qualityStats: stats,
        behaviorStats: validationStats
      }
    };
  }

  generateComparisonReport() {
    // 최근 비교 결과들을 로드하여 리포트 생성
    const files = fs.readdirSync(this.evaluationDir)
      .filter(f => f.startsWith('comparison_'))
      .sort()
      .slice(-5); // 최근 5개

    const comparisons = files.map(f => {
      const content = fs.readFileSync(path.join(this.evaluationDir, f), 'utf8');
      return JSON.parse(content);
    });

    return {
      type: '비교 분석',
      generatedAt: new Date().toISOString(),
      summary: {
        '비교 횟수': comparisons.length,
        '분석 기간': files.length > 0 ? `${files[0]} ~ ${files[files.length-1]}` : 'N/A'
      },
      details: comparisons
    };
  }
}

// CLI 명령어 처리
async function main() {
  const command = process.argv[2];
  const manager = new EvaluationManager();

  switch (command) {
    case 'evaluate-response':
      await manager.evaluateResponse();
      break;
    
    case 'validate-behavior':
      await manager.validateBehavior();
      break;
    
    case 'compare-personas':
      await manager.comparePersonas();
      break;
    
    case 'generate-report':
      await manager.generateReport();
      break;
    
    default:
      console.log(chalk.yellow('사용법:'));
      console.log('  evaluate-persona.js evaluate-response  - 응답 품질 평가');
      console.log('  evaluate-persona.js validate-behavior  - 행동 패턴 검증');
      console.log('  evaluate-persona.js compare-personas   - 페르소나 비교');
      console.log('  evaluate-persona.js generate-report    - 평가 리포트 생성');
  }
}

// 실행
main().catch(error => {
  console.error(chalk.red(`오류: ${error.message}`));
  process.exit(1);
});
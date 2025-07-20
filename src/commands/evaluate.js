#!/usr/bin/env node

/**
 * AIWF 평가 명령어
 * AI 응답 품질 평가 및 개선
 */

import { ResourceLoader } from '../lib/resource-loader.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

class EvaluateCommand {
  constructor() {
    this.resourceLoader = new ResourceLoader();
    this.evaluationPath = path.join(process.cwd(), '.aiwf', 'evaluations');
  }

  /**
   * Evaluate 명령어 실행
   */
  async execute(args) {
    const [subcommand, ...restArgs] = args;

    switch (subcommand) {
      case 'response':
        await this.evaluateResponse(restArgs);
        break;
      case 'code':
        await this.evaluateCode(restArgs);
        break;
      case 'persona':
        await this.evaluatePersona(restArgs);
        break;
      case 'report':
        await this.generateReport();
        break;
      case 'criteria':
        await this.showCriteria();
        break;
      default:
        this.showHelp();
        break;
    }
  }

  /**
   * AI 응답 평가
   */
  async evaluateResponse(args) {
    const [responsePath] = args;
    
    if (!responsePath) {
      console.error(chalk.red('❌ 평가할 응답 파일 경로를 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf evaluate response <파일경로>'));
      return;
    }

    try {
      // 평가자 모듈 로드
      const evaluatorModule = await this.resourceLoader.loadUtil('simplified-evaluator.js');
      const SimplifiedEvaluator = evaluatorModule.SimplifiedEvaluator || evaluatorModule.default;
      
      if (!SimplifiedEvaluator) {
        throw new Error('SimplifiedEvaluator 모듈을 로드할 수 없습니다.');
      }

      const evaluator = new SimplifiedEvaluator();
      
      // 응답 내용 읽기
      const content = await fs.readFile(responsePath, 'utf8');
      
      console.log(chalk.cyan('🔍 AI 응답 평가 중...'));
      
      // 평가 수행
      const evaluation = await evaluator.evaluate(content, 'response');
      
      // 결과 표시
      this.displayEvaluation(evaluation);
      
      // 평가 결과 저장
      await this.saveEvaluation(evaluation, 'response', responsePath);
      
    } catch (error) {
      console.error(chalk.red('❌ 응답 평가 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 코드 품질 평가
   */
  async evaluateCode(args) {
    const [codePath] = args;
    
    if (!codePath) {
      console.error(chalk.red('❌ 평가할 코드 파일 경로를 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf evaluate code <파일경로>'));
      return;
    }

    try {
      const evaluatorModule = await this.resourceLoader.loadUtil('simplified-evaluator.js');
      const SimplifiedEvaluator = evaluatorModule.SimplifiedEvaluator || evaluatorModule.default;
      
      const evaluator = new SimplifiedEvaluator();
      
      // 코드 내용 읽기
      const code = await fs.readFile(codePath, 'utf8');
      const language = path.extname(codePath).slice(1) || 'javascript';
      
      console.log(chalk.cyan('🔍 코드 품질 평가 중...'));
      
      // 평가 수행
      const evaluation = await evaluator.evaluateCode(code, language);
      
      // 결과 표시
      this.displayCodeEvaluation(evaluation);
      
      // 평가 결과 저장
      await this.saveEvaluation(evaluation, 'code', codePath);
      
    } catch (error) {
      console.error(chalk.red('❌ 코드 평가 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 페르소나 적합성 평가
   */
  async evaluatePersona(args) {
    const [contentPath, personaName] = args;
    
    if (!contentPath || !personaName) {
      console.error(chalk.red('❌ 콘텐츠 경로와 페르소나 이름을 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf evaluate persona <파일경로> <페르소나명>'));
      return;
    }

    try {
      // 페르소나 인식 평가자 로드
      const backgroundModule = await this.resourceLoader.loadUtil('background-monitor.js');
      const BackgroundMonitor = backgroundModule.BackgroundMonitor || backgroundModule.default;
      
      const monitor = new BackgroundMonitor();
      
      // 콘텐츠 읽기
      const content = await fs.readFile(contentPath, 'utf8');
      
      console.log(chalk.cyan(`🎭 페르소나 적합성 평가 중 (${personaName})...`));
      
      // 평가 수행
      const result = await monitor.monitorResponse(content, personaName);
      
      // 결과 표시
      this.displayPersonaEvaluation(result, personaName);
      
      // 평가 결과 저장
      await this.saveEvaluation(result, 'persona', contentPath, { persona: personaName });
      
    } catch (error) {
      console.error(chalk.red('❌ 페르소나 평가 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 평가 리포트 생성
   */
  async generateReport() {
    try {
      const evaluations = await this.loadAllEvaluations();
      
      if (evaluations.length === 0) {
        console.log(chalk.yellow('⚠️  저장된 평가 결과가 없습니다.'));
        return;
      }

      console.log(chalk.cyan('📊 평가 리포트 생성 중...'));
      
      const report = this.createReport(evaluations);
      const reportPath = path.join(this.evaluationPath, 'reports', `evaluation-report-${Date.now()}.md`);
      
      await fs.ensureDir(path.dirname(reportPath));
      await fs.writeFile(reportPath, report);
      
      console.log(chalk.green(`✅ 리포트가 생성되었습니다: ${reportPath}`));
      
      // 요약 표시
      const summary = this.createSummary(evaluations);
      console.log(chalk.cyan('\n📈 평가 요약:'));
      console.log(summary);
      
    } catch (error) {
      console.error(chalk.red('❌ 리포트 생성 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 평가 기준 표시
   */
  async showCriteria() {
    try {
      const criteria = await this.resourceLoader.loadJSON('personas', 'evaluation_criteria.json');
      
      console.log(chalk.cyan('📋 평가 기준'));
      console.log(chalk.gray('-'.repeat(50)));
      
      // 응답 평가 기준
      console.log(chalk.bold('\n응답 평가 기준:'));
      Object.entries(criteria.response || {}).forEach(([key, desc]) => {
        console.log(`  • ${chalk.yellow(key)}: ${desc}`);
      });
      
      // 코드 평가 기준
      console.log(chalk.bold('\n코드 평가 기준:'));
      Object.entries(criteria.code || {}).forEach(([key, desc]) => {
        console.log(`  • ${chalk.yellow(key)}: ${desc}`);
      });
      
      // 페르소나 평가 기준
      console.log(chalk.bold('\n페르소나 평가 기준:'));
      Object.entries(criteria.persona || {}).forEach(([key, desc]) => {
        console.log(`  • ${chalk.yellow(key)}: ${desc}`);
      });
      
    } catch (error) {
      // 기본 기준 표시
      console.log(chalk.cyan('📋 평가 기준'));
      console.log(chalk.gray('-'.repeat(50)));
      console.log('\n기본 평가 항목:');
      console.log('  • 정확성: 요구사항을 정확히 충족하는가');
      console.log('  • 명확성: 이해하기 쉽고 명확한가');
      console.log('  • 완전성: 필요한 모든 정보를 포함하는가');
      console.log('  • 일관성: 스타일과 접근법이 일관되는가');
      console.log('  • 효율성: 최적화되고 효율적인가');
    }
  }

  /**
   * 평가 결과 표시
   */
  displayEvaluation(evaluation) {
    console.log(chalk.cyan('\n📊 평가 결과'));
    console.log(chalk.gray('-'.repeat(50)));
    
    const score = evaluation.score || 0;
    const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
    
    console.log(`전체 점수: ${chalk[scoreColor](`${score}/100`)}`);
    
    if (evaluation.criteria) {
      console.log('\n세부 평가:');
      Object.entries(evaluation.criteria).forEach(([criterion, value]) => {
        const itemScore = value.score || value;
        const itemColor = itemScore >= 80 ? 'green' : itemScore >= 60 ? 'yellow' : 'red';
        console.log(`  • ${criterion}: ${chalk[itemColor](`${itemScore}/100`)}`);
        if (value.feedback) {
          console.log(`    ${chalk.gray(value.feedback)}`);
        }
      });
    }
    
    if (evaluation.suggestions && evaluation.suggestions.length > 0) {
      console.log('\n💡 개선 제안:');
      evaluation.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }
  }

  /**
   * 코드 평가 결과 표시
   */
  displayCodeEvaluation(evaluation) {
    this.displayEvaluation(evaluation);
    
    if (evaluation.issues && evaluation.issues.length > 0) {
      console.log('\n⚠️  발견된 문제:');
      evaluation.issues.forEach((issue, index) => {
        const severity = issue.severity || 'info';
        const severityColor = severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'gray';
        console.log(`  ${index + 1}. [${chalk[severityColor](severity.toUpperCase())}] ${issue.message}`);
        if (issue.line) {
          console.log(`     ${chalk.gray(`라인 ${issue.line}`)}`);
        }
      });
    }
  }

  /**
   * 페르소나 평가 결과 표시
   */
  displayPersonaEvaluation(result, personaName) {
    console.log(chalk.cyan(`\n🎭 페르소나 적합성 평가: ${personaName}`));
    console.log(chalk.gray('-'.repeat(50)));
    
    if (result.isAppropriate) {
      console.log(chalk.green('✅ 페르소나에 적합한 응답입니다.'));
    } else {
      console.log(chalk.red('❌ 페르소나에 적합하지 않은 응답입니다.'));
    }
    
    if (result.confidence) {
      const confColor = result.confidence >= 0.8 ? 'green' : result.confidence >= 0.6 ? 'yellow' : 'red';
      console.log(`신뢰도: ${chalk[confColor](`${(result.confidence * 100).toFixed(0)}%`)}`);
    }
    
    if (result.feedback) {
      console.log(`\n피드백:\n${result.feedback}`);
    }
    
    if (result.characteristics) {
      console.log('\n발견된 특성:');
      Object.entries(result.characteristics).forEach(([char, present]) => {
        const icon = present ? '✅' : '❌';
        console.log(`  ${icon} ${char}`);
      });
    }
  }

  /**
   * 평가 결과 저장
   */
  async saveEvaluation(evaluation, type, filePath, metadata = {}) {
    const timestamp = new Date().toISOString();
    const id = `eval-${type}-${Date.now()}`;
    
    const data = {
      id,
      type,
      timestamp,
      filePath,
      evaluation,
      metadata
    };
    
    const savePath = path.join(this.evaluationPath, `${id}.json`);
    await fs.ensureDir(this.evaluationPath);
    await fs.writeJson(savePath, data, { spaces: 2 });
    
    console.log(chalk.gray(`\n평가 결과 저장됨: ${savePath}`));
  }

  /**
   * 모든 평가 결과 로드
   */
  async loadAllEvaluations() {
    const evaluations = [];
    
    if (!fs.existsSync(this.evaluationPath)) {
      return evaluations;
    }
    
    const files = await fs.readdir(this.evaluationPath);
    for (const file of files) {
      if (file.endsWith('.json') && file.startsWith('eval-')) {
        try {
          const data = await fs.readJson(path.join(this.evaluationPath, file));
          evaluations.push(data);
        } catch (error) {
          // 잘못된 파일 무시
        }
      }
    }
    
    return evaluations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 평가 리포트 생성
   */
  createReport(evaluations) {
    const report = [];
    
    report.push('# AIWF 평가 리포트');
    report.push(`\n생성일: ${new Date().toISOString()}`);
    report.push(`총 평가 수: ${evaluations.length}`);
    
    // 타입별 통계
    const byType = {};
    evaluations.forEach(evaluation => {
      byType[evaluation.type] = (byType[evaluation.type] || 0) + 1;
    });
    
    report.push('\n## 평가 유형별 통계');
    Object.entries(byType).forEach(([type, count]) => {
      report.push(`- ${type}: ${count}건`);
    });
    
    // 최근 평가 목록
    report.push('\n## 최근 평가 (최대 10건)');
    evaluations.slice(0, 10).forEach((evaluation, index) => {
      const score = evaluation.evaluation.score || 0;
      report.push(`\n### ${index + 1}. ${evaluation.type} 평가 - ${evaluation.filePath}`);
      report.push(`- 시간: ${evaluation.timestamp}`);
      report.push(`- 점수: ${score}/100`);
      if (evaluation.evaluation.suggestions) {
        report.push('- 제안사항:');
        evaluation.evaluation.suggestions.forEach(s => report.push(`  - ${s}`));
      }
    });
    
    return report.join('\n');
  }

  /**
   * 평가 요약 생성
   */
  createSummary(evaluations) {
    const totalScore = evaluations.reduce((sum, e) => sum + (e.evaluation.score || 0), 0);
    const avgScore = evaluations.length > 0 ? totalScore / evaluations.length : 0;
    
    const summary = [];
    summary.push(`평균 점수: ${avgScore.toFixed(1)}/100`);
    summary.push(`총 평가 수: ${evaluations.length}`);
    
    // 타입별 평균
    const typeScores = {};
    const typeCounts = {};
    
    evaluations.forEach(evaluation => {
      const type = evaluation.type;
      const score = evaluation.evaluation.score || 0;
      typeScores[type] = (typeScores[type] || 0) + score;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    summary.push('\n타입별 평균 점수:');
    Object.keys(typeScores).forEach(type => {
      const avg = typeScores[type] / typeCounts[type];
      summary.push(`  - ${type}: ${avg.toFixed(1)}/100`);
    });
    
    return summary.join('\n');
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log(chalk.cyan('🔍 AIWF 평가 도구'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log('사용법: aiwf evaluate <명령어> [옵션]');
    console.log('');
    console.log('명령어:');
    console.log('  response <파일>         AI 응답 품질 평가');
    console.log('  code <파일>             코드 품질 평가');
    console.log('  persona <파일> <이름>   페르소나 적합성 평가');
    console.log('  report                  평가 리포트 생성');
    console.log('  criteria                평가 기준 표시');
    console.log('');
    console.log('예시:');
    console.log('  aiwf evaluate response response.md');
    console.log('  aiwf evaluate code src/app.js');
    console.log('  aiwf evaluate persona output.txt architect');
    console.log('  aiwf evaluate report');
  }
}

export default EvaluateCommand;
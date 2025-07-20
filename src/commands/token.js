#!/usr/bin/env node

/**
 * AIWF 토큰 추적 명령어
 * AI 토큰 사용량 모니터링 및 분석
 */

import { ResourceLoader } from '../lib/resource-loader.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

class TokenCommand {
  constructor() {
    this.resourceLoader = new ResourceLoader();
    this.tokenDataPath = path.join(process.cwd(), '.aiwf', 'token-usage');
  }

  /**
   * Token 명령어 실행
   */
  async execute(args) {
    const [subcommand, ...restArgs] = args;

    switch (subcommand) {
      case 'status':
        await this.showStatus();
        break;
      case 'report':
        await this.generateReport(restArgs);
        break;
      case 'track':
        await this.trackUsage(restArgs);
        break;
      case 'reset':
        await this.resetTracking();
        break;
      case 'limit':
        await this.setLimit(restArgs);
        break;
      default:
        this.showHelp();
        break;
    }
  }

  /**
   * 토큰 사용 상태 표시
   */
  async showStatus() {
    try {
      // 토큰 추적 모듈 로드
      const tokenTrackerModule = await this.resourceLoader.loadUtil('token-tracker.js');
      const TokenTracker = tokenTrackerModule.TokenTracker || tokenTrackerModule.default;
      
      if (!TokenTracker) {
        throw new Error('TokenTracker 모듈을 로드할 수 없습니다.');
      }

      const tracker = new TokenTracker({
        storageDir: this.tokenDataPath
      });

      await tracker.init();
      const stats = await tracker.getStatistics();
      const limits = await this.getLimits();

      console.log(chalk.cyan('💰 토큰 사용 현황'));
      console.log(chalk.gray('-'.repeat(50)));
      
      // 오늘 사용량
      console.log(chalk.bold('오늘 사용량:'));
      console.log(`  입력 토큰: ${chalk.yellow(stats.today.input.toLocaleString())}`);
      console.log(`  출력 토큰: ${chalk.yellow(stats.today.output.toLocaleString())}`);
      console.log(`  총 토큰: ${chalk.yellow(stats.today.total.toLocaleString())}`);
      
      if (limits.daily > 0) {
        const dailyUsagePercent = (stats.today.total / limits.daily * 100).toFixed(1);
        const dailyColor = dailyUsagePercent > 90 ? 'red' : dailyUsagePercent > 70 ? 'yellow' : 'green';
        console.log(`  일일 한도: ${chalk[dailyColor](`${dailyUsagePercent}% 사용`)}`);
      }

      // 이번 주 사용량
      console.log(chalk.bold('\n이번 주 사용량:'));
      console.log(`  입력 토큰: ${chalk.yellow(stats.week.input.toLocaleString())}`);
      console.log(`  출력 토큰: ${chalk.yellow(stats.week.output.toLocaleString())}`);
      console.log(`  총 토큰: ${chalk.yellow(stats.week.total.toLocaleString())}`);

      // 이번 달 사용량
      console.log(chalk.bold('\n이번 달 사용량:'));
      console.log(`  입력 토큰: ${chalk.yellow(stats.month.input.toLocaleString())}`);
      console.log(`  출력 토큰: ${chalk.yellow(stats.month.output.toLocaleString())}`);
      console.log(`  총 토큰: ${chalk.yellow(stats.month.total.toLocaleString())}`);
      
      if (limits.monthly > 0) {
        const monthlyUsagePercent = (stats.month.total / limits.monthly * 100).toFixed(1);
        const monthlyColor = monthlyUsagePercent > 90 ? 'red' : monthlyUsagePercent > 70 ? 'yellow' : 'green';
        console.log(`  월간 한도: ${chalk[monthlyColor](`${monthlyUsagePercent}% 사용`)}`);
      }

      // 전체 통계
      console.log(chalk.bold('\n전체 통계:'));
      console.log(`  총 세션: ${stats.overall.sessions}`);
      console.log(`  평균 세션당 토큰: ${Math.round(stats.overall.total / stats.overall.sessions).toLocaleString()}`);
      console.log(`  최대 단일 세션: ${stats.overall.maxSession.toLocaleString()} 토큰`);

      console.log(chalk.gray('\n' + '-'.repeat(50)));
      console.log(chalk.gray('상세 리포트: aiwf token report'));
      
    } catch (error) {
      console.error(chalk.red('❌ 토큰 상태 조회 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 토큰 사용 리포트 생성
   */
  async generateReport(args) {
    const [period = 'week'] = args;
    
    try {
      // 토큰 리포터 모듈 로드
      const reporterModule = await this.resourceLoader.loadUtil('token-reporter.js');
      const TokenReporter = reporterModule.TokenReporter || reporterModule.default;
      
      if (!TokenReporter) {
        throw new Error('TokenReporter 모듈을 로드할 수 없습니다.');
      }

      const reporter = new TokenReporter({
        storageDir: this.tokenDataPath
      });

      console.log(chalk.cyan(`📊 토큰 사용 리포트 (${period})`));
      console.log(chalk.gray('생성 중...'));

      const report = await reporter.generateReport(period);
      const reportPath = path.join(this.tokenDataPath, 'reports', `token-report-${period}-${Date.now()}.md`);
      
      await fs.ensureDir(path.dirname(reportPath));
      await fs.writeFile(reportPath, report);

      console.log(chalk.green(`✅ 리포트가 생성되었습니다: ${reportPath}`));
      
      // 리포트 요약 표시
      console.log(chalk.cyan('\n📄 리포트 요약:'));
      const lines = report.split('\n').slice(0, 20);
      console.log(lines.join('\n'));
      console.log(chalk.gray('\n... (전체 리포트는 파일을 확인하세요)'));
      
    } catch (error) {
      console.error(chalk.red('❌ 리포트 생성 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 토큰 사용량 추적
   */
  async trackUsage(args) {
    const [inputTokens, outputTokens] = args.map(Number);
    
    if (!inputTokens || !outputTokens) {
      console.error(chalk.red('❌ 입력 토큰과 출력 토큰 수를 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf token track <입력토큰> <출력토큰>'));
      return;
    }

    try {
      const trackerModule = await this.resourceLoader.loadUtil('token-tracker.js');
      const TokenTracker = trackerModule.TokenTracker || trackerModule.default;
      
      const tracker = new TokenTracker({
        storageDir: this.tokenDataPath
      });

      await tracker.init();
      await tracker.trackUsage({
        input: inputTokens,
        output: outputTokens,
        timestamp: new Date().toISOString(),
        source: 'manual'
      });

      console.log(chalk.green('✅ 토큰 사용량이 기록되었습니다.'));
      console.log(`입력: ${chalk.yellow(inputTokens.toLocaleString())} 토큰`);
      console.log(`출력: ${chalk.yellow(outputTokens.toLocaleString())} 토큰`);
      console.log(`총합: ${chalk.yellow((inputTokens + outputTokens).toLocaleString())} 토큰`);
      
    } catch (error) {
      console.error(chalk.red('❌ 토큰 추적 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 토큰 추적 초기화
   */
  async resetTracking() {
    try {
      const confirm = await this.confirmReset();
      if (!confirm) {
        console.log(chalk.yellow('초기화가 취소되었습니다.'));
        return;
      }

      await fs.remove(this.tokenDataPath);
      console.log(chalk.green('✅ 토큰 추적 데이터가 초기화되었습니다.'));
      
    } catch (error) {
      console.error(chalk.red('❌ 초기화 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 토큰 사용 한도 설정
   */
  async setLimit(args) {
    const [limitType, limitValue] = args;
    
    if (!limitType || !limitValue) {
      console.error(chalk.red('❌ 한도 유형과 값을 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf token limit <daily|monthly> <값>'));
      return;
    }

    const validTypes = ['daily', 'monthly'];
    if (!validTypes.includes(limitType)) {
      console.error(chalk.red(`❌ 유효하지 않은 한도 유형: ${limitType}`));
      console.log(chalk.gray('유효한 유형: daily, monthly'));
      return;
    }

    const limit = parseInt(limitValue);
    if (isNaN(limit) || limit < 0) {
      console.error(chalk.red('❌ 한도 값은 0 이상의 숫자여야 합니다.'));
      return;
    }

    try {
      const configPath = path.join(this.tokenDataPath, 'limits.json');
      await fs.ensureDir(this.tokenDataPath);
      
      let limits = {};
      if (fs.existsSync(configPath)) {
        limits = await fs.readJson(configPath);
      }

      limits[limitType] = limit;
      await fs.writeJson(configPath, limits, { spaces: 2 });

      console.log(chalk.green(`✅ ${limitType === 'daily' ? '일일' : '월간'} 한도가 ${limit.toLocaleString()} 토큰으로 설정되었습니다.`));
      
    } catch (error) {
      console.error(chalk.red('❌ 한도 설정 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 한도 설정 가져오기
   */
  async getLimits() {
    try {
      const configPath = path.join(this.tokenDataPath, 'limits.json');
      if (fs.existsSync(configPath)) {
        return await fs.readJson(configPath);
      }
    } catch (error) {
      // 에러 무시
    }
    return { daily: 0, monthly: 0 };
  }

  /**
   * 초기화 확인
   */
  async confirmReset() {
    // 간단한 확인 (실제로는 prompts 패키지 사용 권장)
    console.log(chalk.yellow('⚠️  모든 토큰 추적 데이터가 삭제됩니다.'));
    console.log(chalk.gray('계속하려면 5초 내에 Ctrl+C로 취소하세요...'));
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    return true;
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log(chalk.cyan('💰 AIWF 토큰 추적'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log('사용법: aiwf token <명령어> [옵션]');
    console.log('');
    console.log('명령어:');
    console.log('  status                  토큰 사용 현황 표시');
    console.log('  report [기간]           사용 리포트 생성');
    console.log('  track <입력> <출력>     토큰 사용량 수동 기록');
    console.log('  limit <유형> <값>       사용 한도 설정');
    console.log('  reset                   추적 데이터 초기화');
    console.log('');
    console.log('리포트 기간:');
    console.log('  day     일간 리포트');
    console.log('  week    주간 리포트 (기본값)');
    console.log('  month   월간 리포트');
    console.log('');
    console.log('예시:');
    console.log('  aiwf token status');
    console.log('  aiwf token report week');
    console.log('  aiwf token track 1500 500');
    console.log('  aiwf token limit daily 100000');
  }
}

export default TokenCommand;
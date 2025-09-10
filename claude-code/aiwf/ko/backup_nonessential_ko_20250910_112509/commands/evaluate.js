#!/usr/bin/env node

/**
 * 경량화된 평가 명령어
 * 선택적으로 사용할 수 있는 간단한 평가 도구
 */

import { SimplifiedEvaluator } from '../utils/simplified-evaluator.js';
import { getBackgroundMonitor } from '../utils/background-monitor.js';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * evaluate 명령어 실행
 */
export async function executeEvaluate(args = []) {
  const option = args[0];
  
  try {
    switch (option) {
      case '--detailed':
      case '-d':
        return await detailedEvaluation();
        
      case '--history':
      case '-h':
        return await showHistory();
        
      case '--stats':
      case '-s':
        return await showStats();
        
      default:
        return await quickEvaluation();
    }
  } catch (error) {
    console.error(chalk.red('오류:'), error.message);
  }
}

/**
 * 빠른 평가 (기본)
 */
async function quickEvaluation() {
  console.log(chalk.cyan('🔍 최근 응답 평가'));
  console.log(chalk.gray('━'.repeat(50)));
  
  // 현재 페르소나 확인
  const currentPersona = await getCurrentPersona();
  if (!currentPersona) {
    console.log(chalk.yellow('활성화된 페르소나가 없습니다.'));
    console.log('페르소나를 먼저 활성화하세요: aiwf persona [architect|security|frontend|backend|data_analyst]');
    return;
  }
  
  console.log(`현재 페르소나: ${chalk.yellow(currentPersona)}`);
  
  // 최근 통계 표시
  const monitor = getBackgroundMonitor();
  const stats = monitor.getRecentStats(currentPersona);
  
  if (stats.message) {
    console.log(stats.message);
    return;
  }
  
  console.log(`평균 점수: ${chalk.green(stats.averageScore)}`);
  console.log(`평가 횟수: ${stats.totalEvaluations}`);
  console.log(`추세: ${getTrendEmoji(stats.trend)} ${getKoreanTrend(stats.trend)}`);
  
  // 간단한 팁
  if (parseFloat(stats.averageScore) < 0.6) {
    console.log('');
    console.log(chalk.yellow('💡 팁: 페르소나 특성을 더 활용해보세요!'));
  } else if (parseFloat(stats.averageScore) > 0.8) {
    console.log('');
    console.log(chalk.green('🎉 훌륭해요! 페르소나를 잘 활용하고 있습니다.'));
  }
}

/**
 * 상세 평가
 */
async function detailedEvaluation() {
  console.log(chalk.cyan('📊 상세 평가 분석'));
  console.log(chalk.gray('━'.repeat(50)));
  
  const monitor = getBackgroundMonitor();
  const stats = monitor.getRecentStats();
  
  if (stats.message) {
    console.log(stats.message);
    return;
  }
  
  console.log(chalk.white('전체 통계:'));
  console.log(`- 총 평가: ${stats.totalEvaluations}회`);
  console.log(`- 평균 점수: ${stats.averageScore}`);
  console.log(`- 추세: ${getTrendEmoji(stats.trend)} ${getKoreanTrend(stats.trend)}`);
  
  console.log('');
  console.log(chalk.white('페르소나별 성과:'));
  
  Object.entries(stats.personaStats).forEach(([persona, data]) => {
    const score = parseFloat(data.avgScore);
    const scoreColor = score >= 0.8 ? 'green' : score >= 0.6 ? 'yellow' : 'red';
    
    console.log(`- ${getKoreanPersonaName(persona)}: ${chalk[scoreColor](data.avgScore)} (${data.count}회)`);
  });
  
  // 개선 제안
  console.log('');
  console.log(chalk.white('개선 제안:'));
  
  Object.entries(stats.personaStats).forEach(([persona, data]) => {
    if (parseFloat(data.avgScore) < 0.6) {
      const evaluator = new SimplifiedEvaluator();
      const feedback = evaluator.getGentleFeedback(persona, parseFloat(data.avgScore));
      if (feedback) {
        console.log(feedback);
      }
    }
  });
}

/**
 * 평가 히스토리
 */
async function showHistory() {
  console.log(chalk.cyan('📈 평가 히스토리'));
  console.log(chalk.gray('━'.repeat(50)));
  
  const monitor = getBackgroundMonitor();
  const history = monitor.recentEvaluations.slice(-10); // 최근 10개
  
  if (history.length === 0) {
    console.log('평가 기록이 없습니다.');
    return;
  }
  
  history.forEach((eval, index) => {
    const date = new Date(eval.timestamp);
    const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    const scoreColor = eval.score >= 0.8 ? 'green' : eval.score >= 0.6 ? 'yellow' : 'red';
    
    console.log(`${timeStr} | ${getKoreanPersonaName(eval.persona)} | ${chalk[scoreColor](eval.score.toFixed(2))}`);
  });
}

/**
 * 주간 통계
 */
async function showStats() {
  console.log(chalk.cyan('📊 주간 통계'));
  console.log(chalk.gray('━'.repeat(50)));
  
  const monitor = getBackgroundMonitor();
  const summary = monitor.getWeeklySummary();
  
  if (summary.message) {
    console.log(summary.message);
    return;
  }
  
  console.log(`평가 횟수: ${summary.evaluationCount}회`);
  console.log(`평균 점수: ${summary.averageScore}`);
  console.log(`추세: ${getTrendEmoji(summary.trend)} ${getKoreanTrend(summary.trend)}`);
  
  if (summary.personaStats) {
    console.log('');
    console.log('페르소나별 활용도:');
    
    const sorted = Object.entries(summary.personaStats)
      .sort((a, b) => b[1].count - a[1].count);
    
    sorted.forEach(([persona, data]) => {
      const bar = '█'.repeat(Math.floor(data.count / 2));
      console.log(`${getKoreanPersonaName(persona).padEnd(10)} ${bar} ${data.count}회`);
    });
  }
}

/**
 * 현재 페르소나 가져오기
 */
async function getCurrentPersona() {
  try {
    const personaPath = path.join(process.cwd(), '.aiwf', 'current_persona.json');
    const data = await fs.readFile(personaPath, 'utf8');
    const personaData = JSON.parse(data);
    return personaData.persona;
  } catch {
    return null;
  }
}

/**
 * 페르소나 이름 한글화
 */
function getKoreanPersonaName(persona) {
  const names = {
    architect: '아키텍트',
    security: '보안 전문가',
    frontend: '프론트엔드',
    backend: '백엔드',
    data_analyst: '데이터 분석가'
  };
  return names[persona] || persona;
}

/**
 * 추세 이모지
 */
function getTrendEmoji(trend) {
  const emojis = {
    improving: '📈',
    declining: '📉',
    stable: '➡️'
  };
  return emojis[trend] || '❓';
}

/**
 * 추세 한글화
 */
function getKoreanTrend(trend) {
  const trends = {
    improving: '개선 중',
    declining: '하락 중',
    stable: '안정적'
  };
  return trends[trend] || trend;
}

// CLI로 직접 실행하는 경우
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  executeEvaluate(args);
}

export default executeEvaluate;
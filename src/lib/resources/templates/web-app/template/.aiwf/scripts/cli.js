#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

const projectRoot = path.resolve(__dirname, '../..');
const aiwfDir = path.join(projectRoot, '.aiwf');
const featureLedgerPath = path.join(aiwfDir, 'feature-ledger.json');
const configPath = path.join(aiwfDir, 'config.json');

// Feature Ledger 관련 명령어
if (command === 'feature') {
  const ledger = JSON.parse(fs.readFileSync(featureLedgerPath, 'utf8'));

  switch (subcommand) {
    case 'list':
      console.log('\n📋 Feature Ledger\n');
      ledger.features.forEach(feature => {
        const status = {
          completed: '✅',
          in_progress: '🔄',
          planned: '📝'
        }[feature.status];
        console.log(`${status} [${feature.id}] ${feature.name}`);
        console.log(`   ${feature.description}`);
        console.log(`   Tags: ${feature.tags.join(', ')}`);
        console.log();
      });
      console.log(`총 ${ledger.features.length}개 기능`);
      break;

    case 'add':
      console.log('새 기능 추가는 아직 구현되지 않았습니다.');
      break;

    case 'update':
      console.log('기능 업데이트는 아직 구현되지 않았습니다.');
      break;

    default:
      console.log('사용법: npm run aiwf feature [list|add|update]');
  }
}

// Context 관련 명령어
else if (command === 'context') {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  switch (subcommand) {
    case 'status':
      console.log('\n📊 Context 상태\n');
      console.log(`압축 레벨: ${config.features.context_compression.level}`);
      console.log(`캐시 활성화: ${config.features.context_compression.cache_enabled ? '예' : '아니오'}`);
      console.log(`토큰 한도: ${config.features.context_compression.token_limit.toLocaleString()}`);
      break;

    case 'compress':
      console.log('수동 압축은 아직 구현되지 않았습니다.');
      break;

    default:
      console.log('사용법: npm run aiwf context [status|compress]');
  }
}

// 상태 명령어
else if (command === 'status') {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(featureLedgerPath, 'utf8'));

  console.log('\n🚀 AIWF 프로젝트 상태\n');
  console.log(`프로젝트: ${config.project_name}`);
  console.log(`타입: ${config.project_type}`);
  console.log(`버전: ${config.version}`);
  console.log();
  console.log('📊 통계:');
  console.log(`- 총 기능: ${ledger.statistics.total_features}`);
  console.log(`- 완료: ${ledger.statistics.completed}`);
  console.log(`- 진행중: ${ledger.statistics.in_progress}`);
  console.log(`- 계획됨: ${ledger.statistics.planned}`);
  console.log();
  console.log('🤖 AI 페르소나:', config.features.ai_persona.default);
  console.log('📦 Context 압축:', config.features.context_compression.level);
}

// 도움말
else {
  console.log(`
AIWF CLI - AI Workflow Framework

사용법: npm run aiwf [command] [subcommand]

명령어:
  status              프로젝트 상태 보기
  feature list        기능 목록 보기
  feature add         새 기능 추가
  feature update      기능 상태 업데이트
  context status      Context 압축 상태 보기
  context compress    수동 압축 실행

예시:
  npm run aiwf status
  npm run aiwf feature list
  npm run aiwf context status
`);
}
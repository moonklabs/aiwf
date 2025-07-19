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
const packagePath = path.join(projectRoot, 'package.json');

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
        if (feature.exports && feature.exports.length > 0) {
          console.log(`   Exports: ${feature.exports.join(', ')}`);
        }
        console.log(`   Tags: ${feature.tags.join(', ')}`);
        console.log();
      });
      console.log(`총 ${ledger.features.length}개 기능`);
      break;

    case 'stats':
      console.log('\n📊 Feature 통계\n');
      console.log(`총 기능: ${ledger.statistics.total_features}`);
      console.log(`완료: ${ledger.statistics.completed}`);
      console.log(`진행중: ${ledger.statistics.in_progress}`);
      console.log(`계획됨: ${ledger.statistics.planned}`);
      console.log(`총 내보내기: ${ledger.statistics.total_exports || 0}`);
      break;

    default:
      console.log('사용법: npm run aiwf feature [list|stats]');
  }
}

// 버전 관련 명령어
else if (command === 'version') {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  switch (subcommand) {
    case 'current':
      console.log(`현재 버전: ${packageJson.version}`);
      break;

    case 'update':
      console.log('버전 업데이트 후 Feature Ledger를 업데이트합니다.');
      // 실제 구현에서는 새 버전에 대한 feature 기록
      break;

    case 'history':
      console.log('\n📝 버전 히스토리\n');
      console.log('버전 히스토리는 CHANGELOG.md를 참조하세요.');
      break;

    default:
      console.log('사용법: npm run aiwf version [current|update|history]');
  }
}

// 상태 명령어
else if (command === 'status') {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(featureLedgerPath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  console.log('\n🚀 AIWF 라이브러리 상태\n');
  console.log(`프로젝트: ${config.project_name}`);
  console.log(`타입: ${config.project_type}`);
  console.log(`버전: ${packageJson.version}`);
  console.log(`라이선스: ${packageJson.license}`);
  console.log();
  console.log('📊 통계:');
  console.log(`- 총 기능: ${ledger.statistics.total_features}`);
  console.log(`- 총 내보내기: ${ledger.statistics.total_exports || 0}`);
  console.log();
  console.log('🤖 AI 페르소나:', config.features.ai_persona.default);
  console.log('📦 Context 압축:', config.features.context_compression.level);
  console.log('🔢 버전 관리:', config.features.versioning.strategy);
}

// 도움말
else {
  console.log(`
AIWF CLI - AI Workflow Framework (NPM Library)

사용법: npm run aiwf [command] [subcommand]

명령어:
  status              프로젝트 상태 보기
  feature list        기능 목록 보기
  feature stats       기능 통계 보기
  version current     현재 버전 보기
  version update      버전 업데이트 기록
  version history     버전 히스토리 보기

예시:
  npm run aiwf status
  npm run aiwf feature list
  npm run aiwf version current
`);
}
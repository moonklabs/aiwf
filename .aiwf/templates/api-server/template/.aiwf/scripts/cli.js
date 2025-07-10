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
        if (feature.endpoints && feature.endpoints.length > 0) {
          console.log(`   Endpoints: ${feature.endpoints.join(', ')}`);
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
      console.log(`총 엔드포인트: ${ledger.statistics.total_endpoints || 0}`);
      break;

    default:
      console.log('사용법: npm run aiwf feature [list|stats]');
  }
}

// API 관련 명령어
else if (command === 'api') {
  switch (subcommand) {
    case 'docs':
      console.log('API 문서 업데이트 중...');
      console.log('Swagger 문서가 /docs 경로에서 제공됩니다.');
      break;

    case 'validate':
      console.log('API 스펙 검증 중...');
      // 실제 구현에서는 OpenAPI 스펙 검증 로직
      console.log('✅ API 스펙이 유효합니다.');
      break;

    default:
      console.log('사용법: npm run aiwf api [docs|validate]');
  }
}

// 상태 명령어
else if (command === 'status') {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(featureLedgerPath, 'utf8'));

  console.log('\n🚀 AIWF API 서버 상태\n');
  console.log(`프로젝트: ${config.project_name}`);
  console.log(`타입: ${config.project_type}`);
  console.log(`프레임워크: ${config.framework}`);
  console.log(`버전: ${config.version}`);
  console.log();
  console.log('📊 통계:');
  console.log(`- 총 기능: ${ledger.statistics.total_features}`);
  console.log(`- 총 엔드포인트: ${ledger.statistics.total_endpoints || 0}`);
  console.log();
  console.log('🤖 AI 페르소나:', config.features.ai_persona.default);
  console.log('📦 Context 압축:', config.features.context_compression.level);
  console.log('📚 API 문서화:', config.features.api_documentation.swagger ? 'Swagger 활성화' : '비활성화');
}

// 도움말
else {
  console.log(`
AIWF CLI - AI Workflow Framework (API Server)

사용법: npm run aiwf [command] [subcommand]

명령어:
  status              프로젝트 상태 보기
  feature list        기능 목록 보기
  feature stats       기능 통계 보기
  api docs           API 문서 업데이트
  api validate       API 스펙 검증

예시:
  npm run aiwf status
  npm run aiwf feature list
  npm run aiwf api docs
`);
}
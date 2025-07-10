#!/usr/bin/env node

/**
 * Feature Ledger 관리 명령어 (한국어)
 * Feature 생성, 업데이트, 조회, 연결 기능 제공
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';

// 상수 정의
const FEATURE_STATES = {
  active: '개발 중',
  completed: '완료',
  paused: '일시 중지',
  archived: '보관됨'
};

const PRIORITIES = {
  critical: '긴급',
  high: '높음',
  medium: '보통',
  low: '낮음'
};

const CATEGORIES = {
  feature: '기능',
  enhancement: '개선',
  bugfix: '버그 수정',
  refactor: '리팩토링'
};

// 헬퍼 함수들
function getProjectRoot() {
  const cwd = process.cwd();
  return cwd.endsWith('.aiwf') ? path.dirname(cwd) : cwd;
}

function getFeatureLedgerPath() {
  return path.join(getProjectRoot(), '.aiwf', '06_FEATURE_LEDGERS');
}

function getNextFeatureId() {
  const ledgerPath = getFeatureLedgerPath();
  const activePath = path.join(ledgerPath, 'active');
  
  if (!fs.existsSync(activePath)) {
    fs.mkdirSync(activePath, { recursive: true });
  }
  
  const files = fs.readdirSync(activePath).filter(f => f.match(/^FL\d{3}/));
  if (files.length === 0) return 'FL001';
  
  const ids = files.map(f => parseInt(f.match(/FL(\d{3})/)[1]));
  const nextId = Math.max(...ids) + 1;
  return `FL${String(nextId).padStart(3, '0')}`;
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// Feature 생성
async function createFeature(name) {
  try {
    // 대화형 모드
    if (!name) {
      const response = await prompts([
        {
          type: 'text',
          name: 'title',
          message: 'Feature 제목을 입력하세요:',
          validate: value => value.length > 0 || '제목은 필수입니다'
        },
        {
          type: 'text',
          name: 'description',
          message: 'Feature 설명을 입력하세요:'
        },
        {
          type: 'select',
          name: 'priority',
          message: '우선순위를 선택하세요:',
          choices: Object.entries(PRIORITIES).map(([value, title]) => ({ 
            title: title, 
            value: value 
          }))
        },
        {
          type: 'select',
          name: 'category',
          message: '카테고리를 선택하세요:',
          choices: Object.entries(CATEGORIES).map(([value, title]) => ({ 
            title: title, 
            value: value 
          }))
        }
      ]);
      
      if (!response.title) return;
      
      name = response.title;
      var { description, priority, category } = response;
    } else {
      // 기본값 설정
      var description = '';
      var priority = 'medium';
      var category = 'feature';
    }
    
    const featureId = getNextFeatureId();
    const filename = `${featureId}_${sanitizeFilename(name)}.md`;
    const filepath = path.join(getFeatureLedgerPath(), 'active', filename);
    
    // Feature 파일 내용
    const content = `# ${featureId}: ${name}

## 메타데이터

- **Feature ID**: ${featureId}
- **제목**: ${name}
- **상태**: active
- **우선순위**: ${priority}
- **카테고리**: ${category}
- **생성일**: ${new Date().toISOString()}
- **업데이트**: ${new Date().toISOString()}

## 설명

${description || '(설명을 추가해주세요)'}

## 진행 상황

- **진행률**: 0%
- **시작일**: ${new Date().toISOString().split('T')[0]}
- **예상 완료일**: TBD

## 마일스톤 & 스프린트

- **마일스톤**: (미지정)
- **스프린트**: (미지정)

## 태스크

- [ ] 초기 설계
- [ ] 구현
- [ ] 테스트
- [ ] 문서화

## 기술 스택

(사용할 기술 스택을 명시해주세요)

## 진행 내역

- [${new Date().toISOString().split('T')[0]}] Feature 생성

## 관련 링크

- Git 브랜치: \`feature/${featureId}-${sanitizeFilename(name)}\`
- PR: (미생성)
- 이슈: (미생성)
`;
    
    // 파일 생성
    fs.writeFileSync(filepath, content);
    
    // 인덱스 업데이트
    await updateFeatureIndex();
    
    console.log(chalk.green('🎯 Feature Ledger 생성 완료!'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`Feature ID: ${chalk.yellow(featureId)}`);
    console.log(`제목: ${name}`);
    console.log(`상태: ${chalk.green('active')}`);
    console.log(`우선순위: ${priority}`);
    console.log(`카테고리: ${category}`);
    console.log('');
    console.log(`📁 파일 위치: ${chalk.blue(path.relative(getProjectRoot(), filepath))}`);
    console.log('');
    console.log(chalk.yellow('💡 다음 단계:'));
    console.log(`git checkout -b feature/${featureId}-${sanitizeFilename(name)}`);
    
  } catch (error) {
    console.error(chalk.red(`❌ 오류: ${error.message}`));
  }
}

// Feature 상태 업데이트
async function updateFeatureStatus(featureId, newStatus) {
  try {
    // 대화형 모드
    if (!featureId) {
      const features = await getActiveFeatures();
      if (features.length === 0) {
        console.log(chalk.yellow('활성 Feature가 없습니다.'));
        return;
      }
      
      const response = await prompts([
        {
          type: 'select',
          name: 'featureId',
          message: 'Feature를 선택하세요:',
          choices: features.map(f => ({ 
            title: `${f.id} - ${f.title}`, 
            value: f.id 
          }))
        },
        {
          type: 'select',
          name: 'newStatus',
          message: '새로운 상태를 선택하세요:',
          choices: Object.entries(FEATURE_STATES).map(([value, title]) => ({ 
            title: title, 
            value: value 
          }))
        }
      ]);
      
      if (!response.featureId) return;
      
      featureId = response.featureId;
      newStatus = response.newStatus;
    }
    
    // Feature 파일 찾기
    const feature = await findFeature(featureId);
    if (!feature) {
      console.log(chalk.red(`❌ Feature ${featureId}를 찾을 수 없습니다.`));
      return;
    }
    
    // 상태 전이 검증
    const validTransitions = {
      active: ['completed', 'paused', 'archived'],
      paused: ['active', 'archived'],
      completed: ['archived'],
      archived: []
    };
    
    if (!validTransitions[feature.status].includes(newStatus)) {
      console.log(chalk.red(`❌ ${feature.status} → ${newStatus} 전이는 허용되지 않습니다.`));
      return;
    }
    
    // 파일 이동 (필요한 경우)
    const oldPath = feature.path;
    let newPath = oldPath;
    
    if (newStatus === 'archived') {
      const archivePath = path.join(getFeatureLedgerPath(), 'archived');
      if (!fs.existsSync(archivePath)) {
        fs.mkdirSync(archivePath, { recursive: true });
      }
      newPath = path.join(archivePath, path.basename(oldPath));
      fs.renameSync(oldPath, newPath);
    }
    
    // 파일 내용 업데이트
    let content = fs.readFileSync(newPath, 'utf8');
    content = content.replace(/- \*\*상태\*\*: \w+/, `- **상태**: ${newStatus}`);
    content = content.replace(/- \*\*업데이트\*\*: .+/, `- **업데이트**: ${new Date().toISOString()}`);
    
    // 진행 내역 추가
    const historyMarker = '## 진행 내역';
    const historyIndex = content.indexOf(historyMarker);
    if (historyIndex !== -1) {
      const nextSection = content.indexOf('\n##', historyIndex + 1);
      const insertPoint = nextSection !== -1 ? nextSection : content.length;
      const historyEntry = `\n- [${new Date().toISOString().split('T')[0]}] 상태 변경: ${feature.status} → ${newStatus}`;
      content = content.slice(0, insertPoint) + historyEntry + content.slice(insertPoint);
    }
    
    fs.writeFileSync(newPath, content);
    
    // 인덱스 업데이트
    await updateFeatureIndex();
    
    console.log(chalk.green('✅ Feature 상태 업데이트 완료'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`Feature ID: ${featureId}`);
    console.log(`이전 상태: ${feature.status} → 새 상태: ${chalk.yellow(newStatus)}`);
    console.log(`업데이트 시간: ${new Date().toLocaleString('ko-KR')}`);
    
  } catch (error) {
    console.error(chalk.red(`❌ 오류: ${error.message}`));
  }
}

// Feature 목록 조회
async function listFeatures(options = {}) {
  try {
    const features = await getAllFeatures();
    
    // 필터링
    let filtered = features;
    
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(f => f.status === options.status);
    }
    
    if (options.priority) {
      filtered = filtered.filter(f => f.priority === options.priority);
    }
    
    if (options.category) {
      filtered = filtered.filter(f => f.category === options.category);
    }
    
    // 정렬
    const sortBy = options.sort || 'id';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id.localeCompare(b.id);
        case 'updated':
          return new Date(b.updated) - new Date(a.updated);
        case 'priority':
          const priorityOrder = ['critical', 'high', 'medium', 'low'];
          return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
        default:
          return 0;
      }
    });
    
    // 출력
    const format = options.format || 'table';
    
    if (format === 'table') {
      console.log(chalk.cyan('📋 Feature Ledger 목록'));
      console.log(chalk.gray('━'.repeat(60)));
      console.log('ID    | Title                  | Status    | Priority | Progress');
      console.log('------+------------------------+-----------+----------+---------');
      
      filtered.forEach(f => {
        const statusColor = f.status === 'active' ? 'green' : 
                          f.status === 'completed' ? 'blue' : 'gray';
        console.log(
          `${f.id.padEnd(5)} | ${f.title.padEnd(22).slice(0, 22)} | ${
            chalk[statusColor](f.status.padEnd(9))
          } | ${f.priority.padEnd(8)} | ${f.progress || '0%'}`
        );
      });
      
      console.log(chalk.gray('━'.repeat(60)));
      
      // 통계
      const stats = {
        total: filtered.length,
        active: filtered.filter(f => f.status === 'active').length,
        completed: filtered.filter(f => f.status === 'completed').length,
        paused: filtered.filter(f => f.status === 'paused').length
      };
      
      console.log(`\n총 ${stats.total}개 Feature | Active: ${stats.active} | Completed: ${stats.completed} | Paused: ${stats.paused}`);
      
    } else if (format === 'list') {
      filtered.forEach(f => {
        console.log(`\n${chalk.yellow(f.id)}: ${f.title}`);
        console.log(`  상태: ${f.status} | 우선순위: ${f.priority} | 진행률: ${f.progress || '0%'}`);
      });
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ 오류: ${error.message}`));
  }
}

// Feature 상세 정보
async function getFeatureDetails(featureId, options = {}) {
  try {
    if (!featureId) {
      const features = await getAllFeatures();
      if (features.length === 0) {
        console.log(chalk.yellow('Feature가 없습니다.'));
        return;
      }
      
      const response = await prompts({
        type: 'select',
        name: 'featureId',
        message: 'Feature를 선택하세요:',
        choices: features.map(f => ({ 
          title: `${f.id} - ${f.title}`, 
          value: f.id 
        }))
      });
      
      if (!response.featureId) return;
      featureId = response.featureId;
    }
    
    const feature = await findFeature(featureId);
    if (!feature) {
      console.log(chalk.red(`❌ Feature ${featureId}를 찾을 수 없습니다.`));
      return;
    }
    
    // 파일 내용 읽기
    const content = fs.readFileSync(feature.path, 'utf8');
    
    console.log(chalk.cyan('🎯 Feature 상세 정보'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(content);
    
  } catch (error) {
    console.error(chalk.red(`❌ 오류: ${error.message}`));
  }
}

// 헬퍼: Feature 찾기
async function findFeature(featureId) {
  const features = await getAllFeatures();
  return features.find(f => f.id === featureId);
}

// 헬퍼: 모든 Feature 가져오기
async function getAllFeatures() {
  const features = [];
  const ledgerPath = getFeatureLedgerPath();
  
  // active 디렉토리
  const activePath = path.join(ledgerPath, 'active');
  if (fs.existsSync(activePath)) {
    const files = fs.readdirSync(activePath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(activePath, file), 'utf8');
      const feature = parseFeatureFile(content, path.join(activePath, file));
      if (feature) features.push(feature);
    });
  }
  
  // archived 디렉토리
  const archivedPath = path.join(ledgerPath, 'archived');
  if (fs.existsSync(archivedPath)) {
    const files = fs.readdirSync(archivedPath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(archivedPath, file), 'utf8');
      const feature = parseFeatureFile(content, path.join(archivedPath, file));
      if (feature) features.push(feature);
    });
  }
  
  return features;
}

// 헬퍼: active Feature 가져오기
async function getActiveFeatures() {
  const features = await getAllFeatures();
  return features.filter(f => f.status === 'active');
}

// 헬퍼: Feature 파일 파싱
function parseFeatureFile(content, filepath) {
  const idMatch = content.match(/- \*\*Feature ID\*\*: (FL\d{3})/);
  const titleMatch = content.match(/# FL\d{3}: (.+)/);
  const statusMatch = content.match(/- \*\*상태\*\*: (\w+)/);
  const priorityMatch = content.match(/- \*\*우선순위\*\*: (\w+)/);
  const categoryMatch = content.match(/- \*\*카테고리\*\*: (\w+)/);
  const progressMatch = content.match(/- \*\*진행률\*\*: (\d+%)/);
  const updatedMatch = content.match(/- \*\*업데이트\*\*: (.+)/);
  
  if (!idMatch || !titleMatch) return null;
  
  return {
    id: idMatch[1],
    title: titleMatch[1],
    status: statusMatch ? statusMatch[1] : 'active',
    priority: priorityMatch ? priorityMatch[1] : 'medium',
    category: categoryMatch ? categoryMatch[1] : 'feature',
    progress: progressMatch ? progressMatch[1] : '0%',
    updated: updatedMatch ? updatedMatch[1] : '',
    path: filepath
  };
}

// 헬퍼: Feature 인덱스 업데이트
async function updateFeatureIndex() {
  const indexPath = path.join(getFeatureLedgerPath(), 'FEATURE_LEDGER_INDEX.md');
  const features = await getAllFeatures();
  
  let content = `# Feature Ledger 인덱스

마지막 업데이트: ${new Date().toISOString()}

## 활성 Features

| ID | 제목 | 상태 | 우선순위 | 진행률 | 업데이트 |
|----|------|------|----------|--------|----------|
`;
  
  const activeFeatures = features.filter(f => f.status !== 'archived');
  activeFeatures.forEach(f => {
    content += `| ${f.id} | ${f.title} | ${f.status} | ${f.priority} | ${f.progress} | ${f.updated.split('T')[0]} |\n`;
  });
  
  content += `\n## 보관된 Features\n\n`;
  content += `| ID | 제목 | 완료일 |\n`;
  content += `|----|------|--------|\n`;
  
  const archivedFeatures = features.filter(f => f.status === 'archived');
  archivedFeatures.forEach(f => {
    content += `| ${f.id} | ${f.title} | ${f.updated.split('T')[0]} |\n`;
  });
  
  content += `\n## 통계\n\n`;
  content += `- 총 Features: ${features.length}\n`;
  content += `- 활성: ${features.filter(f => f.status === 'active').length}\n`;
  content += `- 완료: ${features.filter(f => f.status === 'completed').length}\n`;
  content += `- 일시 중지: ${features.filter(f => f.status === 'paused').length}\n`;
  content += `- 보관됨: ${features.filter(f => f.status === 'archived').length}\n`;
  
  fs.writeFileSync(indexPath, content);
}

// 명령행 인자 처리
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'create':
    createFeature(args[0]);
    break;
    
  case 'update-status':
    updateFeatureStatus(args[0], args[1]);
    break;
    
  case 'list':
    const listOptions = {};
    args.forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        listOptions[key] = value || true;
      }
    });
    listFeatures(listOptions);
    break;
    
  case 'details':
    const detailsOptions = {};
    args.slice(1).forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        detailsOptions[key] = value || true;
      }
    });
    getFeatureDetails(args[0], detailsOptions);
    break;
    
  case 'link-milestone':
    console.log(chalk.yellow('마일스톤 연결 기능은 개발 중입니다.'));
    break;
    
  default:
    console.log(chalk.yellow('사용법:'));
    console.log('  feature-ledger.js create [name]');
    console.log('  feature-ledger.js update-status [id] [status]');
    console.log('  feature-ledger.js list [options]');
    console.log('  feature-ledger.js details [id]');
    console.log('  feature-ledger.js link-milestone [id] [milestone]');
}
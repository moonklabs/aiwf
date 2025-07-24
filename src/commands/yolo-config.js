#!/usr/bin/env node

/**
 * YOLO 설정 파일 자동 생성 및 관리
 * AIWF YOLO 모드의 설정을 초기화하고 관리하는 유틸리티
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 프로젝트 루트 찾기
 */
async function findProjectRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  
  while (currentDir !== path.parse(currentDir).root) {
    try {
      await fs.access(path.join(currentDir, '.aiwf'));
      return currentDir;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }
  
  throw new Error('.aiwf 디렉토리를 찾을 수 없습니다. AIWF 프로젝트 내에서 실행해주세요.');
}

/**
 * YOLO 설정 파일 생성
 */
export async function createYoloConfig(options = {}) {
  try {
    const projectRoot = await findProjectRoot();
    const configPath = path.join(projectRoot, '.aiwf', 'yolo-config.yaml');
    const templatePath = path.join(__dirname, '..', 'config', 'yolo-config-template.yaml');
    
    // .aiwf 디렉토리 확인
    const aiwfDir = path.join(projectRoot, '.aiwf');
    await fs.mkdir(aiwfDir, { recursive: true });
    
    // 기존 설정 파일이 있는지 확인
    let shouldOverwrite = false;
    try {
      await fs.access(configPath);
      if (!options.force) {
        const response = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: 'YOLO 설정 파일이 이미 존재합니다. 덮어쓰시겠습니까?',
          initial: false
        });
        shouldOverwrite = response.overwrite;
      } else {
        shouldOverwrite = true;
      }
    } catch {
      shouldOverwrite = true;
    }
    
    if (!shouldOverwrite) {
      console.log(chalk.yellow('⏭️ YOLO 설정 파일 생성을 건너뜁니다.'));
      return { success: false, skipped: true };
    }
    
    // 템플릿 파일 복사
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // 옵션에 따라 설정 커스터마이징
    let customizedContent = templateContent;
    
    if (options.engineeringLevel) {
      customizedContent = customizedContent.replace(
        /engineering_level: minimal/,
        `engineering_level: ${options.engineeringLevel}`
      );
    }
    
    if (options.focusMode) {
      // 포커스 모드에 따른 규칙 조정
      if (options.focusMode === 'strict') {
        customizedContent = customizedContent.replace(
          /no_gold_plating: true/,
          'no_gold_plating: true\n  \n  # 엄격 모드 추가 규칙\n  strict_requirements: true\n  no_extras: true'
        );
      }
    }
    
    await fs.writeFile(configPath, customizedContent);
    
    console.log(chalk.green('✅ YOLO 설정 파일이 생성되었습니다!'));
    console.log(`📁 위치: ${chalk.cyan(configPath)}`);
    
    return { success: true, configPath };
    
  } catch (error) {
    throw new Error(`YOLO 설정 파일 생성 실패: ${error.message}`);
  }
}

/**
 * 대화형 YOLO 설정 생성
 */
export async function createInteractiveYoloConfig() {
  try {
    console.log(chalk.bold('🛠️ YOLO 설정 마법사'));
    console.log('');
    console.log(chalk.gray('YOLO 모드의 동작을 커스터마이징할 수 있습니다.'));
    console.log('');
    
    const responses = await prompts([
      {
        type: 'select',
        name: 'engineeringLevel',
        message: '엔지니어링 레벨을 선택하세요:',
        choices: [
          { title: '최소 (Minimal) - 빠른 프로토타입, 최소 구현', value: 'minimal' },
          { title: '균형 (Balanced) - 품질과 속도의 균형', value: 'balanced' },
          { title: '완전 (Complete) - 완전한 구현, 높은 품질', value: 'complete' }
        ],
        initial: 0
      },
      {
        type: 'multiselect',
        name: 'focusRules',
        message: '포커스 규칙을 선택하세요 (스페이스바로 선택):',
        choices: [
          { title: '요구사항 우선 (requirement_first)', value: 'requirement_first', selected: true },
          { title: '간단한 해결책 (simple_solution)', value: 'simple_solution', selected: true },
          { title: '골드 플레이팅 방지 (no_gold_plating)', value: 'no_gold_plating', selected: true },
          { title: '트랙 유지 (stay_on_track)', value: 'stay_on_track', selected: true },
          { title: '리팩토링 제한 (limit_refactoring)', value: 'limit_refactoring', selected: false }
        ],
        min: 1
      },
      {
        type: 'select',
        name: 'executionMode',
        message: '실행 모드를 선택하세요:',
        choices: [
          { title: '빠른 모드 - 최소 검증, 빠른 실행', value: 'fast' },
          { title: '스마트 모드 - 컨텍스트 기반 의사결정', value: 'smart' },
          { title: '안전 모드 - 철저한 검증', value: 'safe' }
        ],
        initial: 0
      },
      {
        type: 'confirm',
        name: 'enableCheckpoints',
        message: '체크포인트 시스템을 활성화하시겠습니까?',
        initial: true
      },
      {
        type: prev => prev ? 'number' : null,
        name: 'checkpointInterval',
        message: '체크포인트 간격 (태스크 수):',
        initial: 5,
        min: 1,
        max: 20
      },
      {
        type: 'confirm',
        name: 'autoCommit',
        message: '태스크 완료 시 자동 커밋을 사용하시겠습니까?',
        initial: false
      },
      {
        type: 'number',
        name: 'maxFileLines',
        message: '최대 파일 크기 (줄 수):',
        initial: 300,
        min: 100,
        max: 1000
      },
      {
        type: 'number',
        name: 'maxFunctionLines',
        message: '최대 함수 크기 (줄 수):',
        initial: 50,
        min: 20,
        max: 200
      }
    ]);
    
    // 응답이 중단된 경우 처리
    if (!responses.engineeringLevel) {
      console.log(chalk.yellow('⏭️ 설정 생성이 취소되었습니다.'));
      return { success: false, cancelled: true };
    }
    
    console.log('');
    console.log(chalk.blue('🔧 YOLO 설정 파일 생성 중...'));
    
    // 커스텀 설정 파일 생성
    const customConfig = await generateCustomConfig(responses);
    const projectRoot = await findProjectRoot();
    const configPath = path.join(projectRoot, '.aiwf', 'yolo-config.yaml');
    
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, customConfig);
    
    console.log(chalk.green('✅ 커스텀 YOLO 설정이 생성되었습니다!'));
    console.log(`📁 위치: ${chalk.cyan(configPath)}`);
    console.log('');
    
    // 설정 요약 표시
    console.log(chalk.bold('📋 설정 요약:'));
    console.log(`  엔지니어링 레벨: ${chalk.yellow(responses.engineeringLevel)}`);
    console.log(`  실행 모드: ${chalk.yellow(responses.executionMode)}`);
    console.log(`  체크포인트: ${chalk.yellow(responses.enableCheckpoints ? '활성화' : '비활성화')}`);
    console.log(`  자동 커밋: ${chalk.yellow(responses.autoCommit ? '활성화' : '비활성화')}`);
    console.log(`  최대 파일 크기: ${chalk.blue(responses.maxFileLines)}줄`);
    console.log('');
    
    console.log(chalk.green('🚀 이제 YOLO 모드를 실행할 준비가 되었습니다!'));
    console.log(chalk.blue('Claude Code에서 /project:aiwf:yolo 를 실행하세요.'));
    
    return { success: true, configPath, config: responses };
    
  } catch (error) {
    if (error.message.includes('cancelled')) {
      console.log(chalk.yellow('⏭️ 설정 생성이 취소되었습니다.'));
      return { success: false, cancelled: true };
    }
    throw error;
  }
}

/**
 * 커스텀 설정 파일 생성
 */
async function generateCustomConfig(responses) {
  const config = `# YOLO Mode Configuration - AIWF 자율 실행 모드 설정
# 마법사로 생성된 커스텀 설정

# 엔지니어링 레벨 설정
engineering_level: ${responses.engineeringLevel}

# 포커스 규칙 - 곁길로 빠지지 않도록 제어
focus_rules:
${responses.focusRules.map(rule => {
  switch(rule) {
    case 'requirement_first': return '  # 요구사항 우선 - 명시된 요구사항만 구현\n  requirement_first: true';
    case 'simple_solution': return '  # 간단한 해결책 선호\n  simple_solution: true';
    case 'no_gold_plating': return '  # 골드 플레이팅 방지 - 필요 이상의 기능 추가 금지\n  no_gold_plating: true';
    case 'stay_on_track': return '  # 트랙 유지 - 원래 목표에서 벗어나지 않음\n  stay_on_track: true';
    case 'limit_refactoring': return '  # 리팩토링 제한 - 필수적인 경우만 허용\n  limit_refactoring: true';
    default: return '';
  }
}).join('\n  \n')}

# 실행 모드 설정
execution:
  # 스마트 모드 - 컨텍스트 기반 의사결정
  smart_mode: ${responses.executionMode === 'smart'}
  
  # 빠른 실행 - 최소한의 검증만 수행
  fast_mode: ${responses.executionMode === 'fast'}
  
  # 안전 모드 - 철저한 검증
  safe_mode: ${responses.executionMode === 'safe'}
  
  # 테스트 실행 - 각 태스크 완료 후 테스트
  run_tests: true
  
  # 커밋 자동화 - 태스크 완료 시 자동 커밋
  auto_commit: ${responses.autoCommit}
  
  # 브랜치 전략
  branch_strategy: feature  # feature, direct, worktree

# 중단 조건 - 이러한 상황에서 YOLO 모드 중단
breakpoints:
  # 중요 파일 수정 시
  critical_files:
    - .env
    - database/migrations/*
    - config/production.js
  
  # 테스트 실패 임계값 (%)
  test_failure_threshold: 10
  
  # 데이터베이스 스키마 변경 시
  schema_changes: true
  
  # 보안 관련 변경 시
  security_changes: true
  
  # 외부 API 통합 시
  external_api: false

# 진행률 리포트 설정
reporting:
  # 상세 레벨
  verbosity: normal  # quiet, normal, verbose
  
  # 진행률 업데이트 빈도 (태스크 단위)
  update_frequency: 1
  
  # 요약 리포트 생성
  generate_summary: true
  
  # 메트릭 추적
  track_metrics: true

# 오버엔지니어링 방지 규칙
overengineering_prevention:
  # 최대 파일 크기 (줄)
  max_file_lines: ${responses.maxFileLines}
  
  # 최대 함수 크기 (줄)
  max_function_lines: ${responses.maxFunctionLines}
  
  # 최대 중첩 깊이
  max_nesting_depth: 4
  
  # 추상화 레벨 제한
  max_abstraction_layers: 3
  
  # 디자인 패턴 사용 제한
  limit_design_patterns: true
  
  # 미래를 위한 코드 금지
  no_future_proofing: true

# 체크포인트 설정
checkpoint:
  # 체크포인트 활성화
  enabled: ${responses.enableCheckpoints}
  
  # 체크포인트 간격 (태스크 수)
  interval: ${responses.checkpointInterval || 5}
  
  # 복구 모드
  recovery_mode: auto  # auto, manual, disabled
  
  # 상태 저장 위치
  state_file: .aiwf/yolo-state.json

# 태스크 우선순위 설정
priority:
  # 우선순위 가중치
  weights:
    urgency: 0.4
    importance: 0.3
    dependencies: 0.2
    effort: 0.1
  
  # 의존성 우선 실행
  dependency_first: true
  
  # 블로커 태스크 즉시 처리
  handle_blockers: true

# AI 페르소나 설정
persona:
  # 기본 페르소나
  default: developer
  
  # 태스크별 페르소나 자동 선택
  auto_select: true
  
  # 페르소나 전환 규칙
  rules:
    - pattern: "API|백엔드|서버"
      persona: backend
    - pattern: "UI|프론트|컴포넌트"
      persona: frontend
    - pattern: "테스트|검증|QA"
      persona: tester

# 성능 최적화
performance:
  # 병렬 실행 (실험적)
  parallel_tasks: false
  
  # 캐시 활용
  use_cache: true
  
  # 불필요한 파일 읽기 스킵
  skip_unchanged: true
  
  # 압축 모드 사용
  compression_mode: auto

# 안전 장치
safety:
  # 드라이런 모드 - 실제 변경 없이 시뮬레이션
  dry_run: false
  
  # 백업 생성
  create_backup: true
  
  # 최대 실행 시간 (분)
  max_runtime: 120
  
  # 확인 프롬프트 표시
  confirmation_prompts: false`;

  return config;
}

/**
 * 현재 YOLO 설정 확인
 */
export async function showYoloConfig() {
  try {
    const projectRoot = await findProjectRoot();
    const configPath = path.join(projectRoot, '.aiwf', 'yolo-config.yaml');
    
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      
      console.log(chalk.bold('🛠️ 현재 YOLO 설정:'));
      console.log(`📁 위치: ${chalk.cyan(configPath)}`);
      console.log('');
      
      // 주요 설정 추출
      const engineeringLevel = configContent.match(/engineering_level:\s*(\w+)/)?.[1] || 'unknown';
      const enabledRules = [];
      
      if (configContent.includes('requirement_first: true')) enabledRules.push('요구사항 우선');
      if (configContent.includes('simple_solution: true')) enabledRules.push('간단한 해결책');
      if (configContent.includes('no_gold_plating: true')) enabledRules.push('골드 플레이팅 방지');
      if (configContent.includes('stay_on_track: true')) enabledRules.push('트랙 유지');
      
      const checkpointEnabled = configContent.includes('enabled: true');
      const autoCommit = configContent.includes('auto_commit: true');
      
      console.log(chalk.bold('📋 주요 설정:'));
      console.log(`  엔지니어링 레벨: ${chalk.yellow(engineeringLevel)}`);
      console.log(`  포커스 규칙: ${chalk.blue(enabledRules.join(', '))}`);
      console.log(`  체크포인트: ${chalk.yellow(checkpointEnabled ? '활성화' : '비활성화')}`);
      console.log(`  자동 커밋: ${chalk.yellow(autoCommit ? '활성화' : '비활성화')}`);
      console.log('');
      
      console.log(chalk.gray('전체 설정을 보려면 파일을 직접 확인하세요:'));
      console.log(chalk.blue(`cat ${configPath}`));
      
    } catch (error) {
      console.log(chalk.yellow('⚠️ YOLO 설정 파일이 없습니다.'));
      console.log('');
      console.log(chalk.gray('설정 파일을 생성하려면:'));
      console.log(chalk.blue('aiwf yolo-config init'));
    }
    
  } catch (error) {
    throw new Error(`YOLO 설정 확인 실패: ${error.message}`);
  }
}

/**
 * CLI에서 실행될 때
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      createYoloConfig({ force: process.argv.includes('--force') })
        .catch(error => {
          console.error(chalk.red(`오류: ${error.message}`));
          process.exit(1);
        });
      break;
      
    case 'wizard':
    case 'interactive':
      createInteractiveYoloConfig()
        .catch(error => {
          console.error(chalk.red(`오류: ${error.message}`));
          process.exit(1);
        });
      break;
      
    case 'show':
    case 'status':
      showYoloConfig()
        .catch(error => {
          console.error(chalk.red(`오류: ${error.message}`));
          process.exit(1);
        });
      break;
      
    default:
      console.log(chalk.bold('🛠️ YOLO 설정 관리'));
      console.log('');
      console.log(chalk.yellow('사용법:'));
      console.log(`  ${chalk.blue('node yolo-config.js init')} - 기본 설정 파일 생성`);
      console.log(`  ${chalk.blue('node yolo-config.js wizard')} - 대화형 설정 생성`);
      console.log(`  ${chalk.blue('node yolo-config.js show')} - 현재 설정 확인`);
      break;
  }
}

export default { createYoloConfig, createInteractiveYoloConfig, showYoloConfig };
#!/usr/bin/env node

import { createProject } from '../scripts/create-project.js';
import { createProjectOffline, isOnline } from '../scripts/create-offline.js';
import chalk from 'chalk';

export async function main(args = process.argv.slice(2)) {
  
  // 오프라인 모드 체크
  if (args.includes('--offline')) {
    console.log(chalk.yellow('⚠️  오프라인 모드로 실행합니다.'));
    // 오프라인 생성 로직
    const template = args[0];
    const projectName = args[1];
    
    if (!template || !projectName) {
      console.log(chalk.red('사용법: aiwf create --offline <template> <project-name>'));
      process.exit(1);
    }
    
    try {
      await createProjectOffline(template, projectName, projectName);
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
      process.exit(1);
    }
    
    return;
  }

  // 네트워크 연결 확인
  const online = await isOnline();
  
  if (!online) {
    console.log(chalk.yellow('\n⚠️  인터넷 연결을 확인할 수 없습니다.'));
    console.log(chalk.yellow('오프라인 모드로 전환합니다.\n'));
    console.log(chalk.gray('온라인 모드를 강제하려면 --online 플래그를 사용하세요.'));
    
    // 오프라인 모드로 자동 전환
    if (!args.includes('--online')) {
      // 오프라인 프로젝트 생성 로직
      return;
    }
  }

  // 온라인 모드 (대화형)
  createProject();
}

// CLI로 직접 실행된 경우에만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('오류:', error.message));
    process.exit(1);
  });
}
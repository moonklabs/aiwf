#!/usr/bin/env node

/**
 * AIWF 스프린트 CLI
 * 독립 스프린트 생성 및 관리를 위한 명령어 인터페이스
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createIndependentSprint } from '../commands/sprint-independent.js';

const program = new Command();

program
  .name('aiwf-sprint')
  .description('AIWF 독립 스프린트 관리 도구')
  .version('0.3.12');

// 독립 스프린트 생성 명령어
program
  .command('independent [name]')
  .alias('ind')
  .description('독립 스프린트 생성')
  .option('--from-readme', 'README에서 TODO 추출하여 스프린트 생성')
  .option('--from-issue <number>', 'GitHub 이슈에서 스프린트 생성')
  .option('--minimal', '최소 엔지니어링 레벨 설정 (기본값)')
  .option('--balanced', '균형 엔지니어링 레벨 설정')
  .option('--complete', '완전 엔지니어링 레벨 설정')
  .option('--description <desc>', '스프린트 설명')
  .action(async (name, options) => {
    try {
      console.log(chalk.blue('🚀 독립 스프린트 생성 중...'));
      console.log('');
      
      // 엔지니어링 레벨 결정
      let engineeringLevel = 'minimal';
      if (options.balanced) engineeringLevel = 'balanced';
      else if (options.complete) engineeringLevel = 'complete';
      
      // 옵션 구성
      const sprintOptions = {
        name,
        description: options.description,
        engineeringLevel,
        fromReadme: options.fromReadme,
        fromIssue: options.fromIssue,
        minimal: engineeringLevel === 'minimal'
      };
      
      // 독립 스프린트 생성
      const result = await createIndependentSprint(sprintOptions);
      
      if (result.success) {
        console.log('');
        console.log(chalk.green('✅ 독립 스프린트 생성 완료!'));
        console.log('');
        console.log(chalk.bold('📋 생성된 스프린트 정보:'));
        console.log(`  스프린트 ID: ${chalk.cyan(result.sprintId)}`);
        console.log(`  태스크 수: ${chalk.blue(result.tasks)}개`);
        console.log('');
        console.log(chalk.bold('🚀 다음 단계:'));
        console.log(`  1. Claude Code에서 ${chalk.cyan(`/project:aiwf:yolo ${result.sprintId}`)} 실행`);
        console.log(`  2. 또는 ${chalk.cyan(`/project:aiwf:yolo --from-independent`)} 실행`);
        console.log('');
        console.log(chalk.gray('💡 팁: YOLO 모드로 전체 스프린트를 자동 완성할 수 있습니다!'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 독립 스프린트 생성 실패:'), error.message);
      process.exit(1);
    }
  });

// 스프린트 목록 보기
program
  .command('list')
  .alias('ls')
  .description('현재 프로젝트의 모든 스프린트 목록')
  .option('--status <status>', '상태별 필터링 (active, completed, pending)')
  .action(async (options) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // 프로젝트 루트 찾기
      let currentDir = process.cwd();
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const sprintsDir = path.join(currentDir, '.aiwf', '03_SPRINTS');
      
      try {
        const entries = await fs.readdir(sprintsDir);
        const sprintDirs = entries.filter(entry => entry.match(/^S\d+_/));
        
        if (sprintDirs.length === 0) {
          console.log(chalk.yellow('📭 스프린트가 없습니다.'));
          console.log('');
          console.log(chalk.gray('새 독립 스프린트를 생성하려면:'));
          console.log(chalk.blue('  aiwf-sprint independent "프로젝트 이름"'));
          return;
        }
        
        console.log(chalk.bold('📊 스프린트 목록:'));
        console.log('');
        
        for (const sprintDir of sprintDirs.sort()) {
          const sprintPath = path.join(sprintsDir, sprintDir);
          const sprintId = sprintDir.match(/^(S\d+)_/)[1];
          
          // 스프린트 메타 파일 읽기
          try {
            const metaFiles = (await fs.readdir(sprintPath)).filter(f => f.includes('meta.md'));
            if (metaFiles.length > 0) {
              const metaContent = await fs.readFile(path.join(sprintPath, metaFiles[0]), 'utf-8');
              const statusMatch = metaContent.match(/\*\*상태\*\*:\s*(\w+)/);
              const typeMatch = metaContent.match(/\*\*타입\*\*:\s*([^\n]+)/);
              
              const status = statusMatch ? statusMatch[1] : 'unknown';
              const type = typeMatch ? typeMatch[1].trim() : 'normal';
              
              // 상태 필터링
              if (options.status && status !== options.status) {
                continue;
              }
              
              const statusIcon = status === 'active' ? '🔄' : 
                                status === 'completed' ? '✅' : '⏳';
              const typeIcon = type.includes('독립') ? '🚀' : '📋';
              
              console.log(`${statusIcon} ${typeIcon} ${chalk.cyan(sprintId)} - ${chalk.white(sprintDir.split('_').slice(1).join('_'))}`);
              console.log(`    상태: ${chalk.yellow(status)} | 타입: ${chalk.gray(type)}`);
              
              // 태스크 수 계산
              const taskFiles = (await fs.readdir(sprintPath)).filter(f => f.match(/^T\d+_/));
              console.log(`    태스크: ${chalk.blue(taskFiles.length)}개`);
            }
          } catch (error) {
            console.log(`${chalk.red('❌')} ${chalk.cyan(sprintId)} - ${chalk.gray('메타데이터 읽기 실패')}`);
          }
          
          console.log('');
        }
        
      } catch (error) {
        console.log(chalk.yellow('📭 스프린트 디렉토리가 없습니다.'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 스프린트 목록 조회 실패:'), error.message);
      process.exit(1);
    }
  });

// 스프린트 상태 확인
program
  .command('status <sprintId>')
  .description('특정 스프린트의 상세 상태 확인')
  .action(async (sprintId) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // 프로젝트 루트 찾기
      let currentDir = process.cwd();
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const sprintsDir = path.join(currentDir, '.aiwf', '03_SPRINTS');
      const entries = await fs.readdir(sprintsDir);
      const sprintDir = entries.find(entry => entry.startsWith(`${sprintId}_`));
      
      if (!sprintDir) {
        console.error(chalk.red(`❌ 스프린트 ${sprintId}를 찾을 수 없습니다.`));
        process.exit(1);
      }
      
      const sprintPath = path.join(sprintsDir, sprintDir);
      
      console.log(chalk.bold(`📊 스프린트 ${sprintId} 상태`));
      console.log('');
      
      // 메타 파일 읽기
      const metaFiles = (await fs.readdir(sprintPath)).filter(f => f.includes('meta.md'));
      if (metaFiles.length > 0) {
        const metaContent = await fs.readFile(path.join(sprintPath, metaFiles[0]), 'utf-8');
        
        const statusMatch = metaContent.match(/\*\*상태\*\*:\s*(\w+)/);
        const typeMatch = metaContent.match(/\*\*타입\*\*:\s*([^\n]+)/);
        const createdMatch = metaContent.match(/\*\*생성일\*\*:\s*([^\n]+)/);
        
        console.log(`상태: ${chalk.yellow(statusMatch ? statusMatch[1] : 'unknown')}`);
        console.log(`타입: ${chalk.blue(typeMatch ? typeMatch[1].trim() : 'normal')}`);
        console.log(`생성일: ${chalk.gray(createdMatch ? createdMatch[1].trim() : 'unknown')}`);
        console.log('');
      }
      
      // 태스크 목록
      const taskFiles = (await fs.readdir(sprintPath)).filter(f => f.match(/^T\d+_/));
      console.log(chalk.bold(`📋 태스크 목록 (${taskFiles.length}개):`));
      console.log('');
      
      for (const taskFile of taskFiles.sort()) {
        const taskContent = await fs.readFile(path.join(sprintPath, taskFile), 'utf-8');
        const taskId = taskFile.match(/^(T\d+)_/)[1];
        const statusMatch = taskContent.match(/\*\*상태\*\*:\s*(\w+)/);
        const titleMatch = taskContent.match(/^#\s+T\d+:\s*(.+)$/m);
        
        const status = statusMatch ? statusMatch[1] : 'pending';
        const title = titleMatch ? titleMatch[1].trim() : taskFile;
        
        const statusIcon = status === 'completed' ? '✅' : 
                          status === 'in_progress' ? '🔄' : '⏳';
        
        console.log(`${statusIcon} ${chalk.cyan(taskId)} - ${chalk.white(title)}`);
        console.log(`    상태: ${chalk.yellow(status)}`);
        console.log('');
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 스프린트 상태 확인 실패:'), error.message);
      process.exit(1);
    }
  });

// 도움말 명령어
program
  .command('help')
  .description('AIWF 스프린트 명령어 도움말')
  .action(() => {
    console.log(chalk.bold('🚀 AIWF 스프린트 CLI 도움말'));
    console.log('');
    console.log(chalk.yellow('📋 주요 명령어:'));
    console.log('');
    console.log(`  ${chalk.cyan('aiwf-sprint independent [name]')} - 독립 스프린트 생성`);
    console.log(`  ${chalk.cyan('aiwf-sprint list')} - 스프린트 목록 보기`);
    console.log(`  ${chalk.cyan('aiwf-sprint status <id>')} - 스프린트 상태 확인`);
    console.log('');
    console.log(chalk.yellow('🔧 독립 스프린트 옵션:'));
    console.log('');
    console.log(`  ${chalk.blue('--from-readme')} - README TODO에서 자동 추출`);
    console.log(`  ${chalk.blue('--from-issue <번호>')} - GitHub 이슈에서 생성`);
    console.log(`  ${chalk.blue('--minimal')} - 최소 엔지니어링 레벨 (기본값)`);
    console.log(`  ${chalk.blue('--balanced')} - 균형 엔지니어링 레벨`);
    console.log(`  ${chalk.blue('--complete')} - 완전 엔지니어링 레벨`);
    console.log('');
    console.log(chalk.yellow('💡 사용 예시:'));
    console.log('');
    console.log(`  ${chalk.gray('# README TODO로 독립 스프린트 생성')}`);
    console.log(`  ${chalk.blue('aiwf-sprint independent --from-readme')}`);
    console.log('');
    console.log(`  ${chalk.gray('# GitHub 이슈로 스프린트 생성')}`);
    console.log(`  ${chalk.blue('aiwf-sprint independent --from-issue 123')}`);
    console.log('');
    console.log(`  ${chalk.gray('# 균형 레벨로 커스텀 스프린트 생성')}`);
    console.log(`  ${chalk.blue('aiwf-sprint independent "API 개발" --balanced')}`);
    console.log('');
    console.log(chalk.green('✨ 생성 후 Claude Code에서 `/project:aiwf:yolo [스프린트ID]`로 실행하세요!'));
  });

// 에러 핸들링
program.on('command:*', () => {
  console.error(chalk.red('❌ 알 수 없는 명령어입니다.'));
  console.log('');
  console.log(chalk.blue('도움말을 보려면: aiwf-sprint help'));
  process.exit(1);
});

// CLI 실행
program.parse(process.argv);

// 인수가 없으면 도움말 표시
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
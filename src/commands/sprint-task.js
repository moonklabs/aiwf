#!/usr/bin/env node

/**
 * 스프린트 태스크 관리 명령어
 * 스프린트에 개별 태스크를 추가하고 관리하는 기능
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

// 프로젝트 루트에서 .aiwf 디렉토리 찾기
async function findProjectRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  
  while (currentDir !== path.parse(currentDir).root) {
    try {
      const aiwfPath = path.join(currentDir, '.aiwf');
      await fs.access(aiwfPath);
      return currentDir;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }
  
  throw new Error('.aiwf 디렉토리를 찾을 수 없습니다. AIWF 프로젝트 내에서 실행해주세요.');
}

// 스프린트 존재 확인
async function verifySprintExists(projectRoot, sprintId) {
  const sprintsDir = path.join(projectRoot, '.aiwf', '03_SPRINTS');
  
  try {
    const entries = await fs.readdir(sprintsDir);
    const sprintDir = entries.find(entry => entry.startsWith(sprintId + '_'));
    
    if (!sprintDir) {
      throw new Error(`스프린트 ${sprintId}를 찾을 수 없습니다.`);
    }
    
    return path.join(sprintsDir, sprintDir);
  } catch (error) {
    throw new Error(`스프린트 디렉토리 읽기 실패: ${error.message}`);
  }
}

// 다음 태스크 번호 결정
async function getNextTaskNumber(sprintPath, sprintId) {
  try {
    const files = await fs.readdir(sprintPath);
    const taskFiles = files.filter(f => f.match(/^T\d+_/));
    
    if (taskFiles.length === 0) {
      return 'T01';
    }
    
    const numbers = taskFiles.map(f => {
      const match = f.match(/^T(\d+)_/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maxNumber = Math.max(...numbers);
    return `T${String(maxNumber + 1).padStart(2, '0')}`;
  } catch {
    return 'T01';
  }
}

// 태스크 파일 생성
async function createTaskFile(sprintPath, taskNumber, sprintId, taskTitle) {
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const fileName = `${taskNumber}_${sprintId}_${taskTitle.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_가-힣]/g, '')}.md`;
  const filePath = path.join(sprintPath, fileName);
  
  const content = `# ${taskNumber}: ${taskTitle}

**스프린트**: ${sprintId}
**생성일**: ${timestamp}
**상태**: pending
**우선순위**: medium
**예상 시간**: TBD

## 개요

[태스크에 대한 간단한 설명을 작성하세요]

## 요구사항

- [ ] [구체적인 요구사항 1]
- [ ] [구체적인 요구사항 2]
- [ ] [구체적인 요구사항 3]

## 승인 기준

- [ ] [완료 조건 1]
- [ ] [완료 조건 2]
- [ ] [완료 조건 3]

## 기술 가이드라인

- [관련 아키텍처 결정 참조]
- [기존 코드베이스 패턴 참조]
- [사용할 기술 스택]

## 구현 노트

- [구현 시 고려사항]
- [잠재적 리스크]
- [테스트 전략]

## 참조

- [관련 문서나 코드 링크]
`;

  await fs.writeFile(filePath, content);
  return { filePath, fileName, taskNumber };
}

// 스프린트 메타 파일 업데이트
async function updateSprintMeta(sprintPath, taskNumber, taskTitle) {
  const files = await fs.readdir(sprintPath);
  const metaFile = files.find(f => f.includes('sprint_meta.md'));
  
  if (!metaFile) {
    console.warn(chalk.yellow('⚠️  스프린트 메타 파일을 찾을 수 없습니다.'));
    return;
  }
  
  const metaPath = path.join(sprintPath, metaFile);
  let content = await fs.readFile(metaPath, 'utf-8');
  
  // 태스크 섹션 찾기 및 업데이트
  const taskSectionRegex = /## 태스크 목록[\s\S]*?(?=##|$)/;
  const taskMatch = content.match(taskSectionRegex);
  
  if (taskMatch) {
    const newTaskLine = `- [ ] ${taskNumber}: ${taskTitle} - 상태: pending\n`;
    const updatedSection = taskMatch[0] + newTaskLine;
    content = content.replace(taskSectionRegex, updatedSection);
  } else {
    // 태스크 섹션이 없으면 추가
    content += `\n## 태스크 목록\n\n- [ ] ${taskNumber}: ${taskTitle} - 상태: pending\n`;
  }
  
  await fs.writeFile(metaPath, content);
}

// 매니페스트 업데이트
async function updateManifest(projectRoot, sprintId, taskNumber, taskTitle) {
  const manifestPath = path.join(projectRoot, '.aiwf', '00_PROJECT_MANIFEST.md');
  
  try {
    let content = await fs.readFile(manifestPath, 'utf-8');
    
    // 최종 업데이트 날짜 변경
    const dateRegex = /\*\*마지막 업데이트\*\*: \d{4}-\d{2}-\d{2}/;
    const today = new Date().toISOString().slice(0, 10);
    content = content.replace(dateRegex, `**마지막 업데이트**: ${today}`);
    
    // 활성 태스크 섹션에 추가
    const activeTasksRegex = /## 활성 태스크[\s\S]*?### 계획됨/;
    const match = content.match(activeTasksRegex);
    
    if (match) {
      const newTaskLine = `\n- **${taskNumber}_${sprintId}**: ${taskTitle} (pending → ${today} 생성)\n`;
      const updatedSection = match[0].replace('### 계획됨', newTaskLine + '### 계획됨');
      content = content.replace(activeTasksRegex, updatedSection);
    }
    
    // 태스크 통계 업데이트
    const statsRegex = /- \*\*총 태스크\*\*: (\d+)/;
    const statsMatch = content.match(statsRegex);
    if (statsMatch) {
      const total = parseInt(statsMatch[1]) + 1;
      content = content.replace(statsRegex, `- **총 태스크**: ${total}`);
    }
    
    await fs.writeFile(manifestPath, content);
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  매니페스트 업데이트 실패: ${error.message}`));
  }
}

// 메인 함수
export async function addTaskToSprint(sprintId, taskTitle) {
  const spinner = ora('스프린트에 태스크 추가 중...').start();
  
  try {
    // 1. 프로젝트 루트 찾기
    const projectRoot = await findProjectRoot();
    
    // 2. 스프린트 존재 확인
    spinner.text = '스프린트 확인 중...';
    const sprintPath = await verifySprintExists(projectRoot, sprintId);
    
    // 3. 다음 태스크 번호 결정
    spinner.text = '태스크 번호 결정 중...';
    const taskNumber = await getNextTaskNumber(sprintPath, sprintId);
    
    // 4. 태스크 파일 생성
    spinner.text = '태스크 파일 생성 중...';
    const { filePath, fileName, taskNumber: finalTaskNumber } = await createTaskFile(
      sprintPath, 
      taskNumber, 
      sprintId, 
      taskTitle
    );
    
    // 5. 스프린트 메타 업데이트
    spinner.text = '스프린트 메타 업데이트 중...';
    await updateSprintMeta(sprintPath, finalTaskNumber, taskTitle);
    
    // 6. 매니페스트 업데이트
    spinner.text = '프로젝트 매니페스트 업데이트 중...';
    await updateManifest(projectRoot, sprintId, finalTaskNumber, taskTitle);
    
    spinner.succeed('태스크 추가 완료!');
    
    // 성공 메시지
    console.log('\n' + chalk.green('✅ 태스크 추가 완료!'));
    console.log('\n📄 생성된 파일: ' + chalk.cyan(fileName));
    console.log('🏃 스프린트: ' + chalk.yellow(sprintId));
    console.log('📋 태스크: ' + chalk.yellow(`${finalTaskNumber} - ${taskTitle}`));
    console.log('⏱️  상태: ' + chalk.blue('pending'));
    
    console.log('\n' + chalk.bold('📝 다음 단계:'));
    console.log('1. 태스크 파일을 열어 세부사항 작성');
    console.log(`2. ${chalk.cyan(`/aiwf:do_task ${finalTaskNumber}`)}로 작업 시작`);
    console.log(`3. 완료 후 ${chalk.cyan(`/aiwf:update_task_status ${finalTaskNumber} completed`)} 실행`);
    
    console.log('\n💡 팁: 태스크 목록 확인은 ' + chalk.cyan(`/aiwf:list_sprint_tasks ${sprintId}`));
    
    return { success: true, taskNumber: finalTaskNumber, filePath };
    
  } catch (error) {
    spinner.fail(`태스크 추가 실패: ${error.message}`);
    throw error;
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(chalk.red('사용법: aiwf-sprint-task <스프린트ID> <태스크 제목>'));
    console.error(chalk.gray('예시: aiwf-sprint-task S03 "API 성능 최적화"'));
    process.exit(1);
  }
  
  const [sprintId, ...titleParts] = args;
  const taskTitle = titleParts.join(' ').replace(/^["']|["']$/g, '');
  
  addTaskToSprint(sprintId, taskTitle).catch(error => {
    console.error(chalk.red(`오류: ${error.message}`));
    process.exit(1);
  });
}

export default addTaskToSprint;
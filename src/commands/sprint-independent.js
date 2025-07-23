#!/usr/bin/env node

/**
 * 독립 스프린트 생성 명령어
 * 마일스톤 없이 독립적으로 실행 가능한 스프린트를 생성
 * YOLO 모드의 핵심 기능
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { execSync } from 'child_process';

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

// 다음 스프린트 ID 생성
async function getNextSprintId(projectRoot) {
  const sprintsDir = path.join(projectRoot, '.aiwf', '03_SPRINTS');
  
  try {
    await fs.access(sprintsDir);
  } catch {
    await fs.mkdir(sprintsDir, { recursive: true });
    return 'S01';
  }
  
  const entries = await fs.readdir(sprintsDir);
  const sprintDirs = entries.filter(entry => entry.match(/^S\d+_/));
  
  if (sprintDirs.length === 0) {
    return 'S01';
  }
  
  const numbers = sprintDirs.map(dir => {
    const match = dir.match(/^S(\d+)_/);
    return match ? parseInt(match[1]) : 0;
  });
  
  const maxNumber = Math.max(...numbers);
  return `S${String(maxNumber + 1).padStart(2, '0')}`;
}

// README에서 TODO 추출
async function extractTodosFromReadme(projectRoot) {
  const readmePaths = [
    path.join(projectRoot, 'README.md'),
    path.join(projectRoot, 'readme.md'),
    path.join(projectRoot, 'README.ko.md')
  ];
  
  for (const readmePath of readmePaths) {
    try {
      const content = await fs.readFile(readmePath, 'utf-8');
      
      // TODO, Features, 기능, 할 일 등의 섹션 찾기
      const todoPatterns = [
        /## (?:TODO|To Do|할 일|Tasks?)[\s\S]*?(?=##|$)/gi,
        /## (?:Features?|기능)[\s\S]*?(?=##|$)/gi,
        /- \[ \] .+/g
      ];
      
      const todos = [];
      for (const pattern of todoPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const todoItems = match.match(/- \[ \] (.+)/g);
            if (todoItems) {
              todoItems.forEach(item => {
                const task = item.replace(/- \[ \] /, '').trim();
                todos.push(task);
              });
            }
          });
        }
      }
      
      if (todos.length > 0) {
        return todos;
      }
    } catch {
      // 파일이 없으면 다음 경로 시도
      continue;
    }
  }
  
  return [];
}

// GitHub 이슈에서 정보 추출
async function extractFromGitHubIssue(issueNumber) {
  try {
    // gh CLI 사용
    const issueData = execSync(`gh issue view ${issueNumber} --json title,body`, { encoding: 'utf8' });
    const issue = JSON.parse(issueData);
    
    const tasks = [];
    const title = issue.title;
    
    // 이슈 본문에서 체크리스트 추출
    if (issue.body) {
      const checklistItems = issue.body.match(/- \[ \] (.+)/g);
      if (checklistItems) {
        checklistItems.forEach(item => {
          const task = item.replace(/- \[ \] /, '').trim();
          tasks.push(task);
        });
      }
    }
    
    return { title, tasks };
  } catch (error) {
    throw new Error(`GitHub 이슈 #${issueNumber}를 가져올 수 없습니다: ${error.message}`);
  }
}

// 스프린트 디렉토리 생성
async function createSprintDirectory(projectRoot, sprintId, sprintName) {
  const dirName = `${sprintId}_${sprintName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_가-힣]/g, '')}`;
  const sprintPath = path.join(projectRoot, '.aiwf', '03_SPRINTS', dirName);
  
  await fs.mkdir(sprintPath, { recursive: true });
  return { sprintPath, dirName };
}

// 스프린트 메타 파일 생성
async function createSprintMeta(sprintPath, sprintId, sprintName, options) {
  const timestamp = new Date().toISOString().slice(0, 10);
  
  const content = `# ${sprintId} - ${sprintName}

**타입**: 독립 스프린트
**생성일**: ${timestamp}
**상태**: active
**마일스톤**: ${options.milestone || 'N/A (독립 스프린트)'}

## 개요

${options.description || '이 스프린트는 마일스톤과 독립적으로 실행되는 작업 단위입니다.'}

## 목표

${options.goals ? options.goals.map(g => `- ${g}`).join('\n') : '- 요구사항 충족\n- 최소 기능 구현\n- 빠른 완성'}

## 범위

${options.scope || '이 스프린트의 범위는 명시된 태스크로 제한됩니다. 오버엔지니어링을 피하고 핵심 기능에 집중합니다.'}

## YOLO 설정

\`\`\`yaml
engineering_level: ${options.engineeringLevel || 'minimal'}
focus_rules:
  - requirement_first
  - simple_solution
  - no_gold_plating
  - stay_on_track
\`\`\`

## 태스크 목록

${options.tasks ? options.tasks.map((t, i) => `- [ ] T${String(i + 1).padStart(2, '0')}: ${t} - 상태: pending`).join('\n') : '(태스크가 자동으로 추가됩니다)'}

## 진행 상황

- **계획됨**: ${options.tasks ? options.tasks.length : 0}
- **진행 중**: 0
- **완료됨**: 0
- **전체 진행률**: 0%

## 노트

- 이 스프린트는 YOLO 모드로 실행하기에 최적화되어 있습니다.
- \`/project:aiwf:yolo ${sprintId}\`로 전체 스프린트를 자동 실행할 수 있습니다.
`;
  
  const metaPath = path.join(sprintPath, `${sprintId}_sprint_meta.md`);
  await fs.writeFile(metaPath, content);
  return metaPath;
}

// 태스크 파일들 생성
async function createTaskFiles(sprintPath, sprintId, tasks) {
  const createdTasks = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const taskNumber = `T${String(i + 1).padStart(2, '0')}`;
    const taskTitle = tasks[i];
    const fileName = `${taskNumber}_${sprintId}_${taskTitle.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_가-힣]/g, '')}.md`;
    const filePath = path.join(sprintPath, fileName);
    
    const content = `# ${taskNumber}: ${taskTitle}

**스프린트**: ${sprintId}
**생성일**: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}
**상태**: pending
**우선순위**: high
**예상 시간**: TBD

## 개요

${taskTitle}를 구현합니다.

## 요구사항

- [ ] 핵심 기능 구현
- [ ] 기본적인 테스트
- [ ] 필수 문서화

## 승인 기준

- [ ] 요구사항 충족
- [ ] 정상 작동 확인
- [ ] 코드 품질 기준 충족

## 구현 노트

- 가장 간단한 해결책 우선
- 기존 코드 재사용
- 오버엔지니어링 방지
`;
    
    await fs.writeFile(filePath, content);
    createdTasks.push({ taskNumber, fileName, taskTitle });
  }
  
  return createdTasks;
}

// 메인 함수: 독립 스프린트 생성
export async function createIndependentSprint(options = {}) {
  const spinner = ora('독립 스프린트 생성 중...').start();
  
  try {
    const projectRoot = await findProjectRoot();
    const sprintId = await getNextSprintId(projectRoot);
    
    let sprintName = options.name;
    let tasks = options.tasks || [];
    let description = options.description;
    let engineeringLevel = options.minimal ? 'minimal' : options.engineeringLevel || 'minimal';
    
    // README에서 TODO 추출
    if (options.fromReadme) {
      spinner.text = 'README에서 TODO 추출 중...';
      const todos = await extractTodosFromReadme(projectRoot);
      if (todos.length > 0) {
        tasks = todos;
        sprintName = sprintName || 'README TODO 구현';
        description = 'README에서 추출한 TODO 항목들을 구현합니다.';
      } else {
        spinner.warn('README에서 TODO를 찾을 수 없습니다.');
      }
    }
    
    // GitHub 이슈에서 추출
    if (options.fromIssue) {
      spinner.text = `GitHub 이슈 #${options.fromIssue} 로딩 중...`;
      const issueData = await extractFromGitHubIssue(options.fromIssue);
      sprintName = sprintName || issueData.title;
      tasks = issueData.tasks.length > 0 ? issueData.tasks : [`이슈 #${options.fromIssue} 구현`];
      description = `GitHub 이슈 #${options.fromIssue}: ${issueData.title}`;
    }
    
    // 대화형 입력
    if (!sprintName || tasks.length === 0) {
      spinner.stop();
      
      const response = await prompts([
        {
          type: !sprintName ? 'text' : null,
          name: 'name',
          message: '스프린트 이름:',
          initial: '빠른 프로토타입'
        },
        {
          type: tasks.length === 0 ? 'text' : null,
          name: 'goal',
          message: '주요 목표 (한 줄로):',
          initial: '핵심 기능 구현'
        }
      ]);
      
      sprintName = sprintName || response.name;
      if (response.goal && tasks.length === 0) {
        tasks = [response.goal];
      }
      
      spinner.start();
    }
    
    // 스프린트 디렉토리 생성
    spinner.text = '스프린트 디렉토리 생성 중...';
    const { sprintPath, dirName } = await createSprintDirectory(projectRoot, sprintId, sprintName);
    
    // 스프린트 메타 파일 생성
    spinner.text = '스프린트 메타 파일 생성 중...';
    await createSprintMeta(sprintPath, sprintId, sprintName, {
      description,
      goals: options.goals || [`${sprintName} 완성`],
      scope: options.scope,
      engineeringLevel,
      tasks,
      milestone: null
    });
    
    // 태스크 파일 생성
    if (tasks.length > 0) {
      spinner.text = '태스크 파일 생성 중...';
      await createTaskFiles(sprintPath, sprintId, tasks);
    }
    
    spinner.succeed('독립 스프린트 생성 완료!');
    
    // 성공 메시지
    console.log('\n' + chalk.green('✅ 독립 스프린트 생성 완료!'));
    console.log('\n📁 스프린트: ' + chalk.cyan(dirName));
    console.log('🆔 ID: ' + chalk.yellow(sprintId));
    console.log('📝 이름: ' + chalk.yellow(sprintName));
    console.log('🎯 태스크: ' + chalk.blue(`${tasks.length}개`));
    console.log('🔧 엔지니어링 레벨: ' + chalk.magenta(engineeringLevel));
    
    console.log('\n' + chalk.bold('🚀 다음 단계:'));
    console.log(`1. ${chalk.cyan(`/project:aiwf:yolo ${sprintId}`)}로 전체 스프린트 실행`);
    console.log(`2. ${chalk.cyan(`/project:aiwf:yolo ${sprintId} --minimal`)}로 최소 구현 모드 실행`);
    console.log(`3. ${chalk.cyan(`aiwf sprint-task ${sprintId} "새 태스크"`)}로 태스크 추가`);
    
    console.log('\n💡 팁: 이 스프린트는 마일스톤과 독립적으로 실행됩니다!');
    
    return { success: true, sprintId, sprintPath, tasks: tasks.length };
    
  } catch (error) {
    spinner.fail(`독립 스프린트 생성 실패: ${error.message}`);
    throw error;
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  const options = {
    name: null,
    fromReadme: false,
    fromIssue: null,
    minimal: false,
    engineeringLevel: 'minimal'
  };
  
  // 인자 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--from-readme') {
      options.fromReadme = true;
    } else if (arg === '--from-issue' && args[i + 1]) {
      options.fromIssue = args[++i];
    } else if (arg === '--minimal') {
      options.minimal = true;
      options.engineeringLevel = 'minimal';
    } else if (arg === '--balanced') {
      options.engineeringLevel = 'balanced';
    } else if (arg === '--complete') {
      options.engineeringLevel = 'complete';
    } else if (!options.name) {
      options.name = arg;
    }
  }
  
  createIndependentSprint(options).catch(error => {
    console.error(chalk.red(`오류: ${error.message}`));
    process.exit(1);
  });
}

export default createIndependentSprint;
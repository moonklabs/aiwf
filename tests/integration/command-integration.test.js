/**
 * AIWF 명령어 통합 테스트
 */

import { testUtils, testFixtures } from './setup.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AIWF 명령어 통합 테스트', () => {
  let testProjectDir;
  let aiwfDir;

  beforeEach(async () => {
    testProjectDir = await testUtils.createTempDir('command-integration-');
    aiwfDir = await testUtils.createTestProjectStructure(testProjectDir);
  });

  afterEach(async () => {
    await testUtils.cleanupTempDir(testProjectDir);
  });

  describe('핵심 명령어 통합 테스트', () => {
    test('프로젝트 초기화 명령어 시뮬레이션', async () => {
      // aiwf_initialize 명령어 시뮬레이션
      const initializeProject = async (projectDir) => {
        const aiwfDir = path.join(projectDir, '.aiwf');
        
        // 필수 디렉토리 생성
        const requiredDirs = [
          '00_PROJECT_MANIFEST.md',
          '01_PROJECT_DOCS',
          '02_REQUIREMENTS',
          '03_SPRINTS',
          '04_GENERAL_TASKS',
          '05_TEMPLATES',
          '06_FEATURE_LEDGERS',
          '07_AI_PERSONAS'
        ];

        for (const dir of requiredDirs) {
          if (!dir.endsWith('.md')) {
            await fs.mkdir(path.join(aiwfDir, dir), { recursive: true });
          }
        }

        // 프로젝트 매니페스트 생성
        const manifest = `# AIWF 프로젝트 매니페스트

**프로젝트명**: Test Project
**생성일**: ${new Date().toISOString().split('T')[0]}
**현재 버전**: 0.1.0
**프로젝트 유형**: 테스트 프로젝트

## 프로젝트 개요
AIWF 테스트 프로젝트입니다.

## 현재 마일스톤
- **활성 마일스톤**: 없음
- **마일스톤 상태**: 대기

## 현재 스프린트
- **활성 스프린트**: 없음
- **스프린트 상태**: 대기

## 태스크 통계
- **총 태스크**: 0
- **완료**: 0
- **진행 중**: 0
- **대기 중**: 0
`;

        await fs.writeFile(path.join(aiwfDir, '00_PROJECT_MANIFEST.md'), manifest);
        
        return {
          success: true,
          message: '프로젝트 초기화 완료',
          aiwfDir: aiwfDir
        };
      };

      const result = await initializeProject(testProjectDir);
      
      expect(result.success).toBe(true);
      expect(await testUtils.dirExists(result.aiwfDir)).toBe(true);
      expect(await testUtils.fileExists(path.join(result.aiwfDir, '00_PROJECT_MANIFEST.md'))).toBe(true);
      expect(await testUtils.dirExists(path.join(result.aiwfDir, '06_FEATURE_LEDGERS'))).toBe(true);
      expect(await testUtils.dirExists(path.join(result.aiwfDir, '07_AI_PERSONAS'))).toBe(true);
    });

    test('태스크 생성 명령어 시뮬레이션', async () => {
      // aiwf_create_task 명령어 시뮬레이션
      const createTask = async (taskData) => {
        const tasksDir = path.join(aiwfDir, '04_GENERAL_TASKS');
        const taskFilePath = path.join(tasksDir, `${taskData.id}.md`);
        
        const taskContent = `---
task_id: ${taskData.id}
title: ${taskData.title}
status: ${taskData.status}
priority: ${taskData.priority}
created_at: ${new Date().toISOString()}
---

# Task: ${taskData.title}

## Description
${taskData.description}

## Acceptance Criteria
${taskData.acceptanceCriteria.map(criterion => `- [ ] ${criterion}`).join('\n')}

## Subtasks
${taskData.subtasks.map(subtask => `- [ ] ${subtask}`).join('\n')}
`;

        await fs.writeFile(taskFilePath, taskContent);
        
        return {
          success: true,
          taskId: taskData.id,
          filePath: taskFilePath
        };
      };

      const taskData = {
        id: 'TEST_TASK_001',
        title: 'Test Task Creation',
        description: 'Test task for command integration',
        status: 'open',
        priority: 'medium',
        acceptanceCriteria: [
          'Task file is created',
          'Task has proper frontmatter',
          'Task is added to project manifest'
        ],
        subtasks: [
          'Create task file',
          'Add to manifest',
          'Verify structure'
        ]
      };

      const result = await createTask(taskData);
      
      expect(result.success).toBe(true);
      expect(await testUtils.fileExists(result.filePath)).toBe(true);
      
      const parsedTask = await testUtils.parseMarkdownFile(result.filePath);
      expect(parsedTask.metadata.task_id).toBe(taskData.id);
      expect(parsedTask.metadata.title).toBe(taskData.title);
      expect(parsedTask.metadata.status).toBe(taskData.status);
    });

    test('Feature Ledger 생성 명령어 시뮬레이션', async () => {
      // aiwf_create_feature_ledger 명령어 시뮬레이션
      const createFeatureLedger = async (featureData) => {
        const featureLedgerDir = path.join(aiwfDir, '06_FEATURE_LEDGERS');
        const featureFilePath = path.join(featureLedgerDir, `${featureData.id}.md`);
        
        const featureContent = `---
id: ${featureData.id}
title: ${featureData.title}
description: ${featureData.description}
status: ${featureData.status}
priority: ${featureData.priority}
milestone: ${featureData.milestone}
created_at: ${new Date().toISOString()}
updated_at: ${new Date().toISOString()}
---

# Feature: ${featureData.title}

## Description
${featureData.description}

## Status
${featureData.status}

## Priority
${featureData.priority}

## Milestone
${featureData.milestone}
`;

        await fs.writeFile(featureFilePath, featureContent);
        
        return {
          success: true,
          featureId: featureData.id,
          filePath: featureFilePath
        };
      };

      const featureData = {
        id: 'FEATURE_TEST_001',
        title: 'Test Feature Creation',
        description: 'Test feature for command integration',
        status: 'planned',
        priority: 'high',
        milestone: 'M01'
      };

      const result = await createFeatureLedger(featureData);
      
      expect(result.success).toBe(true);
      expect(await testUtils.fileExists(result.filePath)).toBe(true);
      
      const parsedFeature = await testUtils.parseMarkdownFile(result.filePath);
      expect(parsedFeature.metadata.id).toBe(featureData.id);
      expect(parsedFeature.metadata.title).toBe(featureData.title);
      expect(parsedFeature.metadata.status).toBe(featureData.status);
    });
  });

  describe('AI 페르소나 명령어 통합 테스트', () => {
    test('페르소나 생성 명령어 시뮬레이션', async () => {
      // aiwf_create_persona 명령어 시뮬레이션
      const createPersona = async (personaData) => {
        const personaDir = path.join(aiwfDir, '07_AI_PERSONAS');
        const personaFilePath = path.join(personaDir, `${personaData.id}.md`);
        
        const personaContent = `---
id: ${personaData.id}
name: ${personaData.name}
description: ${personaData.description}
active: ${personaData.active}
commands: ${personaData.commands.join(', ')}
created_at: ${new Date().toISOString()}
---

# AI 페르소나: ${personaData.name}

## Description
${personaData.description}

## Context
${personaData.context}

## Available Commands
${personaData.commands.map(cmd => `- ${cmd}`).join('\n')}
`;

        await fs.writeFile(personaFilePath, personaContent);
        
        return {
          success: true,
          personaId: personaData.id,
          filePath: personaFilePath
        };
      };

      const personaData = {
        id: 'test_architect',
        name: 'Test Architect',
        description: 'Test AI persona for architecture',
        active: true,
        commands: ['design', 'review', 'optimize'],
        context: 'You are a test software architect.'
      };

      const result = await createPersona(personaData);
      
      expect(result.success).toBe(true);
      expect(await testUtils.fileExists(result.filePath)).toBe(true);
      
      const parsedPersona = await testUtils.parseMarkdownFile(result.filePath);
      expect(parsedPersona.metadata.id).toBe(personaData.id);
      expect(parsedPersona.metadata.name).toBe(personaData.name);
      expect(parsedPersona.metadata.active).toBe('true');
    });

    test('페르소나 전환 명령어 시뮬레이션', async () => {
      // aiwf_switch_persona 명령어 시뮬레이션
      const switchPersona = async (fromPersonaId, toPersonaId) => {
        const personaDir = path.join(aiwfDir, '07_AI_PERSONAS');
        
        // 기존 페르소나 비활성화
        if (fromPersonaId) {
          const fromPath = path.join(personaDir, `${fromPersonaId}.md`);
          if (await testUtils.fileExists(fromPath)) {
            const fromContent = await fs.readFile(fromPath, 'utf8');
            const updatedFromContent = fromContent.replace('active: true', 'active: false');
            await fs.writeFile(fromPath, updatedFromContent);
          }
        }
        
        // 새 페르소나 활성화
        const toPath = path.join(personaDir, `${toPersonaId}.md`);
        if (await testUtils.fileExists(toPath)) {
          const toContent = await fs.readFile(toPath, 'utf8');
          const updatedToContent = toContent.replace('active: false', 'active: true');
          await fs.writeFile(toPath, updatedToContent);
          
          return {
            success: true,
            fromPersona: fromPersonaId,
            toPersona: toPersonaId
          };
        }
        
        return {
          success: false,
          error: 'Target persona not found'
        };
      };

      // 테스트 페르소나들 생성
      const personas = [
        { id: 'architect', name: 'Architect', active: true },
        { id: 'security', name: 'Security', active: false }
      ];

      for (const persona of personas) {
        const personaPath = path.join(aiwfDir, '07_AI_PERSONAS', `${persona.id}.md`);
        await fs.writeFile(personaPath, `---
id: ${persona.id}
name: ${persona.name}
active: ${persona.active}
---

# AI 페르소나: ${persona.name}
`);
      }

      const result = await switchPersona('architect', 'security');
      
      expect(result.success).toBe(true);
      expect(result.fromPersona).toBe('architect');
      expect(result.toPersona).toBe('security');
      
      // 전환 결과 검증
      const architectContent = await testUtils.parseMarkdownFile(
        path.join(aiwfDir, '07_AI_PERSONAS', 'architect.md')
      );
      const securityContent = await testUtils.parseMarkdownFile(
        path.join(aiwfDir, '07_AI_PERSONAS', 'security.md')
      );
      
      expect(architectContent.metadata.active).toBe('false');
      expect(securityContent.metadata.active).toBe('true');
    });
  });

  describe('상태 관리 명령어 통합 테스트', () => {
    test('프로젝트 상태 조회 명령어 시뮬레이션', async () => {
      // aiwf_status 명령어 시뮬레이션
      const getProjectStatus = async () => {
        const manifestPath = path.join(aiwfDir, '00_PROJECT_MANIFEST.md');
        const manifestContent = await testUtils.parseMarkdownFile(manifestPath);
        
        // 태스크 통계 계산
        const tasksDir = path.join(aiwfDir, '04_GENERAL_TASKS');
        const sprintsDir = path.join(aiwfDir, '03_SPRINTS');
        
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgressTasks = 0;
        
        try {
          const taskFiles = await fs.readdir(tasksDir);
          const mdFiles = taskFiles.filter(file => file.endsWith('.md'));
          totalTasks = mdFiles.length;
          
          for (const file of mdFiles) {
            const taskPath = path.join(tasksDir, file);
            const taskContent = await testUtils.parseMarkdownFile(taskPath);
            
            if (taskContent.metadata.status === 'completed') {
              completedTasks++;
            } else if (taskContent.metadata.status === 'in_progress') {
              inProgressTasks++;
            }
          }
        } catch (error) {
          // 디렉토리가 없거나 비어있는 경우
        }
        
        return {
          projectName: 'Test Project',
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks: totalTasks - completedTasks - inProgressTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
      };

      // 테스트 태스크 생성
      const tasksDir = path.join(aiwfDir, '04_GENERAL_TASKS');
      const testTasks = [
        { id: 'TASK_001', status: 'completed' },
        { id: 'TASK_002', status: 'in_progress' },
        { id: 'TASK_003', status: 'open' }
      ];

      for (const task of testTasks) {
        const taskPath = path.join(tasksDir, `${task.id}.md`);
        await fs.writeFile(taskPath, `---
task_id: ${task.id}
status: ${task.status}
---

# Task: ${task.id}
`);
      }

      const status = await getProjectStatus();
      
      expect(status.totalTasks).toBe(3);
      expect(status.completedTasks).toBe(1);
      expect(status.inProgressTasks).toBe(1);
      expect(status.pendingTasks).toBe(1);
      expect(status.completionRate).toBe(33);
    });

    test('마일스톤 진행률 조회 명령어 시뮬레이션', async () => {
      // aiwf_milestone_progress 명령어 시뮬레이션
      const getMilestoneProgress = async (milestoneId) => {
        const requirementsDir = path.join(aiwfDir, '02_REQUIREMENTS');
        const milestoneDir = path.join(requirementsDir, milestoneId);
        
        if (!await testUtils.dirExists(milestoneDir)) {
          return {
            success: false,
            error: 'Milestone not found'
          };
        }
        
        const metaPath = path.join(milestoneDir, `${milestoneId}_milestone_meta.md`);
        if (!await testUtils.fileExists(metaPath)) {
          return {
            success: false,
            error: 'Milestone metadata not found'
          };
        }
        
        const metaContent = await testUtils.parseMarkdownFile(metaPath);
        
        return {
          success: true,
          milestoneId: milestoneId,
          title: metaContent.metadata.title,
          status: metaContent.metadata.status,
          progress: 0 // 실제로는 관련 태스크들을 분석해서 계산
        };
      };

      // 테스트 마일스톤 생성
      const milestoneId = 'M01_Test_Milestone';
      const milestoneDir = path.join(aiwfDir, '02_REQUIREMENTS', milestoneId);
      await fs.mkdir(milestoneDir, { recursive: true });
      
      const metaPath = path.join(milestoneDir, `${milestoneId}_milestone_meta.md`);
      await fs.writeFile(metaPath, `---
milestone_id: ${milestoneId}
title: Test Milestone
status: active
---

# Milestone: Test Milestone
`);

      const progress = await getMilestoneProgress(milestoneId);
      
      expect(progress.success).toBe(true);
      expect(progress.milestoneId).toBe(milestoneId);
      expect(progress.title).toBe('Test Milestone');
      expect(progress.status).toBe('active');
    });
  });

  describe('명령어 체이닝 테스트', () => {
    test('연속 명령어 실행 시뮬레이션', async () => {
      // 여러 명령어를 연속으로 실행하는 시뮬레이션
      const executeCommandChain = async (commands) => {
        const results = [];
        
        for (const command of commands) {
          switch (command.type) {
            case 'create_task':
              const taskResult = await createTestTask(command.data);
              results.push(taskResult);
              break;
            case 'create_feature':
              const featureResult = await createTestFeature(command.data);
              results.push(featureResult);
              break;
            case 'switch_persona':
              const personaResult = await switchTestPersona(command.data);
              results.push(personaResult);
              break;
            default:
              results.push({ success: false, error: 'Unknown command' });
          }
        }
        
        return results;
      };

      // 헬퍼 함수들
      const createTestTask = async (data) => {
        const taskPath = path.join(aiwfDir, '04_GENERAL_TASKS', `${data.id}.md`);
        await fs.writeFile(taskPath, `---
task_id: ${data.id}
title: ${data.title}
status: open
---

# Task: ${data.title}
`);
        return { success: true, type: 'task', id: data.id };
      };

      const createTestFeature = async (data) => {
        const featurePath = path.join(aiwfDir, '06_FEATURE_LEDGERS', `${data.id}.md`);
        await fs.writeFile(featurePath, `---
id: ${data.id}
title: ${data.title}
status: planned
---

# Feature: ${data.title}
`);
        return { success: true, type: 'feature', id: data.id };
      };

      const switchTestPersona = async (data) => {
        return { success: true, type: 'persona_switch', from: data.from, to: data.to };
      };

      // 명령어 체인 실행
      const commands = [
        { type: 'create_task', data: { id: 'TASK_CHAIN_001', title: 'Chain Task 1' } },
        { type: 'create_feature', data: { id: 'FEATURE_CHAIN_001', title: 'Chain Feature 1' } },
        { type: 'switch_persona', data: { from: 'architect', to: 'security' } }
      ];

      const results = await executeCommandChain(commands);
      
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[0].type).toBe('task');
      expect(results[1].success).toBe(true);
      expect(results[1].type).toBe('feature');
      expect(results[2].success).toBe(true);
      expect(results[2].type).toBe('persona_switch');
    });
  });

  describe('명령어 에러 처리 테스트', () => {
    test('잘못된 명령어 파라미터 처리', async () => {
      const validateTaskData = (data) => {
        const errors = [];
        
        if (!data.id) errors.push('Task ID is required');
        if (!data.title) errors.push('Task title is required');
        if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
          errors.push('Invalid priority level');
        }
        
        return errors;
      };

      const validData = { id: 'TASK_001', title: 'Valid Task', priority: 'medium' };
      const invalidData = { title: 'Invalid Task', priority: 'invalid' };

      expect(validateTaskData(validData)).toHaveLength(0);
      expect(validateTaskData(invalidData)).toHaveLength(2);
      expect(validateTaskData(invalidData)).toContain('Task ID is required');
      expect(validateTaskData(invalidData)).toContain('Invalid priority level');
    });

    test('파일 시스템 오류 처리', async () => {
      const safeFileWrite = async (filePath, content) => {
        try {
          await fs.writeFile(filePath, content);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      // 유효한 경로
      const validPath = path.join(aiwfDir, 'test_file.md');
      const validResult = await safeFileWrite(validPath, 'test content');
      expect(validResult.success).toBe(true);

      // 유효하지 않은 경로
      const invalidPath = '/invalid/path/file.md';
      const invalidResult = await safeFileWrite(invalidPath, 'test content');
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeTruthy();
    });
  });
});
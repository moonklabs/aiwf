/**
 * AI 페르소나 시스템 통합 테스트
 */

import { testUtils, testFixtures } from './setup.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AI 페르소나 시스템 통합 테스트', () => {
  let testProjectDir;
  let aiPersonaDir;

  beforeEach(async () => {
    testProjectDir = await testUtils.createTempDir('ai-persona-');
    const aiwfDir = await testUtils.createTestProjectStructure(testProjectDir);
    aiPersonaDir = path.join(aiwfDir, '07_AI_PERSONAS');
  });

  afterEach(async () => {
    await testUtils.cleanupTempDir(testProjectDir);
  });

  describe('AI 페르소나 기본 기능 테스트', () => {
    test('AI 페르소나 생성 테스트', async () => {
      const persona = testFixtures.aiPersona;
      const personaFilePath = path.join(aiPersonaDir, `${persona.id}.md`);
      
      // AI 페르소나 파일 생성
      const content = `---
id: ${persona.id}
name: ${persona.name}
description: ${persona.description}
commands: ${persona.commands.join(', ')}
---

# AI 페르소나: ${persona.name}

## Description
${persona.description}

## Context
${persona.context}

## Available Commands
${persona.commands.map(cmd => `- ${cmd}`).join('\n')}
`;

      await fs.writeFile(personaFilePath, content);
      
      // 파일 생성 확인
      expect(await testUtils.fileExists(personaFilePath)).toBe(true);
      
      // 파일 내용 검증
      const parsedContent = await testUtils.parseMarkdownFile(personaFilePath);
      expect(parsedContent.metadata.id).toBe(persona.id);
      expect(parsedContent.metadata.name).toBe(persona.name);
      expect(parsedContent.metadata.description).toBe(persona.description);
    });

    test('AI 페르소나 디렉토리 구조 검증', async () => {
      expect(await testUtils.dirExists(aiPersonaDir)).toBe(true);
      
      // 페르소나 디렉토리 하위 구조 생성
      const subDirs = ['active', 'templates', 'custom'];
      for (const subDir of subDirs) {
        const subDirPath = path.join(aiPersonaDir, subDir);
        await fs.mkdir(subDirPath, { recursive: true });
        expect(await testUtils.dirExists(subDirPath)).toBe(true);
      }
    });
  });

  describe('페르소나 전환 시스템 테스트', () => {
    test('페르소나 활성화 테스트', async () => {
      const personas = [
        { id: 'architect', name: 'Software Architect', active: false },
        { id: 'security', name: 'Security Expert', active: false },
        { id: 'frontend', name: 'Frontend Developer', active: true },
        { id: 'backend', name: 'Backend Developer', active: false },
        { id: 'data', name: 'Data Analyst', active: false }
      ];

      // 페르소나 파일들 생성
      for (const persona of personas) {
        const personaFilePath = path.join(aiPersonaDir, `${persona.id}.md`);
        await fs.writeFile(personaFilePath, `---
id: ${persona.id}
name: ${persona.name}
active: ${persona.active}
---

# AI 페르소나: ${persona.name}
`);
      }

      // 활성 페르소나 찾기
      const files = await fs.readdir(aiPersonaDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      let activePersona = null;
      for (const file of mdFiles) {
        const filePath = path.join(aiPersonaDir, file);
        const parsedContent = await testUtils.parseMarkdownFile(filePath);
        if (parsedContent.metadata.active === 'true') {
          activePersona = parsedContent.metadata;
          break;
        }
      }

      expect(activePersona).toBeTruthy();
      expect(activePersona.id).toBe('frontend');
      expect(activePersona.name).toBe('Frontend Developer');
    });

    test('페르소나 전환 시뮬레이션', async () => {
      const personas = ['architect', 'security', 'frontend'];
      
      // 페르소나 파일들 생성
      for (const personaId of personas) {
        const personaFilePath = path.join(aiPersonaDir, `${personaId}.md`);
        await fs.writeFile(personaFilePath, `---
id: ${personaId}
name: ${personaId.charAt(0).toUpperCase() + personaId.slice(1)}
active: ${personaId === 'architect'}
---

# AI 페르소나: ${personaId}
`);
      }

      // 페르소나 전환 함수 시뮬레이션
      const switchPersona = async (fromPersonaId, toPersonaId) => {
        const fromPath = path.join(aiPersonaDir, `${fromPersonaId}.md`);
        const toPath = path.join(aiPersonaDir, `${toPersonaId}.md`);
        
        // 기존 페르소나 비활성화
        const fromContent = await fs.readFile(fromPath, 'utf8');
        const updatedFromContent = fromContent.replace('active: true', 'active: false');
        await fs.writeFile(fromPath, updatedFromContent);
        
        // 새 페르소나 활성화
        const toContent = await fs.readFile(toPath, 'utf8');
        const updatedToContent = toContent.replace('active: false', 'active: true');
        await fs.writeFile(toPath, updatedToContent);
      };

      // architect → security 전환
      await switchPersona('architect', 'security');
      
      // 전환 결과 검증
      const architectContent = await testUtils.parseMarkdownFile(
        path.join(aiPersonaDir, 'architect.md')
      );
      const securityContent = await testUtils.parseMarkdownFile(
        path.join(aiPersonaDir, 'security.md')
      );
      
      expect(architectContent.metadata.active).toBe('false');
      expect(securityContent.metadata.active).toBe('true');
    });
  });

  describe('페르소나 컨텍스트 로딩 테스트', () => {
    test('페르소나 컨텍스트 구조 검증', async () => {
      const persona = {
        id: 'architect',
        name: 'Software Architect',
        context: `You are an expert software architect with 15+ years of experience.
        
Key responsibilities:
- Design scalable system architectures
- Review and optimize code structure
- Ensure security best practices
- Mentor development teams

Focus areas:
- Microservices architecture
- Cloud-native solutions
- Performance optimization
- Security architecture`,
        commands: ['design', 'review', 'optimize', 'mentor']
      };

      const personaFilePath = path.join(aiPersonaDir, `${persona.id}.md`);
      await fs.writeFile(personaFilePath, `---
id: ${persona.id}
name: ${persona.name}
commands: ${persona.commands.join(', ')}
---

# AI 페르소나: ${persona.name}

## Context
${persona.context}

## Available Commands
${persona.commands.map(cmd => `- ${cmd}`).join('\n')}
`);

      const parsedContent = await testUtils.parseMarkdownFile(personaFilePath);
      
      expect(parsedContent.body).toContain('Key responsibilities:');
      expect(parsedContent.body).toContain('Focus areas:');
      expect(parsedContent.body).toContain('Available Commands');
      expect(parsedContent.metadata.commands).toContain('design');
      expect(parsedContent.metadata.commands).toContain('review');
    });

    test('페르소나 명령어 파싱 테스트', async () => {
      const persona = {
        id: 'security',
        name: 'Security Expert',
        commands: ['audit', 'scan', 'secure', 'validate']
      };

      const personaFilePath = path.join(aiPersonaDir, `${persona.id}.md`);
      await fs.writeFile(personaFilePath, `---
id: ${persona.id}
name: ${persona.name}
commands: ${persona.commands.join(', ')}
---

# AI 페르소나: ${persona.name}
`);

      const parsedContent = await testUtils.parseMarkdownFile(personaFilePath);
      const commands = parsedContent.metadata.commands.split(', ');
      
      expect(commands).toHaveLength(4);
      expect(commands).toContain('audit');
      expect(commands).toContain('scan');
      expect(commands).toContain('secure');
      expect(commands).toContain('validate');
    });
  });

  describe('페르소나 템플릿 시스템 테스트', () => {
    test('페르소나 템플릿 생성 테스트', async () => {
      const templateDir = path.join(aiPersonaDir, 'templates');
      await fs.mkdir(templateDir, { recursive: true });
      
      const template = {
        id: 'template_developer',
        name: 'Developer Template',
        description: 'Base template for developer personas',
        baseContext: 'You are an experienced software developer...',
        commonCommands: ['code', 'test', 'debug', 'deploy']
      };

      const templateFilePath = path.join(templateDir, `${template.id}.md`);
      await fs.writeFile(templateFilePath, `---
id: ${template.id}
name: ${template.name}
description: ${template.description}
type: template
commands: ${template.commonCommands.join(', ')}
---

# 페르소나 템플릿: ${template.name}

## Description
${template.description}

## Base Context
${template.baseContext}

## Common Commands
${template.commonCommands.map(cmd => `- ${cmd}`).join('\n')}
`);

      expect(await testUtils.fileExists(templateFilePath)).toBe(true);
      
      const parsedContent = await testUtils.parseMarkdownFile(templateFilePath);
      expect(parsedContent.metadata.type).toBe('template');
      expect(parsedContent.metadata.name).toBe(template.name);
    });

    test('템플릿 기반 페르소나 생성 시뮬레이션', async () => {
      const templateDir = path.join(aiPersonaDir, 'templates');
      await fs.mkdir(templateDir, { recursive: true });
      
      // 기본 템플릿 생성
      const baseTemplate = `---
id: base_template
name: Base Template
type: template
commands: help, info, status
---

# 기본 페르소나 템플릿

## Base Context
You are a helpful AI assistant specialized in software development.

## Common Commands
- help: Show available commands
- info: Display persona information
- status: Show current status
`;

      const templateFilePath = path.join(templateDir, 'base_template.md');
      await fs.writeFile(templateFilePath, baseTemplate);

      // 템플릿 기반 페르소나 생성 시뮬레이션
      const createPersonaFromTemplate = async (templateId, newPersonaId, customizations) => {
        const templatePath = path.join(templateDir, `${templateId}.md`);
        const templateContent = await fs.readFile(templatePath, 'utf8');
        
        // 템플릿 내용 수정
        let newContent = templateContent
          .replace(/id: .+/, `id: ${newPersonaId}`)
          .replace(/name: .+/, `name: ${customizations.name}`)
          .replace(/type: template/, `type: persona`)
          .replace(/You are a helpful AI assistant/, customizations.context || 'You are a helpful AI assistant');
        
        const newPersonaPath = path.join(aiPersonaDir, `${newPersonaId}.md`);
        await fs.writeFile(newPersonaPath, newContent);
      };

      // 새 페르소나 생성
      await createPersonaFromTemplate('base_template', 'custom_developer', {
        name: 'Custom Developer',
        context: 'You are a specialized full-stack developer'
      });

      // 생성된 페르소나 검증
      const personaPath = path.join(aiPersonaDir, 'custom_developer.md');
      expect(await testUtils.fileExists(personaPath)).toBe(true);
      
      const parsedContent = await testUtils.parseMarkdownFile(personaPath);
      expect(parsedContent.metadata.id).toBe('custom_developer');
      expect(parsedContent.metadata.name).toBe('Custom Developer');
      expect(parsedContent.metadata.type).toBe('persona');
    });
  });

  describe('페르소나 상태 관리 테스트', () => {
    test('페르소나 사용 히스토리 추적', async () => {
      const historyFilePath = path.join(aiPersonaDir, 'history.json');
      
      // 사용 히스토리 시뮬레이션
      const usageHistory = [
        { personaId: 'architect', timestamp: '2025-07-09T01:00:00Z', action: 'activated' },
        { personaId: 'architect', timestamp: '2025-07-09T01:30:00Z', action: 'command_executed', command: 'design' },
        { personaId: 'security', timestamp: '2025-07-09T02:00:00Z', action: 'activated' },
        { personaId: 'security', timestamp: '2025-07-09T02:15:00Z', action: 'command_executed', command: 'audit' }
      ];

      await fs.writeFile(historyFilePath, JSON.stringify(usageHistory, null, 2));
      
      const history = await testUtils.readJsonFile(historyFilePath);
      expect(history).toHaveLength(4);
      expect(history[0].personaId).toBe('architect');
      expect(history[0].action).toBe('activated');
      expect(history[2].personaId).toBe('security');
      expect(history[3].command).toBe('audit');
    });

    test('페르소나 성능 메트릭 추적', async () => {
      const metricsFilePath = path.join(aiPersonaDir, 'metrics.json');
      
      // 성능 메트릭 시뮬레이션
      const metrics = {
        architect: {
          totalActivations: 5,
          totalCommands: 15,
          avgSessionDuration: 45.2,
          popularCommands: ['design', 'review', 'optimize']
        },
        security: {
          totalActivations: 3,
          totalCommands: 8,
          avgSessionDuration: 32.1,
          popularCommands: ['audit', 'scan']
        }
      };

      await fs.writeFile(metricsFilePath, JSON.stringify(metrics, null, 2));
      
      const loadedMetrics = await testUtils.readJsonFile(metricsFilePath);
      expect(loadedMetrics.architect.totalActivations).toBe(5);
      expect(loadedMetrics.security.totalCommands).toBe(8);
      expect(loadedMetrics.architect.popularCommands).toContain('design');
    });
  });
});
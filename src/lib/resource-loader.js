/**
 * AIWF Resource Loader
 * 번들된 리소스와 사용자 디렉토리 리소스를 통합 관리
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 리소스 기본 경로
const BUNDLED_RESOURCES_PATH = path.join(__dirname, 'resources');
const USER_RESOURCES_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aiwf');

export class ResourceLoader {
  constructor(options = {}) {
    this.bundledPath = options.bundledPath || BUNDLED_RESOURCES_PATH;
    this.userPath = options.userPath || USER_RESOURCES_PATH;
    this.preferUserResources = options.preferUserResources ?? true;
  }

  /**
   * 리소스 파일 경로 해결
   * 사용자 디렉토리 우선, 없으면 번들된 리소스 사용
   */
  async resolvePath(resourceType, resourceName) {
    const paths = this.preferUserResources 
      ? [
          path.join(this.userPath, resourceType, resourceName),
          path.join(this.bundledPath, resourceType, resourceName)
        ]
      : [
          path.join(this.bundledPath, resourceType, resourceName),
          path.join(this.userPath, resourceType, resourceName)
        ];

    for (const resourcePath of paths) {
      if (existsSync(resourcePath)) {
        return resourcePath;
      }
    }

    throw new Error(`Resource not found: ${resourceType}/${resourceName}`);
  }

  /**
   * JSON 리소스 로드
   */
  async loadJSON(resourceType, resourceName) {
    const resourcePath = await this.resolvePath(resourceType, resourceName);
    const content = await fs.readFile(resourcePath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * 텍스트 리소스 로드
   */
  async loadText(resourceType, resourceName) {
    const resourcePath = await this.resolvePath(resourceType, resourceName);
    return await fs.readFile(resourcePath, 'utf8');
  }

  /**
   * 리소스 목록 가져오기
   */
  async listResources(resourceType, options = {}) {
    const resources = new Set();
    
    // 번들된 리소스 목록
    const bundledDir = path.join(this.bundledPath, resourceType);
    if (existsSync(bundledDir)) {
      const bundledFiles = await fs.readdir(bundledDir);
      bundledFiles.forEach(file => resources.add(file));
    }

    // 사용자 리소스 목록
    const userDir = path.join(this.userPath, resourceType);
    if (existsSync(userDir)) {
      const userFiles = await fs.readdir(userDir);
      userFiles.forEach(file => resources.add(file));
    }

    // 필터링
    let fileList = Array.from(resources);
    if (options.extension) {
      fileList = fileList.filter(file => file.endsWith(options.extension));
    }
    if (options.filter) {
      fileList = fileList.filter(options.filter);
    }

    return fileList.sort();
  }

  /**
   * 페르소나 로드
   */
  async loadPersona(personaName) {
    if (!personaName.endsWith('.json')) {
      personaName += '.json';
    }
    return await this.loadJSON('personas', personaName);
  }

  /**
   * 모든 페르소나 목록
   */
  async listPersonas() {
    const personas = await this.listResources('personas', {
      extension: '.json',
      filter: (file) => file !== 'persona-index.json' && file !== 'evaluation_criteria.json'
    });
    return personas.map(file => path.basename(file, '.json'));
  }

  /**
   * 템플릿 설정 로드
   */
  async loadTemplateConfig(templateName) {
    return await this.loadJSON('templates', path.join(templateName, 'config.json'));
  }

  /**
   * 템플릿 목록
   */
  async listTemplates() {
    const templates = [];
    const templateDir = path.join(this.bundledPath, 'templates');
    
    if (existsSync(templateDir)) {
      const entries = await fs.readdir(templateDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const configPath = path.join(templateDir, entry.name, 'config.json');
          if (existsSync(configPath)) {
            templates.push(entry.name);
          }
        }
      }
    }

    return templates;
  }

  /**
   * 템플릿 경로 가져오기
   */
  async getTemplatePath(templateName) {
    const templatePath = await this.resolvePath('templates', templateName);
    const configPath = path.join(templatePath, 'config.json');
    
    if (!existsSync(configPath)) {
      throw new Error(`Invalid template: ${templateName}`);
    }
    
    return path.join(templatePath, 'template');
  }

  /**
   * 명령어 모듈 로드
   */
  async loadCommand(commandName) {
    if (!commandName.endsWith('.js')) {
      commandName += '.js';
    }
    
    const commandPath = await this.resolvePath('commands', commandName);
    return await import(commandPath);
  }

  /**
   * 유틸리티 모듈 로드
   */
  async loadUtil(utilName) {
    if (!utilName.endsWith('.js')) {
      utilName += '.js';
    }
    
    const utilPath = await this.resolvePath('utils', utilName);
    return await import(utilPath);
  }

  /**
   * 사용자 리소스 디렉토리 초기화
   */
  async initUserDirectory() {
    const dirs = ['personas', 'templates', 'commands', 'utils', 'config'];
    
    for (const dir of dirs) {
      const dirPath = path.join(this.userPath, dir);
      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }

    // 기본 설정 파일 복사
    const configFiles = ['language.json', 'personas/current.json'];
    for (const configFile of configFiles) {
      const userFile = path.join(this.userPath, configFile);
      if (!existsSync(userFile)) {
        try {
          const bundledFile = path.join(this.bundledPath, configFile);
          if (existsSync(bundledFile)) {
            await fs.copyFile(bundledFile, userFile);
          }
        } catch (error) {
          // 기본 설정 파일이 없어도 계속 진행
        }
      }
    }
  }

  /**
   * 리소스 존재 여부 확인
   */
  async exists(resourceType, resourceName) {
    try {
      await this.resolvePath(resourceType, resourceName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 리소스 복사 (번들 -> 사용자 디렉토리)
   */
  async copyToUserDirectory(resourceType, resourceName) {
    const bundledPath = path.join(this.bundledPath, resourceType, resourceName);
    const userPath = path.join(this.userPath, resourceType, resourceName);
    
    if (!existsSync(bundledPath)) {
      throw new Error(`Bundled resource not found: ${resourceType}/${resourceName}`);
    }

    await fs.mkdir(path.dirname(userPath), { recursive: true });
    await fs.copyFile(bundledPath, userPath);
    
    return userPath;
  }
}

// 기본 인스턴스 export
export const defaultLoader = new ResourceLoader();

export default ResourceLoader;
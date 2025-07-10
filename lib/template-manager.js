#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * AIWF 템플릿 관리자
 * 프로젝트 템플릿의 생성, 캐싱, 검증을 담당
 */
export class TemplateManager {
  constructor() {
    this.templatesDir = path.resolve(__dirname, '../.aiwf/templates');
    this.cacheDir = path.resolve(__dirname, '../.aiwf/cache/templates');
    this.supportedTemplates = ['web-app', 'api-server', 'library'];
  }

  /**
   * 템플릿 목록 조회
   */
  async getAvailableTemplates() {
    const templates = [];
    
    for (const templateType of this.supportedTemplates) {
      const templatePath = path.join(this.templatesDir, templateType);
      const configPath = path.join(templatePath, 'template.json');
      
      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        templates.push({
          type: templateType,
          name: config.name,
          description: config.description,
          version: config.version,
          tech_stack: config.tech_stack,
          features: config.features
        });
      }
    }
    
    return templates;
  }

  /**
   * 템플릿 설정 로드
   */
  async getTemplateConfig(templateType) {
    const configPath = path.join(this.templatesDir, templateType, 'template.json');
    
    if (!await fs.pathExists(configPath)) {
      throw new Error(`Template config not found: ${templateType}`);
    }
    
    return await fs.readJson(configPath);
  }

  /**
   * 템플릿 검증
   */
  async validateTemplate(templateType) {
    const templatePath = path.join(this.templatesDir, templateType);
    const config = await this.getTemplateConfig(templateType);
    
    const issues = [];
    
    // 필수 파일 확인
    const requiredFiles = ['template.json', 'package.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(templatePath, file);
      if (!await fs.pathExists(filePath)) {
        issues.push(`Missing required file: ${file}`);
      }
    }
    
    // 디렉토리 구조 확인
    if (config.file_structure) {
      for (const [dir, description] of Object.entries(config.file_structure)) {
        const dirPath = path.join(templatePath, dir);
        if (!await fs.pathExists(dirPath)) {
          issues.push(`Missing directory: ${dir} (${description})`);
        }
      }
    }
    
    // AIWF 통합 확인
    const aiwfPath = path.join(templatePath, '.aiwf');
    if (!await fs.pathExists(aiwfPath)) {
      issues.push('Missing .aiwf directory for AIWF integration');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * 템플릿 캐시 생성 (오프라인 지원)
   */
  async cacheTemplate(templateType) {
    const templatePath = path.join(this.templatesDir, templateType);
    const cachePath = path.join(this.cacheDir, templateType);
    
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template not found: ${templateType}`);
    }
    
    // 캐시 디렉토리 생성
    await fs.ensureDir(cachePath);
    
    // 템플릿 전체 복사
    await fs.copy(templatePath, cachePath, {
      overwrite: true,
      filter: (src) => {
        // node_modules나 .git 등은 제외
        return !src.includes('node_modules') && !src.includes('.git');
      }
    });
    
    // 캐시 메타데이터 생성
    const cacheMetadata = {
      templateType,
      cachedAt: new Date().toISOString(),
      version: (await this.getTemplateConfig(templateType)).version,
      checksum: await this.calculateChecksum(templatePath)
    };
    
    await fs.writeJson(
      path.join(cachePath, '.cache-metadata.json'),
      cacheMetadata,
      { spaces: 2 }
    );
    
    return cachePath;
  }

  /**
   * 캐시된 템플릿 사용 (오프라인 모드)
   */
  async getCachedTemplate(templateType) {
    const cachePath = path.join(this.cacheDir, templateType);
    const metadataPath = path.join(cachePath, '.cache-metadata.json');
    
    if (!await fs.pathExists(cachePath) || !await fs.pathExists(metadataPath)) {
      return null;
    }
    
    const metadata = await fs.readJson(metadataPath);
    
    return {
      path: cachePath,
      metadata
    };
  }

  /**
   * 템플릿 체크섬 계산
   */
  async calculateChecksum(templatePath) {
    const crypto = await import('crypto');
    const hash = crypto.createHash('md5');
    
    const files = await this.getAllFiles(templatePath);
    files.sort(); // 일관된 순서 보장
    
    for (const file of files) {
      const content = await fs.readFile(file);
      hash.update(content);
    }
    
    return hash.digest('hex');
  }

  /**
   * 디렉토리의 모든 파일 경로 조회 (재귀)
   */
  async getAllFiles(dirPath, files = []) {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        // node_modules, .git 등 제외
        if (!['node_modules', '.git', '.cache'].includes(item)) {
          await this.getAllFiles(fullPath, files);
        }
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * 모든 템플릿 캐시 생성
   */
  async cacheAllTemplates() {
    const results = [];
    
    for (const templateType of this.supportedTemplates) {
      try {
        const cachePath = await this.cacheTemplate(templateType);
        results.push({
          templateType,
          success: true,
          cachePath
        });
      } catch (error) {
        results.push({
          templateType,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 캐시 정보 조회
   */
  async getCacheInfo() {
    const cacheInfo = {
      cacheDir: this.cacheDir,
      templates: []
    };
    
    for (const templateType of this.supportedTemplates) {
      const cached = await this.getCachedTemplate(templateType);
      
      cacheInfo.templates.push({
        type: templateType,
        cached: !!cached,
        metadata: cached?.metadata || null
      });
    }
    
    return cacheInfo;
  }

  /**
   * 캐시 정리
   */
  async clearCache() {
    if (await fs.pathExists(this.cacheDir)) {
      await fs.remove(this.cacheDir);
    }
    await fs.ensureDir(this.cacheDir);
  }

  /**
   * 오프라인 모드 감지
   */
  async isOfflineMode() {
    // 네트워크 연결 확인 (간단한 방법)
    try {
      const dns = await import('dns');
      await new Promise((resolve, reject) => {
        dns.lookup('google.com', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      return false; // 온라인
    } catch {
      return true; // 오프라인
    }
  }

  /**
   * 템플릿 소스 선택 (온라인/오프라인)
   */
  async getTemplateSource(templateType) {
    const isOffline = await this.isOfflineMode();
    
    if (isOffline) {
      console.log(chalk.yellow('🔄 오프라인 모드: 캐시된 템플릿을 사용합니다.'));
      
      const cached = await this.getCachedTemplate(templateType);
      if (!cached) {
        throw new Error(`오프라인 상태이며 캐시된 템플릿이 없습니다: ${templateType}`);
      }
      
      return cached.path;
    } else {
      // 온라인 상태: 최신 템플릿 사용
      const templatePath = path.join(this.templatesDir, templateType);
      
      if (!await fs.pathExists(templatePath)) {
        throw new Error(`템플릿을 찾을 수 없습니다: ${templateType}`);
      }
      
      // 백그라운드에서 캐시 업데이트
      this.cacheTemplate(templateType).catch(err => {
        console.warn(chalk.yellow(`캐시 업데이트 실패: ${err.message}`));
      });
      
      return templatePath;
    }
  }
}

export default TemplateManager;
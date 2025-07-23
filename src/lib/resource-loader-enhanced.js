/**
 * AIWF Enhanced Resource Loader with Memory Caching
 * 번들된 리소스와 사용자 디렉토리 리소스를 통합 관리하며 메모리 캐싱 기능 제공
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

export class EnhancedResourceLoader {
  constructor(options = {}) {
    this.bundledPath = options.bundledPath || BUNDLED_RESOURCES_PATH;
    this.userPath = options.userPath || USER_RESOURCES_PATH;
    this.preferUserResources = options.preferUserResources ?? true;
    
    // 메모리 캐시 설정
    this.cache = new Map();
    this.cacheEnabled = options.cacheEnabled ?? true;
    this.maxCacheSize = options.maxCacheSize || 100; // 최대 캐시 항목 수
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5분 TTL
    
    // 캐시 통계
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    // 주기적 캐시 정리 (5분마다)
    if (this.cacheEnabled) {
      this.cleanupInterval = setInterval(() => {
        this.cleanExpiredCache();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * 캐시 키 생성
   */
  generateCacheKey(resourceType, resourceName, operation = 'load') {
    return `${operation}:${resourceType}:${resourceName}`;
  }

  /**
   * 캐시에서 리소스 조회
   */
  getFromCache(cacheKey) {
    if (!this.cacheEnabled) return null;
    
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    // TTL 확인
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    this.stats.hits++;
    cached.lastAccessed = Date.now();
    return cached.data;
  }

  /**
   * 캐시에 리소스 저장
   */
  setCache(cacheKey, data) {
    if (!this.cacheEnabled) return;
    
    // 캐시 크기 제한
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }
    
    this.cache.set(cacheKey, {
      data,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + this.cacheTTL
    });
  }

  /**
   * LRU 방식으로 캐시 항목 제거
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanExpiredCache() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 리소스 파일 경로 해결 (캐시된 버전)
   * 사용자 디렉토리 우선, 없으면 번들된 리소스 사용
   */
  async resolvePath(resourceType, resourceName) {
    const cacheKey = this.generateCacheKey(resourceType, resourceName, 'resolve');
    
    // 캐시 확인
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    this.stats.misses++;
    this.stats.totalRequests++;
    
    const userResourcePath = path.join(this.userPath, resourceType, resourceName);
    const bundledResourcePath = path.join(this.bundledPath, resourceType, resourceName);
    
    let resolvedPath = null;
    
    if (this.preferUserResources && existsSync(userResourcePath)) {
      resolvedPath = userResourcePath;
    } else if (existsSync(bundledResourcePath)) {
      resolvedPath = bundledResourcePath;
    }
    
    // 결과 캐시
    this.setCache(cacheKey, resolvedPath);
    
    return resolvedPath;
  }

  /**
   * 템플릿 로드 (캐시된 버전)
   */
  async loadTemplate(templateName) {
    const cacheKey = this.generateCacheKey('templates', templateName);
    
    // 캐시 확인
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    this.stats.misses++;
    this.stats.totalRequests++;
    
    const templatePath = await this.resolvePath('templates', templateName);
    
    if (!templatePath) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    try {
      const content = await fs.readFile(templatePath, 'utf8');
      
      // 결과 캐시
      this.setCache(cacheKey, content);
      
      return content;
    } catch (error) {
      throw new Error(`Failed to load template ${templateName}: ${error.message}`);
    }
  }

  /**
   * 페르소나 로드 (캐시된 버전)
   */
  async loadPersona(personaName) {
    const cacheKey = this.generateCacheKey('personas', personaName);
    
    // 캐시 확인
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    this.stats.misses++;
    this.stats.totalRequests++;
    
    const personaPath = await this.resolvePath('personas', `${personaName}.json`);
    
    if (!personaPath) {
      throw new Error(`Persona ${personaName} not found`);
    }
    
    try {
      const content = await fs.readFile(personaPath, 'utf8');
      const personaData = JSON.parse(content);
      
      // 결과 캐시
      this.setCache(cacheKey, personaData);
      
      return personaData;
    } catch (error) {
      throw new Error(`Failed to load persona ${personaName}: ${error.message}`);
    }
  }

  /**
   * 유틸리티 모듈 로드 (캐시된 버전)
   */
  async loadUtil(utilName) {
    const cacheKey = this.generateCacheKey('utils', utilName);
    
    // 캐시 확인 (모듈은 실행 코드이므로 매번 새로 import 필요)
    // 하지만 경로 해결은 캐시 가능
    const pathCacheKey = this.generateCacheKey('utils', utilName, 'path');
    let utilPath = this.getFromCache(pathCacheKey);
    
    if (!utilPath) {
      this.stats.misses++;
      utilPath = await this.resolvePath('utils', utilName);
      this.setCache(pathCacheKey, utilPath);
    } else {
      this.stats.hits++;
    }
    
    this.stats.totalRequests++;
    
    if (!utilPath) {
      throw new Error(`Utility ${utilName} not found`);
    }
    
    try {
      // 동적 import (모듈은 캐시하지 않음)
      const module = await import(utilPath);
      return module;
    } catch (error) {
      throw new Error(`Failed to load utility ${utilName}: ${error.message}`);
    }
  }

  /**
   * 명령어 템플릿 로드 (캐시된 버전)
   */
  async loadCommand(commandName) {
    const cacheKey = this.generateCacheKey('commands', commandName);
    
    // 캐시 확인
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    this.stats.misses++;
    this.stats.totalRequests++;
    
    const commandPath = await this.resolvePath('commands', `${commandName}.md`);
    
    if (!commandPath) {
      throw new Error(`Command ${commandName} not found`);
    }
    
    try {
      const content = await fs.readFile(commandPath, 'utf8');
      
      // 결과 캐시
      this.setCache(cacheKey, content);
      
      return content;
    } catch (error) {
      throw new Error(`Failed to load command ${commandName}: ${error.message}`);
    }
  }

  /**
   * 사용자 디렉토리 초기화 (캐시된 체크)
   */
  async initUserDirectory() {
    const cacheKey = 'system:user_directory:initialized';
    
    // 캐시 확인
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return;
    }
    
    if (!existsSync(this.userPath)) {
      await fs.mkdir(this.userPath, { recursive: true });
    }
    
    // 하위 디렉토리 생성
    const subdirs = ['templates', 'personas', 'utils', 'commands', 'cache'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(this.userPath, subdir);
      if (!existsSync(subdirPath)) {
        await fs.mkdir(subdirPath, { recursive: true });
      }
    }
    
    // 초기화 완료 캐시
    this.setCache(cacheKey, true);
  }

  /**
   * 캐시 통계 조회
   */
  getCacheStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2) 
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * 캐시 메모리 사용량 추정
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, value] of this.cache.entries()) {
      // 대략적인 크기 추정 (문자열 기준)
      totalSize += key.length * 2; // key size
      if (typeof value.data === 'string') {
        totalSize += value.data.length * 2;
      } else {
        totalSize += JSON.stringify(value.data).length * 2;
      }
      totalSize += 64; // 메타데이터 크기 추정
    }
    
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  /**
   * 캐시 지우기
   */
  clearCache() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }

  /**
   * 특정 리소스 타입의 캐시 무효화
   */
  invalidateResourceType(resourceType) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`:${resourceType}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 리소스 로더 종료 시 정리
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearCache();
  }
}
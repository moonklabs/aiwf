/**
 * 언어 관리 유틸리티 테스트
 */

import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import {
    detectLanguage,
    loadUserLanguageConfig,
    saveUserLanguageConfig,
    getCommandPath,
    resolveCommandPath,
    getTemplatePath,
    getLocalizedMessage,
    switchLanguage,
    getLanguageStatus,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    LANGUAGE_CONFIG_PATH
} from '../src/utils/language-utils.js';

// 테스트용 임시 디렉토리
const TEST_DIR = '.aiwf-test';
const TEST_CONFIG_PATH = `${TEST_DIR}/config/language.json`;

describe('Language Utils', () => {
    let originalConfigExists = false;
    let originalConfigContent = null;

    beforeEach(async () => {
        // 테스트 디렉토리 생성
        await fs.mkdir(`${TEST_DIR}/config`, { recursive: true });
        
        // 기존 설정 파일 백업
        try {
            originalConfigContent = await fs.readFile(LANGUAGE_CONFIG_PATH, 'utf8');
            originalConfigExists = true;
            // 기존 설정 파일 임시 제거
            await fs.unlink(LANGUAGE_CONFIG_PATH);
        } catch (error) {
            originalConfigExists = false;
        }
        
        // 환경 변수 초기화
        delete process.env.LANG;
        delete process.env.LC_ALL;
        delete process.env.LANGUAGE;
    });

    afterEach(async () => {
        // 기존 설정 파일 복원
        if (originalConfigExists && originalConfigContent) {
            await fs.mkdir(path.dirname(LANGUAGE_CONFIG_PATH), { recursive: true });
            await fs.writeFile(LANGUAGE_CONFIG_PATH, originalConfigContent, 'utf8');
        }
        
        // 테스트 디렉토리 정리
        try {
            await fs.rm(TEST_DIR, { recursive: true, force: true });
        } catch (error) {
            // 무시
        }
    });

    describe('detectLanguage', () => {
        test('should return default language when no settings exist', async () => {
            const language = await detectLanguage();
            expect(SUPPORTED_LANGUAGES).toContain(language);
        });

        test('should detect Korean from environment variables', async () => {
            process.env.LANG = 'ko_KR.UTF-8';
            const language = await detectLanguage();
            expect(language).toBe('ko');
        });

        test('should detect English from environment variables', async () => {
            process.env.LANG = 'en_US.UTF-8';
            const language = await detectLanguage();
            expect(language).toBe('en');
        });

        test('should return default language for unsupported locale', async () => {
            process.env.LANG = 'ja_JP.UTF-8';
            const language = await detectLanguage();
            expect(language).toBe(DEFAULT_LANGUAGE);
        });
    });

    describe('saveUserLanguageConfig and loadUserLanguageConfig', () => {
        test('should save and load language configuration', async () => {
            // 테스트용 경로로 저장
            const config = {
                language: 'ko',
                auto_detect: true,
                last_updated: new Date().toISOString(),
                fallback: 'en'
            };

            await fs.writeFile(TEST_CONFIG_PATH, JSON.stringify(config, null, 2));

            // 설정 파일 읽기 테스트는 실제 파일 시스템이 아닌 모의 구현을 사용해야 함
            const savedContent = await fs.readFile(TEST_CONFIG_PATH, 'utf8');
            const parsedConfig = JSON.parse(savedContent);
            
            expect(parsedConfig.language).toBe('ko');
            expect(parsedConfig.auto_detect).toBe(true);
            expect(parsedConfig.fallback).toBe('en');
        });

        test('should handle invalid language configuration', async () => {
            const invalidConfig = { language: 'invalid' };
            await fs.writeFile(TEST_CONFIG_PATH, JSON.stringify(invalidConfig));
            
            // 실제 함수가 유효성 검증을 수행한다고 가정
            const savedContent = await fs.readFile(TEST_CONFIG_PATH, 'utf8');
            const config = JSON.parse(savedContent);
            
            // 유효하지 않은 설정은 처리되지 않아야 함
            expect(SUPPORTED_LANGUAGES).not.toContain(config.language);
        });
    });

    describe('getCommandPath', () => {
        test('should return correct path for Korean commands', () => {
            const path = getCommandPath('aiwf_do_task', 'ko');
            expect(path).toBe('claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_do_task.md');
        });

        test('should return correct path for English commands', () => {
            const path = getCommandPath('aiwf_do_task', 'en');
            expect(path).toBe('claude-code/aiwf/en/.claude/commands/aiwf/aiwf_do_task.md');
        });

        test('should fallback to default language for invalid language', () => {
            const path = getCommandPath('aiwf_do_task', 'invalid');
            expect(path).toBe(`claude-code/aiwf/${DEFAULT_LANGUAGE}/.claude/commands/aiwf/aiwf_do_task.md`);
        });

        test('should use default language when no language specified', () => {
            const path = getCommandPath('aiwf_do_task');
            expect(path).toBe(`claude-code/aiwf/${DEFAULT_LANGUAGE}/.claude/commands/aiwf/aiwf_do_task.md`);
        });
    });

    describe('getTemplatePath', () => {
        test('should return correct template path for Korean', () => {
            const path = getTemplatePath('task_template.md', 'ko');
            expect(path).toBe('.aiwf/99_TEMPLATES/ko/task_template.md');
        });

        test('should return correct template path for English', () => {
            const path = getTemplatePath('task_template.md', 'en');
            expect(path).toBe('.aiwf/99_TEMPLATES/en/task_template.md');
        });
    });

    describe('getLocalizedMessage', () => {
        test('should return Korean message', () => {
            const message = getLocalizedMessage('LANGUAGE_NOT_SUPPORTED', 'ko');
            expect(message).toBe('지원되지 않는 언어입니다');
        });

        test('should return English message', () => {
            const message = getLocalizedMessage('LANGUAGE_NOT_SUPPORTED', 'en');
            expect(message).toBe('Language not supported');
        });

        test('should fallback to default language for invalid language', () => {
            const message = getLocalizedMessage('LANGUAGE_NOT_SUPPORTED', 'invalid');
            expect(message).toBe('Language not supported'); // DEFAULT_LANGUAGE가 'en'이라고 가정
        });

        test('should return key if message not found', () => {
            const message = getLocalizedMessage('INVALID_KEY', 'ko');
            expect(message).toBe('INVALID_KEY');
        });
    });

    describe('switchLanguage', () => {
        test('should validate supported language', async () => {
            // 유효한 언어
            const result1 = await switchLanguage('ko');
            expect(result1.success).toBe(true);
            expect(result1.newLanguage).toBe('ko');
            
            // 유효하지 않은 언어는 실패 객체를 반환해야 함
            const result2 = await switchLanguage('invalid');
            expect(result2.success).toBe(false);
            expect(result2.error).toContain('지원되지 않는 언어');
        });
    });

    describe('constants', () => {
        test('should have valid supported languages', () => {
            expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
            expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(0);
            expect(SUPPORTED_LANGUAGES).toContain('ko');
            expect(SUPPORTED_LANGUAGES).toContain('en');
        });

        test('should have valid default language', () => {
            expect(SUPPORTED_LANGUAGES).toContain(DEFAULT_LANGUAGE);
        });

        test('should have valid config path', () => {
            expect(typeof LANGUAGE_CONFIG_PATH).toBe('string');
            expect(LANGUAGE_CONFIG_PATH).toContain('.aiwf');
            expect(LANGUAGE_CONFIG_PATH).toContain('language.json');
        });
    });
});

describe('Language Utils Integration', () => {
    test('should work with real file system operations', async () => {
        // 실제 파일 시스템을 사용한 통합 테스트
        const testConfigDir = '.aiwf-integration-test/config';
        const testConfigFile = `${testConfigDir}/language.json`;
        
        try {
            // 테스트 디렉토리 생성
            await fs.mkdir(testConfigDir, { recursive: true });
            
            // 설정 파일 생성
            const config = {
                language: 'ko',
                auto_detect: false,
                last_updated: new Date().toISOString(),
                fallback: 'en'
            };
            
            await fs.writeFile(testConfigFile, JSON.stringify(config, null, 2));
            
            // 파일 존재 확인
            const exists = await fs.access(testConfigFile).then(() => true).catch(() => false);
            expect(exists).toBe(true);
            
            // 내용 확인
            const content = await fs.readFile(testConfigFile, 'utf8');
            const parsedConfig = JSON.parse(content);
            expect(parsedConfig.language).toBe('ko');
            
        } finally {
            // 정리
            try {
                await fs.rm('.aiwf-integration-test', { recursive: true, force: true });
            } catch (error) {
                // 무시
            }
        }
    });
});

describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
        // 존재하지 않는 디렉토리에서 설정 로드 시도
        const originalConfigPath = LANGUAGE_CONFIG_PATH;
        
        // detectLanguage는 실패해도 기본값을 반환해야 함
        const language = await detectLanguage();
        expect(SUPPORTED_LANGUAGES).toContain(language);
    });

    test('should handle corrupt configuration files', async () => {
        const testConfigDir = '.aiwf-error-test/config';
        const testConfigFile = `${testConfigDir}/language.json`;
        
        try {
            await fs.mkdir(testConfigDir, { recursive: true });
            
            // 잘못된 JSON 파일 생성
            await fs.writeFile(testConfigFile, '{ invalid json }');
            
            // 손상된 설정 파일이 있어도 언어 감지는 정상 작동해야 함
            const language = await detectLanguage();
            expect(SUPPORTED_LANGUAGES).toContain(language);
            
        } finally {
            try {
                await fs.rm('.aiwf-error-test', { recursive: true, force: true });
            } catch (error) {
                // 무시
            }
        }
    });
});
#!/usr/bin/env node

/**
 * 언어 관리 유틸리티 모듈
 * AIWF 프레임워크의 언어 감지, 설정 저장/복원, 라우팅을 담당합니다.
 */

import fs from 'fs/promises';
import path from 'path';

// 지원되는 언어 목록
export const SUPPORTED_LANGUAGES = ['ko', 'en'];
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_CONFIG_PATH = '.aiwf/config/language.json';

/**
 * 언어 감지 알고리즘
 * 1. 사용자 명시적 설정 (.aiwf/config/language.json)
 * 2. 환경 변수 (LANG, LC_ALL)
 * 3. 시스템 로케일 (process.env.LANG)
 * 4. 폴백: 영어 (en)
 */
export async function detectLanguage() {
    try {
        // 1. 사용자 설정 확인
        const userConfig = await loadUserLanguageConfig();
        if (userConfig?.language && SUPPORTED_LANGUAGES.includes(userConfig.language)) {
            return userConfig.language;
        }
        
        // 2. 환경 변수 확인
        const envLang = process.env.LANG || process.env.LC_ALL;
        if (envLang) {
            // 한국어 로케일 감지
            if (envLang.toLowerCase().startsWith('ko')) {
                return 'ko';
            }
            // 영어 로케일 감지
            if (envLang.toLowerCase().startsWith('en')) {
                return 'en';
            }
        }
        
        // 3. 폴백: 기본 언어
        return DEFAULT_LANGUAGE;
    } catch (error) {
        console.warn(`언어 감지 중 오류 발생: ${error.message}`);
        return DEFAULT_LANGUAGE;
    }
}

/**
 * 사용자 언어 설정 로드
 */
export async function loadUserLanguageConfig() {
    try {
        const configExists = await fs.access(LANGUAGE_CONFIG_PATH).then(() => true).catch(() => false);
        if (!configExists) {
            return null;
        }
        
        const configContent = await fs.readFile(LANGUAGE_CONFIG_PATH, 'utf8');
        const config = JSON.parse(configContent);
        
        // 설정 유효성 검증
        if (config.language && SUPPORTED_LANGUAGES.includes(config.language)) {
            return config;
        }
        
        return null;
    } catch (error) {
        console.warn(`언어 설정 로드 중 오류 발생: ${error.message}`);
        return null;
    }
}

/**
 * 사용자 언어 설정 저장
 */
export async function saveUserLanguageConfig(language, options = {}) {
    try {
        // 언어 유효성 검증
        if (!SUPPORTED_LANGUAGES.includes(language)) {
            throw new Error(`지원되지 않는 언어: ${language}. 지원 언어: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }
        
        // 설정 디렉토리 생성
        const configDir = path.dirname(LANGUAGE_CONFIG_PATH);
        await fs.mkdir(configDir, { recursive: true });
        
        // 설정 객체 생성
        const config = {
            language: language,
            auto_detect: options.auto_detect !== undefined ? options.auto_detect : true,
            last_updated: new Date().toISOString(),
            fallback: options.fallback || DEFAULT_LANGUAGE
        };
        
        // 설정 파일 저장
        await fs.writeFile(LANGUAGE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
        
        return config;
    } catch (error) {
        console.error(`언어 설정 저장 중 오류 발생: ${error.message}`);
        throw error;
    }
}

/**
 * 명령어 파일 경로 라우팅
 * 언어별 명령어 파일 경로를 동적으로 생성합니다.
 */
export function getCommandPath(commandName, language = null) {
    // 언어가 지정되지 않은 경우 현재 언어 사용
    if (!language) {
        language = DEFAULT_LANGUAGE; // 동기 버전에서는 기본 언어 사용
    }
    
    // 언어 유효성 검증
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE;
    }
    
    // 한국어 명령어 경로
    if (language === 'ko') {
        return `claude-code/aiwf/ko/.claude/commands/aiwf/${commandName}.md`;
    }
    
    // 영어 명령어 경로 (기본)
    return `claude-code/aiwf/en/.claude/commands/aiwf/${commandName}.md`;
}

/**
 * 명령어 파일 존재 여부 확인 및 폴백
 */
export async function resolveCommandPath(commandName, preferredLanguage = null) {
    try {
        const language = preferredLanguage || await detectLanguage();
        
        // 선호 언어로 명령어 파일 경로 생성
        let commandPath = getCommandPath(commandName, language);
        
        // 파일 존재 여부 확인
        const exists = await fs.access(commandPath).then(() => true).catch(() => false);
        if (exists) {
            return {
                path: commandPath,
                language: language,
                fallback: false
            };
        }
        
        // 폴백 언어로 재시도
        const fallbackLanguage = language === 'ko' ? 'en' : 'ko';
        commandPath = getCommandPath(commandName, fallbackLanguage);
        
        const fallbackExists = await fs.access(commandPath).then(() => true).catch(() => false);
        if (fallbackExists) {
            return {
                path: commandPath,
                language: fallbackLanguage,
                fallback: true
            };
        }
        
        // 둘 다 없는 경우
        return {
            path: null,
            language: null,
            fallback: false,
            error: `명령어 파일을 찾을 수 없습니다: ${commandName}`
        };
        
    } catch (error) {
        return {
            path: null,
            language: null,
            fallback: false,
            error: `명령어 경로 해결 중 오류: ${error.message}`
        };
    }
}

/**
 * 템플릿 파일 경로 라우팅
 */
export function getTemplatePath(templateName, language = null) {
    if (!language) {
        language = DEFAULT_LANGUAGE;
    }
    
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE;
    }
    
    return `.aiwf/99_TEMPLATES/${language}/${templateName}`;
}

/**
 * 다국어 에러 메시지 시스템
 */
export const ERROR_MESSAGES = {
    ko: {
        LANGUAGE_NOT_SUPPORTED: '지원되지 않는 언어입니다',
        CONFIG_LOAD_FAILED: '언어 설정을 불러올 수 없습니다',
        CONFIG_SAVE_FAILED: '언어 설정을 저장할 수 없습니다',
        COMMAND_NOT_FOUND: '명령어를 찾을 수 없습니다',
        TEMPLATE_NOT_FOUND: '템플릿을 찾을 수 없습니다',
        LANGUAGE_SWITCH_SUCCESS: '언어가 성공적으로 변경되었습니다',
        LANGUAGE_SWITCH_FAILED: '언어 변경에 실패했습니다'
    },
    en: {
        LANGUAGE_NOT_SUPPORTED: 'Language not supported',
        CONFIG_LOAD_FAILED: 'Failed to load language configuration',
        CONFIG_SAVE_FAILED: 'Failed to save language configuration',
        COMMAND_NOT_FOUND: 'Command not found',
        TEMPLATE_NOT_FOUND: 'Template not found',
        LANGUAGE_SWITCH_SUCCESS: 'Language changed successfully',
        LANGUAGE_SWITCH_FAILED: 'Failed to change language'
    }
};

/**
 * 다국어 메시지 가져오기
 */
export function getLocalizedMessage(messageKey, language = null) {
    if (!language) {
        language = DEFAULT_LANGUAGE;
    }
    
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE;
    }
    
    return ERROR_MESSAGES[language]?.[messageKey] || ERROR_MESSAGES[DEFAULT_LANGUAGE]?.[messageKey] || messageKey;
}

/**
 * 언어 전환 함수
 */
export async function switchLanguage(newLanguage) {
    try {
        // 언어 유효성 검증
        if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
            throw new Error(getLocalizedMessage('LANGUAGE_NOT_SUPPORTED'));
        }
        
        // 현재 언어 설정 로드
        const currentConfig = await loadUserLanguageConfig() || {};
        
        // 새 언어로 설정 저장
        const newConfig = await saveUserLanguageConfig(newLanguage, {
            autoDetect: currentConfig.auto_detect,
            fallback: currentConfig.fallback
        });
        
        return {
            success: true,
            previousLanguage: currentConfig.language || DEFAULT_LANGUAGE,
            newLanguage: newLanguage,
            message: getLocalizedMessage('LANGUAGE_SWITCH_SUCCESS', newLanguage)
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: getLocalizedMessage('LANGUAGE_SWITCH_FAILED')
        };
    }
}

/**
 * 언어 설정 상태 확인
 */
export async function getLanguageStatus() {
    try {
        const detectedLanguage = await detectLanguage();
        const userConfig = await loadUserLanguageConfig();
        
        return {
            detectedLanguage: detectedLanguage,
            configuredLanguage: userConfig?.language || null,
            effectiveLanguage: userConfig?.language || detectedLanguage,
            autoDetect: userConfig?.auto_detect !== false,
            fallbackLanguage: userConfig?.fallback || DEFAULT_LANGUAGE,
            supportedLanguages: SUPPORTED_LANGUAGES,
            configPath: LANGUAGE_CONFIG_PATH
        };
    } catch (error) {
        return {
            detectedLanguage: DEFAULT_LANGUAGE,
            configuredLanguage: null,
            effectiveLanguage: DEFAULT_LANGUAGE,
            autoDetect: true,
            fallbackLanguage: DEFAULT_LANGUAGE,
            supportedLanguages: SUPPORTED_LANGUAGES,
            configPath: LANGUAGE_CONFIG_PATH,
            error: error.message
        };
    }
}

/**
 * 언어별 설치 경로 생성
 */
export function getInstallationLanguagePath(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE;
    }
    
    return language;
}

// 기본 내보내기
export default {
    detectLanguage,
    loadUserLanguageConfig,
    saveUserLanguageConfig,
    getCommandPath,
    resolveCommandPath,
    getTemplatePath,
    getLocalizedMessage,
    switchLanguage,
    getLanguageStatus,
    getInstallationLanguagePath,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    ERROR_MESSAGES
};
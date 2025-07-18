#!/usr/bin/env node

/**
 * 언어 관리 CLI 명령어
 * AIWF 프레임워크의 언어 설정을 관리하는 CLI 도구입니다.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import {
    detectLanguage,
    loadUserLanguageConfig,
    saveUserLanguageConfig,
    switchLanguage,
    getLanguageStatus,
    getLocalizedMessage,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../utils/language-utils.js';

const program = new Command();

// 다국어 CLI 메시지
const CLI_MESSAGES = {
    ko: {
        LANGUAGE_STATUS_TITLE: '🌐 AIWF 언어 설정 상태',
        DETECTED_LANGUAGE: '감지된 언어',
        CONFIGURED_LANGUAGE: '설정된 언어',
        EFFECTIVE_LANGUAGE: '사용 중인 언어',
        AUTO_DETECT: '자동 감지',
        FALLBACK_LANGUAGE: '폴백 언어',
        SUPPORTED_LANGUAGES: '지원 언어',
        CONFIG_PATH: '설정 파일 경로',
        ENABLED: '활성화',
        DISABLED: '비활성화',
        NOT_SET: '설정되지 않음',
        SELECT_LANGUAGE: '사용할 언어를 선택하세요:',
        ENABLE_AUTO_DETECT: '자동 언어 감지를 활성화하시겠습니까?',
        LANGUAGE_CHANGED: '언어가 성공적으로 변경되었습니다',
        OPERATION_CANCELLED: '작업이 취소되었습니다',
        CURRENT_LANGUAGE: '현재 언어',
        PREVIOUS_LANGUAGE: '이전 언어',
        NEW_LANGUAGE: '새 언어'
    },
    en: {
        LANGUAGE_STATUS_TITLE: '🌐 AIWF Language Configuration Status',
        DETECTED_LANGUAGE: 'Detected Language',
        CONFIGURED_LANGUAGE: 'Configured Language',
        EFFECTIVE_LANGUAGE: 'Effective Language',
        AUTO_DETECT: 'Auto Detection',
        FALLBACK_LANGUAGE: 'Fallback Language',
        SUPPORTED_LANGUAGES: 'Supported Languages',
        CONFIG_PATH: 'Configuration Path',
        ENABLED: 'Enabled',
        DISABLED: 'Disabled',
        NOT_SET: 'Not Set',
        SELECT_LANGUAGE: 'Select language to use:',
        ENABLE_AUTO_DETECT: 'Enable automatic language detection?',
        LANGUAGE_CHANGED: 'Language changed successfully',
        OPERATION_CANCELLED: 'Operation cancelled',
        CURRENT_LANGUAGE: 'Current Language',
        PREVIOUS_LANGUAGE: 'Previous Language',
        NEW_LANGUAGE: 'New Language'
    }
};

/**
 * 로컬라이즈된 CLI 메시지 가져오기
 */
function getCliMessage(key, language = DEFAULT_LANGUAGE) {
    return CLI_MESSAGES[language]?.[key] || CLI_MESSAGES[DEFAULT_LANGUAGE]?.[key] || key;
}

/**
 * 언어 설정 상태 표시
 */
export async function showLanguageStatus() {
    try {
        const status = await getLanguageStatus();
        const currentLang = status.effectiveLanguage;
        
        console.log(chalk.blue.bold(`\n${getCliMessage('LANGUAGE_STATUS_TITLE', currentLang)}`));
        console.log(chalk.gray('─'.repeat(50)));
        
        console.log(chalk.white(`${getCliMessage('DETECTED_LANGUAGE', currentLang)}: `) + 
                   chalk.green(status.detectedLanguage));
        
        console.log(chalk.white(`${getCliMessage('CONFIGURED_LANGUAGE', currentLang)}: `) + 
                   (status.configuredLanguage ? chalk.green(status.configuredLanguage) : 
                    chalk.gray(getCliMessage('NOT_SET', currentLang))));
        
        console.log(chalk.white(`${getCliMessage('EFFECTIVE_LANGUAGE', currentLang)}: `) + 
                   chalk.cyan.bold(status.effectiveLanguage));
        
        console.log(chalk.white(`${getCliMessage('AUTO_DETECT', currentLang)}: `) + 
                   (status.autoDetect ? 
                    chalk.green(getCliMessage('ENABLED', currentLang)) : 
                    chalk.yellow(getCliMessage('DISABLED', currentLang))));
        
        console.log(chalk.white(`${getCliMessage('FALLBACK_LANGUAGE', currentLang)}: `) + 
                   chalk.gray(status.fallbackLanguage));
        
        console.log(chalk.white(`${getCliMessage('SUPPORTED_LANGUAGES', currentLang)}: `) + 
                   chalk.gray(status.supportedLanguages.join(', ')));
        
        console.log(chalk.white(`${getCliMessage('CONFIG_PATH', currentLang)}: `) + 
                   chalk.gray(status.configPath));
        
        if (status.error) {
            console.log(chalk.red('\n⚠️  Error: ' + status.error));
        }
        
        console.log(chalk.gray('─'.repeat(50)));
        
    } catch (error) {
        console.error(chalk.red('Error showing language status:', error.message));
    }
}

/**
 * 언어 설정 변경
 */
export async function setLanguage(language = null, options = {}) {
    try {
        let targetLanguage = language;
        let autoDetect = options.autoDetect;
        
        // 언어가 지정되지 않은 경우 사용자에게 선택 요청
        if (!targetLanguage) {
            const currentStatus = await getLanguageStatus();
            const currentLang = currentStatus.effectiveLanguage;
            
            const languageResponse = await prompts({
                type: 'select',
                name: 'language',
                message: getCliMessage('SELECT_LANGUAGE', currentLang),
                choices: SUPPORTED_LANGUAGES.map(lang => ({
                    title: lang === 'ko' ? '한국어 (Korean)' : 'English',
                    value: lang
                }))
            });
            
            if (!languageResponse.language) {
                console.log(chalk.yellow(getCliMessage('OPERATION_CANCELLED', currentLang)));
                return;
            }
            
            targetLanguage = languageResponse.language;
            
            // 자동 감지 설정이 지정되지 않은 경우 사용자에게 묻기
            if (autoDetect === undefined) {
                const autoDetectResponse = await prompts({
                    type: 'confirm',
                    name: 'autoDetect',
                    message: getCliMessage('ENABLE_AUTO_DETECT', targetLanguage),
                    initial: true
                });
                
                autoDetect = autoDetectResponse.autoDetect;
            }
        }
        
        // 언어 전환 실행
        const result = await switchLanguage(targetLanguage);
        
        if (result.success) {
            console.log(chalk.green(`\n✅ ${getCliMessage('LANGUAGE_CHANGED', targetLanguage)}`));
            console.log(chalk.gray(`   ${getCliMessage('PREVIOUS_LANGUAGE', targetLanguage)}: ${result.previousLanguage}`));
            console.log(chalk.gray(`   ${getCliMessage('NEW_LANGUAGE', targetLanguage)}: ${result.newLanguage}`));
            
            // 자동 감지 설정 업데이트
            if (autoDetect !== undefined) {
                await saveUserLanguageConfig(targetLanguage, { autoDetect });
                console.log(chalk.gray(`   ${getCliMessage('AUTO_DETECT', targetLanguage)}: ${autoDetect ? getCliMessage('ENABLED', targetLanguage) : getCliMessage('DISABLED', targetLanguage)}`));
            }
            
        } else {
            console.error(chalk.red('\n❌ ' + result.message));
            if (result.error) {
                console.error(chalk.gray('   Error: ' + result.error));
            }
        }
        
    } catch (error) {
        console.error(chalk.red('Error setting language:', error.message));
    }
}

/**
 * 언어 설정 초기화
 */
export async function resetLanguage() {
    try {
        const currentStatus = await getLanguageStatus();
        const currentLang = currentStatus.effectiveLanguage;
        
        const confirmResponse = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: currentLang === 'ko' ? 
                     '언어 설정을 초기화하시겠습니까? (자동 감지 모드로 돌아갑니다)' :
                     'Reset language configuration? (Will return to auto-detection mode)',
            initial: false
        });
        
        if (!confirmResponse.confirm) {
            console.log(chalk.yellow(getCliMessage('OPERATION_CANCELLED', currentLang)));
            return;
        }
        
        // 설정 파일 삭제 (자동 감지 모드로 복원)
        const fs = await import('fs/promises');
        const { LANGUAGE_CONFIG_PATH } = await import('./language-utils.js');
        
        try {
            await fs.unlink(LANGUAGE_CONFIG_PATH);
            console.log(chalk.green('\n✅ ' + (currentLang === 'ko' ? 
                '언어 설정이 초기화되었습니다' : 
                'Language configuration reset successfully')));
            console.log(chalk.gray('   ' + (currentLang === 'ko' ? 
                '이제 시스템 언어가 자동으로 감지됩니다' :
                'System language will now be automatically detected')));
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(chalk.yellow('\n⚠️  ' + (currentLang === 'ko' ? 
                    '설정 파일이 존재하지 않습니다' :
                    'Configuration file does not exist')));
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.error(chalk.red('Error resetting language configuration:', error.message));
    }
}

// CLI 명령어 정의
program
    .name('aiwf-lang')
    .description('AIWF Language Management CLI / AIWF 언어 관리 CLI')
    .version('1.0.0');

program
    .command('status')
    .alias('s')
    .description('Show current language configuration / 현재 언어 설정 표시')
    .action(showLanguageStatus);

program
    .command('set [language]')
    .alias('switch')
    .description('Set or change language / 언어 설정 또는 변경')
    .option('-a, --auto-detect [boolean]', 'Enable/disable auto detection / 자동 감지 활성화/비활성화')
    .action(setLanguage);

program
    .command('reset')
    .alias('r')
    .description('Reset language configuration to auto-detection / 언어 설정을 자동 감지로 초기화')
    .action(resetLanguage);

// 기본 명령어 (인수 없이 실행 시)
program
    .action(async () => {
        await showLanguageStatus();
        console.log(chalk.blue('\n💡 사용 가능한 명령어 / Available commands:'));
        console.log(chalk.gray('   aiwf-lang status    - 현재 설정 표시 / Show current configuration'));
        console.log(chalk.gray('   aiwf-lang set       - 언어 설정 / Set language'));
        console.log(chalk.gray('   aiwf-lang reset     - 설정 초기화 / Reset configuration'));
    });

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    // Deprecated 경고 표시
    console.log(chalk.yellow('⚠️  DEPRECATED: `aiwf-lang` is deprecated.'));
    console.log(chalk.yellow('   Please use `aiwf lang` instead:'));
    console.log(chalk.gray('   aiwf-lang status  →  aiwf lang status'));
    console.log(chalk.gray('   aiwf-lang set     →  aiwf lang set'));
    console.log(chalk.gray('   aiwf-lang reset   →  aiwf lang reset\n'));
    
    program.parse(process.argv);
}

export default program;
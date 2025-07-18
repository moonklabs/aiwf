#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { TemplateCache } from '../lib/template-cache-system.js';
import { OfflineDetector } from '../lib/offline-detector.js';
import { TemplateDownloader } from '../lib/template-downloader.js';
import { TemplateVersionManager } from '../lib/template-version-manager.js';

/**
 * 캐시 관리 CLI 명령어
 * - aiwf cache download: 선택적 템플릿 다운로드
 * - aiwf cache list: 캐시 목록 조회
 * - aiwf cache clean: 캐시 정리
 * - aiwf cache update: 업데이트 확인
 * - aiwf cache status: 캐시 상태 확인
 */
class CacheCLI {
    constructor() {
        this.cache = new TemplateCache();
        this.offlineDetector = new OfflineDetector();
        this.downloader = new TemplateDownloader();
        this.versionManager = new TemplateVersionManager();
        
        // 의존성 주입
        this.offlineDetector.setCache(this.cache);
        this.downloader.setCache(this.cache);
        this.downloader.setOfflineDetector(this.offlineDetector);
        this.versionManager.setCache(this.cache);
        this.versionManager.setDownloader(this.downloader);
        this.versionManager.setOfflineDetector(this.offlineDetector);
    }

    /**
     * CLI 초기화
     */
    async init() {
        await this.cache.init();
        await this.offlineDetector.start();
        await this.versionManager.init();
    }

    /**
     * 템플릿 다운로드 명령어
     */
    async downloadCommand(options = {}) {
        const spinner = ora('Scanning available templates...').start();
        
        try {
            const templates = await this.downloader.scanAvailableTemplates();
            spinner.stop();
            
            if (options.all) {
                return await this.downloadAllTemplates();
            }
            
            if (options.type) {
                return await this.downloadTemplatesByType(options.type);
            }
            
            // 대화형 선택
            return await this.interactiveDownload(templates);
            
        } catch (error) {
            spinner.fail(chalk.red(`Failed to scan templates: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 모든 템플릿 다운로드
     */
    async downloadAllTemplates() {
        const spinner = ora('Downloading all templates...').start();
        
        try {
            const result = await this.downloader.downloadAllTemplates();
            spinner.stop();
            
            this.displayDownloadResults(result);
            return result;
            
        } catch (error) {
            spinner.fail(chalk.red(`Download failed: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 타입별 템플릿 다운로드
     */
    async downloadTemplatesByType(type) {
        const spinner = ora(`Downloading ${type} templates...`).start();
        
        try {
            const result = await this.downloader.downloadTemplatesByType(type);
            spinner.stop();
            
            this.displayDownloadResults(result);
            return result;
            
        } catch (error) {
            spinner.fail(chalk.red(`Download failed: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 대화형 다운로드
     */
    async interactiveDownload(templates) {
        const choices = [];
        
        // AI 도구 선택지
        if (Object.keys(templates['ai-tools']).length > 0) {
            choices.push({
                title: chalk.cyan('AI Tools'),
                value: 'ai-tools-all',
                description: 'All AI development tools'
            });
            
            for (const [name, info] of Object.entries(templates['ai-tools'])) {
                choices.push({
                    title: `  ${name}`,
                    value: `ai-tools:${name}`,
                    description: info.description || 'AI development tool'
                });
            }
        }
        
        // 프로젝트 템플릿 선택지
        if (Object.keys(templates['projects']).length > 0) {
            choices.push({
                title: chalk.green('Project Templates'),
                value: 'projects-all',
                description: 'All project templates'
            });
            
            for (const [name, info] of Object.entries(templates['projects'])) {
                choices.push({
                    title: `  ${name}`,
                    value: `projects:${name}`,
                    description: info.description || 'Project template'
                });
            }
        }
        
        const response = await prompts({
            type: 'multiselect',
            name: 'templates',
            message: 'Select templates to download:',
            choices,
            hint: 'Space to select, Enter to confirm'
        });
        
        if (!response.templates || response.templates.length === 0) {
            console.log(chalk.yellow('No templates selected.'));
            return;
        }
        
        const selections = this.parseSelections(response.templates, templates);
        
        const spinner = ora('Downloading selected templates...').start();
        
        // 다운로드 진행률 표시
        let currentTemplate = '';
        this.downloader.on('templateStart', ({ type, name }) => {
            currentTemplate = `${type}/${name}`;
            spinner.text = `Downloading ${currentTemplate}...`;
        });
        
        this.downloader.on('progress', ({ completed, total, percentage }) => {
            spinner.text = `Downloaded ${completed}/${total} templates (${percentage.toFixed(1)}%)`;
        });
        
        try {
            const result = await this.downloader.downloadSelectedTemplates(selections);
            spinner.stop();
            
            this.displayDownloadResults(result);
            return result;
            
        } catch (error) {
            spinner.fail(chalk.red(`Download failed: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 선택사항 파싱
     */
    parseSelections(selections, templates) {
        const parsed = [];
        
        for (const selection of selections) {
            if (selection === 'ai-tools-all') {
                for (const [name, info] of Object.entries(templates['ai-tools'])) {
                    parsed.push({
                        type: 'ai-tools',
                        name,
                        version: info.version
                    });
                }
            } else if (selection === 'projects-all') {
                for (const [name, info] of Object.entries(templates['projects'])) {
                    parsed.push({
                        type: 'projects',
                        name,
                        version: info.version
                    });
                }
            } else if (selection.includes(':')) {
                const [type, name] = selection.split(':');
                const info = templates[type][name];
                parsed.push({
                    type,
                    name,
                    version: info.version
                });
            }
        }
        
        return parsed;
    }

    /**
     * 다운로드 결과 표시
     */
    displayDownloadResults(result) {
        console.log('\\n' + chalk.bold('Download Results:'));
        console.log(chalk.green(`✅ Completed: ${result.completed}/${result.total}`));
        
        if (result.failed > 0) {
            console.log(chalk.red(`❌ Failed: ${result.failed}`));
        }
        
        // 성공한 다운로드 표시
        const successful = result.results.filter(r => r.success);
        if (successful.length > 0) {
            console.log('\\n' + chalk.green('Successfully downloaded:'));
            for (const item of successful) {
                console.log(`  ${chalk.cyan(item.type)}/${chalk.white(item.name)} ${chalk.gray(`v${item.version}`)}`);
            }
        }
        
        // 실패한 다운로드 표시
        const failed = result.results.filter(r => !r.success);
        if (failed.length > 0) {
            console.log('\\n' + chalk.red('Failed downloads:'));
            for (const item of failed) {
                console.log(`  ${chalk.cyan(item.type)}/${chalk.white(item.name)} ${chalk.gray(`v${item.version}`)} - ${chalk.red(item.error)}`);
            }
        }
    }

    /**
     * 캐시 목록 조회
     */
    async listCommand(options = {}) {
        try {
            const templates = await this.cache.listTemplates(options.type);
            const stats = this.cache.getStats();
            
            console.log(chalk.bold('Template Cache Status:'));
            console.log(`📦 Total templates: ${chalk.cyan(stats.templatesCount)}`);
            console.log(`💾 Total size: ${chalk.cyan(this.formatBytes(stats.totalSize))}`);
            console.log(`📈 Cache usage: ${chalk.cyan(stats.usagePercentage)}`);
            console.log(`🎯 Hit rate: ${chalk.cyan(stats.hitRate)}`);
            
            if (stats.lastUpdate) {
                console.log(`🕒 Last update: ${chalk.gray(new Date(stats.lastUpdate).toLocaleString())}`);
            }
            
            // AI 도구 목록
            if (templates['ai-tools'] && Object.keys(templates['ai-tools']).length > 0) {
                console.log('\\n' + chalk.cyan.bold('AI Tools:'));
                for (const [name, info] of Object.entries(templates['ai-tools'])) {
                    console.log(`  ${chalk.white(name)} ${chalk.gray(`v${info.version}`)} ${chalk.dim(`(${this.formatBytes(info.size)})`)}`);
                    console.log(`    ${chalk.gray(`Cached: ${new Date(info.cached_at).toLocaleString()}`)}`);
                }
            }
            
            // 프로젝트 템플릿 목록
            if (templates['projects'] && Object.keys(templates['projects']).length > 0) {
                console.log('\\n' + chalk.green.bold('Project Templates:'));
                for (const [name, info] of Object.entries(templates['projects'])) {
                    console.log(`  ${chalk.white(name)} ${chalk.gray(`v${info.version}`)} ${chalk.dim(`(${this.formatBytes(info.size)})`)}`);
                    console.log(`    ${chalk.gray(`Cached: ${new Date(info.cached_at).toLocaleString()}`)}`);
                }
            }
            
            if (stats.templatesCount === 0) {
                console.log('\\n' + chalk.yellow('No templates cached. Use `aiwf cache download` to cache templates.'));
            }
            
        } catch (error) {
            console.error(chalk.red(`Failed to list cache: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 캐시 정리
     */
    async cleanCommand(options = {}) {
        try {
            if (options.all) {
                const response = await prompts({
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Are you sure you want to clear all cached templates?',
                    initial: false
                });
                
                if (!response.confirm) {
                    console.log(chalk.yellow('Cache clear cancelled.'));
                    return;
                }
                
                const spinner = ora('Clearing cache...').start();
                await this.cache.clear();
                spinner.succeed(chalk.green('Cache cleared successfully.'));
                
            } else {
                const spinner = ora('Cleaning up expired cache...').start();
                const result = await this.cache.cleanup({
                    maxAge: options.maxAge || 7 * 24 * 60 * 60 * 1000 // 7일
                });
                
                spinner.succeed(
                    chalk.green(`Cleaned up ${result.removedCount} expired templates. `) +
                    chalk.gray(`Freed ${this.formatBytes(result.freedSpace)}.`)
                );
            }
            
        } catch (error) {
            console.error(chalk.red(`Failed to clean cache: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 업데이트 확인
     */
    async updateCommand(options = {}) {
        const spinner = ora('Checking for updates...').start();
        
        try {
            const updateInfo = await this.versionManager.checkForUpdates();
            const availableUpdates = updateInfo.updates.filter(u => u.needsUpdate);
            
            spinner.stop();
            
            if (availableUpdates.length === 0) {
                console.log(chalk.green('✅ All templates are up to date.'));
                return;
            }
            
            console.log(chalk.yellow(`📦 ${availableUpdates.length} updates available:`));
            
            for (const update of availableUpdates) {
                console.log(`  ${chalk.cyan(update.type)}/${chalk.white(update.name)}: ` +
                    `${chalk.gray(update.currentVersion || 'not cached')} → ${chalk.green(update.availableVersion)}`);
            }
            
            if (options.install) {
                const response = await prompts({
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Install all available updates?',
                    initial: true
                });
                
                if (response.confirm) {
                    const updateSpinner = ora('Installing updates...').start();
                    const results = await this.versionManager.updateAllTemplates();
                    updateSpinner.stop();
                    
                    const successCount = results.filter(r => r.success).length;
                    const failCount = results.filter(r => !r.success).length;
                    
                    console.log(chalk.green(`✅ ${successCount} templates updated successfully`));
                    if (failCount > 0) {
                        console.log(chalk.red(`❌ ${failCount} templates failed to update`));
                    }
                }
            }
            
        } catch (error) {
            spinner.fail(chalk.red(`Failed to check updates: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 캐시 상태 확인
     */
    async statusCommand() {
        try {
            const cacheStats = this.cache.getStats();
            const networkInfo = this.offlineDetector.getNetworkStats();
            const versionStats = this.versionManager.getStats();
            
            console.log(chalk.bold('AIWF Cache System Status\\n'));
            
            // 네트워크 상태
            console.log(chalk.bold('Network Status:'));
            const statusColor = networkInfo.status === 'online' ? chalk.green : chalk.red;
            console.log(`  Status: ${statusColor(networkInfo.status.toUpperCase())}`);
            console.log(`  Uptime: ${chalk.cyan(networkInfo.uptime)}`);
            console.log(`  Downtime: ${chalk.cyan(networkInfo.downtime)}`);
            console.log(`  Offline mode: ${networkInfo.offlineMode ? chalk.yellow('enabled') : chalk.green('disabled')}`);
            
            // 캐시 통계
            console.log('\\n' + chalk.bold('Cache Statistics:'));
            console.log(`  Templates: ${chalk.cyan(cacheStats.templatesCount)}`);
            console.log(`  Total size: ${chalk.cyan(this.formatBytes(cacheStats.totalSize))}`);
            console.log(`  Usage: ${chalk.cyan(cacheStats.usagePercentage)} of ${this.formatBytes(cacheStats.maxCacheSize)}`);
            console.log(`  Hit rate: ${chalk.cyan(cacheStats.hitRate)}`);
            
            // 버전 관리
            console.log('\\n' + chalk.bold('Version Management:'));
            console.log(`  Total templates: ${chalk.cyan(versionStats.totalTemplates)}`);
            console.log(`  Total versions: ${chalk.cyan(versionStats.totalVersions)}`);
            console.log(`  Cached versions: ${chalk.cyan(versionStats.cachedVersions)}`);
            if (versionStats.lastCheck) {
                console.log(`  Last check: ${chalk.gray(new Date(versionStats.lastCheck).toLocaleString())}`);
            }
            
        } catch (error) {
            console.error(chalk.red(`Failed to get status: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * 바이트 포맷팅
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * CLI 종료
     */
    async cleanup() {
        this.offlineDetector.stop();
    }
}

export { CacheCLI };
#!/usr/bin/env node

import { EventEmitter } from 'events';

/**
 * 오프라인 감지 및 네트워크 상태 관리
 * - 네트워크 연결 상태 실시간 모니터링
 * - 오프라인 모드 자동 전환
 * - 캐시 폴백 시스템 연동
 */
class OfflineDetector extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            // 네트워크 체크 설정
            checkInterval: options.checkInterval || 30000, // 30초
            timeout: options.timeout || 5000, // 5초
            retryCount: options.retryCount || 3,
            retryDelay: options.retryDelay || 1000, // 1초
            
            // 체크할 엔드포인트들
            checkUrls: options.checkUrls || [
                'https://api.github.com/zen',
                'https://httpbin.org/status/200',
                'https://jsonplaceholder.typicode.com/posts/1'
            ],
            
            // 오프라인 모드 설정
            offlineMode: options.offlineMode || false,
            gracefulDegradation: options.gracefulDegradation !== false
        };
        
        this.state = {
            isOnline: null,
            lastOnlineTime: null,
            lastOfflineTime: null,
            consecutiveFailures: 0,
            checkInProgress: false
        };
        
        this.checkTimer = null;
        this.cache = null; // TemplateCache 인스턴스 연결
    }

    /**
     * 오프라인 감지기 시작
     */
    async start() {
        // 초기 상태 확인
        await this.checkConnectionStatus();
        
        // 주기적 체크 시작
        this.startPeriodicCheck();
        
        // 브라우저 환경에서 네트워크 이벤트 감지
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleOnlineEvent());
            window.addEventListener('offline', () => this.handleOfflineEvent());
        }
        
        console.log('Offline detector started');
    }

    /**
     * 오프라인 감지기 중지
     */
    stop() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
        
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnlineEvent);
            window.removeEventListener('offline', this.handleOfflineEvent);
        }
        
        console.log('Offline detector stopped');
    }

    /**
     * 템플릿 캐시 연결
     */
    setCache(cache) {
        this.cache = cache;
    }

    /**
     * 현재 온라인 상태 확인
     */
    async isOnline() {
        if (this.options.offlineMode) {
            return false;
        }
        
        // 캐시된 상태가 있고 최근 체크라면 사용
        if (this.state.isOnline !== null && !this.shouldRecheck()) {
            return this.state.isOnline;
        }
        
        return await this.checkConnectionStatus();
    }

    /**
     * 재체크 필요 여부 확인
     */
    shouldRecheck() {
        const now = Date.now();
        const lastCheck = this.state.lastOnlineTime || this.state.lastOfflineTime;
        
        if (!lastCheck) return true;
        
        return now - lastCheck > this.options.checkInterval;
    }

    /**
     * 네트워크 연결 상태 확인
     */
    async checkConnectionStatus() {
        if (this.state.checkInProgress) {
            return this.state.isOnline;
        }
        
        this.state.checkInProgress = true;
        
        try {
            const isConnected = await this.performConnectivityCheck();
            await this.updateConnectionState(isConnected);
            return isConnected;
        } finally {
            this.state.checkInProgress = false;
        }
    }

    /**
     * 실제 연결 테스트 수행
     */
    async performConnectivityCheck() {
        const results = await Promise.allSettled(
            this.options.checkUrls.map(url => this.checkSingleUrl(url))
        );
        
        // 하나라도 성공하면 온라인
        return results.some(result => result.status === 'fulfilled' && result.value === true);
    }

    /**
     * 단일 URL 체크
     */
    async checkSingleUrl(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
        
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'aiwf-offline-detector/1.0.0'
                }
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.warn(`Connection check timeout for ${url}`);
            } else {
                console.warn(`Connection check failed for ${url}:`, error.message);
            }
            
            return false;
        }
    }

    /**
     * 연결 상태 업데이트
     */
    async updateConnectionState(isConnected) {
        const wasOnline = this.state.isOnline;
        const now = Date.now();
        
        if (isConnected) {
            this.state.isOnline = true;
            this.state.lastOnlineTime = now;
            this.state.consecutiveFailures = 0;
            
            if (wasOnline === false) {
                this.emit('online', { timestamp: now });
                console.log('🟢 Network connection restored');
            }
        } else {
            this.state.isOnline = false;
            this.state.lastOfflineTime = now;
            this.state.consecutiveFailures++;
            
            if (wasOnline === true) {
                this.emit('offline', { timestamp: now });
                console.log('🔴 Network connection lost, switching to offline mode');
            }
        }
    }

    /**
     * 주기적 체크 시작
     */
    startPeriodicCheck() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }
        
        this.checkTimer = setInterval(async () => {
            await this.checkConnectionStatus();
        }, this.options.checkInterval);
    }

    /**
     * 온라인 이벤트 처리
     */
    handleOnlineEvent() {
        console.log('Browser online event detected');
        this.checkConnectionStatus();
    }

    /**
     * 오프라인 이벤트 처리
     */
    handleOfflineEvent() {
        console.log('Browser offline event detected');
        this.updateConnectionState(false);
    }

    /**
     * 템플릿 캐시에서 가져오기 (오프라인 폴백)
     */
    async useCache(type, name, version = '1.0.0') {
        if (!this.cache) {
            throw new Error('Template cache not configured');
        }
        
        const template = await this.cache.getTemplate(type, name, version);
        if (!template) {
            throw new Error(`Template ${type}/${name}@${version} not available offline`);
        }
        
        return template;
    }

    /**
     * 템플릿 추출 (오프라인 모드)
     */
    async extractTemplate(type, name, targetPath, version = '1.0.0') {
        if (!this.cache) {
            throw new Error('Template cache not configured');
        }
        
        return await this.cache.extractToDirectory(type, name, targetPath, version);
    }

    /**
     * 오프라인 모드 강제 설정
     */
    setOfflineMode(offline = true) {
        this.options.offlineMode = offline;
        
        if (offline) {
            this.updateConnectionState(false);
            console.log('🔴 Offline mode manually enabled');
        } else {
            console.log('🟢 Offline mode disabled, checking connection...');
            this.checkConnectionStatus();
        }
    }

    /**
     * 연결 상태 정보 반환
     */
    getConnectionInfo() {
        return {
            isOnline: this.state.isOnline,
            lastOnlineTime: this.state.lastOnlineTime,
            lastOfflineTime: this.state.lastOfflineTime,
            consecutiveFailures: this.state.consecutiveFailures,
            offlineMode: this.options.offlineMode,
            uptime: this.state.lastOnlineTime ? Date.now() - this.state.lastOnlineTime : null,
            downtime: this.state.lastOfflineTime ? Date.now() - this.state.lastOfflineTime : null
        };
    }

    /**
     * 네트워크 상태 통계
     */
    getNetworkStats() {
        const info = this.getConnectionInfo();
        
        return {
            status: info.isOnline ? 'online' : 'offline',
            uptime: info.uptime ? this.formatDuration(info.uptime) : 'N/A',
            downtime: info.downtime ? this.formatDuration(info.downtime) : 'N/A',
            consecutiveFailures: info.consecutiveFailures,
            offlineMode: info.offlineMode,
            lastCheck: info.lastOnlineTime || info.lastOfflineTime
        };
    }

    /**
     * 지속 시간 포맷팅
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * 오프라인 사용 가능한 템플릿 확인
     */
    async getAvailableOfflineTemplates() {
        if (!this.cache) {
            return { 'ai-tools': {}, 'projects': {} };
        }
        
        return await this.cache.listTemplates();
    }

    /**
     * 오프라인 상태에서 템플릿 사용 가능 여부 확인
     */
    async isTemplateAvailableOffline(type, name, version = '1.0.0') {
        if (!this.cache) {
            return false;
        }
        
        const template = await this.cache.getTemplate(type, name, version);
        return template !== null;
    }

    /**
     * 오프라인 사용 권장 템플릿 사전 다운로드
     */
    async predownloadRecommendedTemplates() {
        const recommendations = [
            { type: 'ai-tools', name: 'claude-code' },
            { type: 'ai-tools', name: 'github-copilot' },
            { type: 'ai-tools', name: 'cursor' },
            { type: 'projects', name: 'web-app' },
            { type: 'projects', name: 'api-server' },
            { type: 'projects', name: 'npm-library' }
        ];
        
        const results = [];
        
        for (const { type, name } of recommendations) {
            try {
                const available = await this.isTemplateAvailableOffline(type, name);
                results.push({
                    type,
                    name,
                    available,
                    status: available ? 'cached' : 'not_cached'
                });
            } catch (error) {
                results.push({
                    type,
                    name,
                    available: false,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        return results;
    }
}

export { OfflineDetector };
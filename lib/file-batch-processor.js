#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

/**
 * 파일 시스템 작업 배치 처리 시스템
 * - 파일 읽기/쓰기 작업을 배치로 처리
 * - 병렬 처리를 통한 성능 향상
 * - 메모리 사용량 최적화
 */
class FileBatchProcessor {
    constructor(options = {}) {
        this.maxConcurrency = options.maxConcurrency || 10;
        this.batchSize = options.batchSize || 50;
        this.queue = [];
        this.processing = false;
        this.workers = new Map();
        this.stats = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageProcessingTime: 0,
            memoryUsage: 0
        };
    }

    // 파일 읽기 작업 추가
    addReadOperation(filePath, options = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                type: 'read',
                filePath,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
            this.processQueue();
        });
    }

    // 파일 쓰기 작업 추가
    addWriteOperation(filePath, content, options = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                type: 'write',
                filePath,
                content,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
            this.processQueue();
        });
    }

    // 파일 복사 작업 추가
    addCopyOperation(source, destination, options = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                type: 'copy',
                source,
                destination,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
            this.processQueue();
        });
    }

    // 디렉토리 생성 작업 추가
    addMkdirOperation(dirPath, options = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                type: 'mkdir',
                dirPath,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
            this.processQueue();
        });
    }

    // 큐 처리
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        try {
            while (this.queue.length > 0) {
                const batch = this.queue.splice(0, this.batchSize);
                await this.processBatch(batch);
            }
        } catch (error) {
            console.error('Batch processing error:', error);
        } finally {
            this.processing = false;
        }
    }

    // 배치 처리
    async processBatch(batch) {
        const startTime = Date.now();
        const concurrencyLimit = Math.min(this.maxConcurrency, batch.length);
        
        // 작업 타입별로 그룹핑
        const groupedOperations = this.groupOperationsByType(batch);
        
        // 각 타입별로 병렬 처리
        for (const [type, operations] of Object.entries(groupedOperations)) {
            await this.processOperationsInParallel(operations, concurrencyLimit);
        }

        const endTime = Date.now();
        this.updateStats(batch.length, endTime - startTime);
    }

    // 작업 타입별 그룹핑
    groupOperationsByType(operations) {
        const grouped = {};
        
        for (const operation of operations) {
            if (!grouped[operation.type]) {
                grouped[operation.type] = [];
            }
            grouped[operation.type].push(operation);
        }
        
        return grouped;
    }

    // 병렬 처리
    async processOperationsInParallel(operations, concurrencyLimit) {
        const semaphore = new Semaphore(concurrencyLimit);
        
        const promises = operations.map(async (operation) => {
            await semaphore.acquire();
            
            try {
                const result = await this.executeOperation(operation);
                operation.resolve(result);
                this.stats.successfulOperations++;
            } catch (error) {
                operation.reject(error);
                this.stats.failedOperations++;
            } finally {
                semaphore.release();
            }
        });

        await Promise.all(promises);
    }

    // 개별 작업 실행
    async executeOperation(operation) {
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (operation.type) {
                case 'read':
                    result = await this.readFile(operation.filePath, operation.options);
                    break;
                case 'write':
                    result = await this.writeFile(operation.filePath, operation.content, operation.options);
                    break;
                case 'copy':
                    result = await this.copyFile(operation.source, operation.destination, operation.options);
                    break;
                case 'mkdir':
                    result = await this.createDirectory(operation.dirPath, operation.options);
                    break;
                default:
                    throw new Error(`Unknown operation type: ${operation.type}`);
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    // 파일 읽기 (최적화된)
    async readFile(filePath, options = {}) {
        const stats = await fs.stat(filePath);
        
        // 큰 파일은 스트리밍으로 처리
        if (stats.size > 10 * 1024 * 1024) { // 10MB 이상
            return await this.readFileStreaming(filePath, options);
        }
        
        return await fs.readFile(filePath, options.encoding || 'utf8');
    }

    // 스트리밍 파일 읽기
    async readFileStreaming(filePath, options = {}) {
        const chunks = [];
        const readStream = createReadStream(filePath, options);
        
        return new Promise((resolve, reject) => {
            readStream.on('data', chunk => chunks.push(chunk));
            readStream.on('end', () => resolve(Buffer.concat(chunks).toString()));
            readStream.on('error', reject);
        });
    }

    // 파일 쓰기 (최적화된)
    async writeFile(filePath, content, options = {}) {
        // 디렉토리 생성
        const dirPath = path.dirname(filePath);
        await fs.mkdir(dirPath, { recursive: true });
        
        // 큰 콘텐츠는 스트리밍으로 처리
        if (content.length > 10 * 1024 * 1024) { // 10MB 이상
            return await this.writeFileStreaming(filePath, content, options);
        }
        
        return await fs.writeFile(filePath, content, options.encoding || 'utf8');
    }

    // 스트리밍 파일 쓰기
    async writeFileStreaming(filePath, content, options = {}) {
        const writeStream = createWriteStream(filePath, options);
        
        return new Promise((resolve, reject) => {
            writeStream.write(content, options.encoding || 'utf8');
            writeStream.end();
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }

    // 파일 복사 (최적화된)
    async copyFile(source, destination, options = {}) {
        const destDir = path.dirname(destination);
        await fs.mkdir(destDir, { recursive: true });
        
        // 큰 파일은 스트리밍으로 복사
        const stats = await fs.stat(source);
        if (stats.size > 10 * 1024 * 1024) { // 10MB 이상
            return await this.copyFileStreaming(source, destination, options);
        }
        
        return await fs.copyFile(source, destination);
    }

    // 스트리밍 파일 복사
    async copyFileStreaming(source, destination, options = {}) {
        const readStream = createReadStream(source, options);
        const writeStream = createWriteStream(destination, options);
        
        return await pipeline(readStream, writeStream);
    }

    // 디렉토리 생성
    async createDirectory(dirPath, options = {}) {
        return await fs.mkdir(dirPath, { recursive: true, ...options });
    }

    // 통계 업데이트
    updateStats(operationCount, processingTime) {
        this.stats.totalOperations += operationCount;
        this.stats.averageProcessingTime = (
            (this.stats.averageProcessingTime * (this.stats.totalOperations - operationCount) + processingTime) /
            this.stats.totalOperations
        );
        this.stats.memoryUsage = process.memoryUsage().heapUsed;
    }

    // 통계 정보
    getStats() {
        return {
            ...this.stats,
            queueLength: this.queue.length,
            isProcessing: this.processing,
            successRate: this.stats.totalOperations > 0 ? 
                (this.stats.successfulOperations / this.stats.totalOperations * 100).toFixed(2) + '%' : '0%'
        };
    }

    // 큐 정리
    clearQueue() {
        this.queue.forEach(operation => {
            operation.reject(new Error('Queue cleared'));
        });
        this.queue = [];
    }

    // 배치 처리 대기
    async waitForCompletion() {
        while (this.processing || this.queue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// 세마포어 클래스 (동시성 제어)
class Semaphore {
    constructor(capacity) {
        this.capacity = capacity;
        this.current = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.current < this.capacity) {
            this.current++;
            return;
        }

        return new Promise(resolve => {
            this.queue.push(resolve);
        });
    }

    release() {
        this.current--;
        if (this.queue.length > 0) {
            this.current++;
            const resolve = this.queue.shift();
            resolve();
        }
    }
}

// 파일 작업 유틸리티
class FileUtils {
    static async readMultipleFiles(filePaths, processor) {
        const results = {};
        
        for (const filePath of filePaths) {
            try {
                results[filePath] = await processor.addReadOperation(filePath);
            } catch (error) {
                results[filePath] = { error: error.message };
            }
        }
        
        return results;
    }

    static async writeMultipleFiles(fileData, processor) {
        const results = {};
        
        for (const [filePath, content] of Object.entries(fileData)) {
            try {
                await processor.addWriteOperation(filePath, content);
                results[filePath] = { success: true };
            } catch (error) {
                results[filePath] = { error: error.message };
            }
        }
        
        return results;
    }

    static async copyMultipleFiles(fileMappings, processor) {
        const results = {};
        
        for (const [source, destination] of Object.entries(fileMappings)) {
            try {
                await processor.addCopyOperation(source, destination);
                results[source] = { success: true, destination };
            } catch (error) {
                results[source] = { error: error.message };
            }
        }
        
        return results;
    }

    static async createDirectories(dirPaths, processor) {
        const results = {};
        
        for (const dirPath of dirPaths) {
            try {
                await processor.addMkdirOperation(dirPath);
                results[dirPath] = { success: true };
            } catch (error) {
                results[dirPath] = { error: error.message };
            }
        }
        
        return results;
    }
}

export { FileBatchProcessor, FileUtils, Semaphore };
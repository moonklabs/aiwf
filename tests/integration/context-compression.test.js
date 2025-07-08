/**
 * Context 압축/복원 시스템 통합 테스트
 */

import { testUtils, testFixtures } from './setup.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Context 압축/복원 시스템 통합 테스트', () => {
  let testProjectDir;
  let aiwfDir;

  beforeEach(async () => {
    testProjectDir = await testUtils.createTempDir('context-compression-');
    aiwfDir = await testUtils.createTestProjectStructure(testProjectDir);
  });

  afterEach(async () => {
    await testUtils.cleanupTempDir(testProjectDir);
  });

  describe('토큰 사용량 추적 테스트', () => {
    test('토큰 카운팅 시뮬레이션', () => {
      // 간단한 토큰 카운팅 함수 시뮬레이션
      const countTokens = (text) => {
        // 실제로는 tiktoken 라이브러리를 사용하지만, 테스트용으로 간단히 구현
        return text.split(/\s+/).length;
      };

      const testTexts = [
        'This is a simple test.',
        'Context compression is essential for AI optimization.',
        'Feature Ledger 시스템을 구현하여 프로젝트 관리 효율성을 높인다.'
      ];

      testTexts.forEach(text => {
        const tokenCount = countTokens(text);
        expect(tokenCount).toBeGreaterThan(0);
        expect(typeof tokenCount).toBe('number');
      });
    });

    test('토큰 사용량 히스토리 추적', async () => {
      const tokenHistoryPath = path.join(aiwfDir, 'token_history.json');
      
      const tokenHistory = [
        { timestamp: '2025-07-09T01:00:00Z', operation: 'compress', inputTokens: 1000, outputTokens: 600, compression: 0.4 },
        { timestamp: '2025-07-09T01:15:00Z', operation: 'decompress', inputTokens: 600, outputTokens: 1000, compression: 0.0 },
        { timestamp: '2025-07-09T01:30:00Z', operation: 'compress', inputTokens: 1500, outputTokens: 750, compression: 0.5 }
      ];

      await fs.writeFile(tokenHistoryPath, JSON.stringify(tokenHistory, null, 2));
      
      const history = await testUtils.readJsonFile(tokenHistoryPath);
      expect(history).toHaveLength(3);
      
      // 압축률 계산 검증
      const compressOperations = history.filter(op => op.operation === 'compress');
      const avgCompression = compressOperations.reduce((sum, op) => sum + op.compression, 0) / compressOperations.length;
      
      expect(avgCompression).toBeCloseTo(0.45, 2);
    });
  });

  describe('Context 압축 알고리즘 테스트', () => {
    test('기본 압축 알고리즘 시뮬레이션', () => {
      // 간단한 압축 알고리즘 시뮬레이션
      const compressContext = (context) => {
        // 1. 중복 단어 제거
        const words = context.split(/\s+/);
        const uniqueWords = [...new Set(words)];
        
        // 2. 불필요한 접속사 제거
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const filteredWords = uniqueWords.filter(word => !stopWords.includes(word.toLowerCase()));
        
        // 3. 압축된 텍스트 생성
        const compressed = filteredWords.join(' ');
        
        return {
          original: context,
          compressed: compressed,
          originalLength: context.length,
          compressedLength: compressed.length,
          compressionRatio: (context.length - compressed.length) / context.length
        };
      };

      const testContext = 'This is a test context with many repeated words and unnecessary filler words that can be compressed for efficiency.';
      const result = compressContext(testContext);
      
      expect(result.compressedLength).toBeLessThan(result.originalLength);
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.compressed).not.toContain('the');
      expect(result.compressed).not.toContain('and');
    });

    test('압축 레벨별 테스트', () => {
      const compressWithLevel = (text, level) => {
        const words = text.split(/\s+/);
        
        switch (level) {
          case 'low':
            // 단순 공백 정리
            return text.replace(/\s+/g, ' ').trim();
          case 'medium':
            // 중복 단어 제거
            return [...new Set(words)].join(' ');
          case 'high':
            // 핵심 키워드만 유지
            return words.filter((word, index) => index % 2 === 0).join(' ');
          default:
            return text;
        }
      };

      const testText = 'Feature Ledger system implementation for project management efficiency enhancement';
      
      const lowCompressed = compressWithLevel(testText, 'low');
      const mediumCompressed = compressWithLevel(testText, 'medium');
      const highCompressed = compressWithLevel(testText, 'high');
      
      expect(lowCompressed.length).toBeLessThanOrEqual(testText.length);
      expect(mediumCompressed.length).toBeLessThanOrEqual(lowCompressed.length);
      expect(highCompressed.length).toBeLessThanOrEqual(mediumCompressed.length);
    });
  });

  describe('Context 복원 시스템 테스트', () => {
    test('압축된 Context 복원 시뮬레이션', () => {
      // 압축/복원 시스템 시뮬레이션
      const contextSystem = {
        compress: (text) => {
          const words = text.split(/\s+/);
          const keyWords = words.filter(word => word.length > 3);
          return {
            compressed: keyWords.join(' '),
            metadata: {
              originalLength: text.length,
              removedWords: words.filter(word => word.length <= 3),
              compressionTime: new Date().toISOString()
            }
          };
        },
        
        decompress: (compressed, metadata) => {
          // 간단한 복원 시뮬레이션
          return `[DECOMPRESSED] ${compressed.compressed}`;
        }
      };

      const originalText = 'This is a test of the context compression and decompression system';
      const compressed = contextSystem.compress(originalText);
      const decompressed = contextSystem.decompress(compressed, compressed.metadata);
      
      expect(compressed.compressed).toBeTruthy();
      expect(compressed.metadata.originalLength).toBe(originalText.length);
      expect(decompressed).toContain('[DECOMPRESSED]');
    });

    test('Context 무결성 검증', () => {
      const verifyContextIntegrity = (original, restored) => {
        // 핵심 키워드 추출
        const extractKeywords = (text) => {
          return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 10); // 상위 10개 키워드
        };

        const originalKeywords = extractKeywords(original);
        const restoredKeywords = extractKeywords(restored);
        
        // 키워드 일치율 계산
        const matchingKeywords = originalKeywords.filter(keyword => 
          restoredKeywords.includes(keyword)
        );
        
        const integrityScore = matchingKeywords.length / originalKeywords.length;
        
        return {
          integrityScore,
          matchingKeywords,
          originalKeywords,
          restoredKeywords
        };
      };

      const originalContext = 'Feature Ledger system implementation with comprehensive testing suite for project management efficiency';
      const restoredContext = 'Feature Ledger system implementation comprehensive testing suite project management efficiency';
      
      const integrity = verifyContextIntegrity(originalContext, restoredContext);
      
      expect(integrity.integrityScore).toBeGreaterThan(0.8);
      expect(integrity.matchingKeywords).toContain('feature');
      expect(integrity.matchingKeywords).toContain('system');
      expect(integrity.matchingKeywords).toContain('implementation');
    });
  });

  describe('압축 성능 최적화 테스트', () => {
    test('압축 속도 성능 테스트', async () => {
      const performanceTest = async (textSize) => {
        const testText = 'Performance test data '.repeat(textSize);
        
        const startTime = Date.now();
        
        // 간단한 압축 알고리즘 시뮬레이션
        const compressed = testText
          .split(/\s+/)
          .filter((word, index) => index % 2 === 0)
          .join(' ');
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        return {
          inputSize: testText.length,
          outputSize: compressed.length,
          compressionRatio: (testText.length - compressed.length) / testText.length,
          duration: duration
        };
      };

      const smallTest = await performanceTest(10);
      const mediumTest = await performanceTest(100);
      const largeTest = await performanceTest(1000);
      
      expect(smallTest.duration).toBeLessThan(100);
      expect(mediumTest.duration).toBeLessThan(200);
      expect(largeTest.duration).toBeLessThan(500);
      
      // 압축률이 일정 수준 이상이어야 함
      expect(smallTest.compressionRatio).toBeGreaterThan(0.3);
      expect(mediumTest.compressionRatio).toBeGreaterThan(0.3);
      expect(largeTest.compressionRatio).toBeGreaterThan(0.3);
    });

    test('메모리 사용량 최적화 테스트', () => {
      const memoryEfficientCompress = (text) => {
        // 스트림 기반 압축 시뮬레이션
        const result = [];
        const words = text.split(/\s+/);
        
        for (let i = 0; i < words.length; i += 10) {
          const chunk = words.slice(i, i + 10);
          const processedChunk = chunk.filter(word => word.length > 2).join(' ');
          result.push(processedChunk);
        }
        
        return result.join(' ');
      };

      const largeText = 'This is a large text for memory optimization testing. '.repeat(1000);
      const compressed = memoryEfficientCompress(largeText);
      
      expect(compressed.length).toBeLessThan(largeText.length);
      expect(typeof compressed).toBe('string');
    });
  });

  describe('Context 압축 설정 관리 테스트', () => {
    test('압축 설정 파일 생성 및 읽기', async () => {
      const configPath = path.join(aiwfDir, 'compression_config.json');
      
      const config = {
        compressionLevel: 'medium',
        maxTokens: 4000,
        preserveCodeBlocks: true,
        preserveLinks: true,
        compressionRatio: 0.5,
        algorithms: ['keyword-extraction', 'duplicate-removal', 'stopword-filtering']
      };

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      
      const loadedConfig = await testUtils.readJsonFile(configPath);
      expect(loadedConfig.compressionLevel).toBe('medium');
      expect(loadedConfig.maxTokens).toBe(4000);
      expect(loadedConfig.algorithms).toContain('keyword-extraction');
      expect(loadedConfig.algorithms).toHaveLength(3);
    });

    test('압축 설정 검증', () => {
      const validateConfig = (config) => {
        const errors = [];
        
        if (!['low', 'medium', 'high'].includes(config.compressionLevel)) {
          errors.push('Invalid compression level');
        }
        
        if (config.maxTokens <= 0) {
          errors.push('Max tokens must be positive');
        }
        
        if (config.compressionRatio < 0 || config.compressionRatio > 1) {
          errors.push('Compression ratio must be between 0 and 1');
        }
        
        return errors;
      };

      const validConfig = {
        compressionLevel: 'medium',
        maxTokens: 4000,
        compressionRatio: 0.5
      };

      const invalidConfig = {
        compressionLevel: 'invalid',
        maxTokens: -100,
        compressionRatio: 1.5
      };

      expect(validateConfig(validConfig)).toHaveLength(0);
      expect(validateConfig(invalidConfig)).toHaveLength(3);
    });
  });

  describe('실시간 압축 시스템 테스트', () => {
    test('스트리밍 압축 시뮬레이션', async () => {
      const streamingCompress = async function* (textStream) {
        for await (const chunk of textStream) {
          // 청크 단위로 압축
          const compressed = chunk.split(/\s+/)
            .filter(word => word.length > 2)
            .join(' ');
          
          yield compressed;
        }
      };

      // 테스트용 스트림 생성
      const testStream = async function* () {
        const chunks = [
          'This is the first chunk of text',
          'This is the second chunk with more content',
          'Final chunk for testing purposes'
        ];
        
        for (const chunk of chunks) {
          yield chunk;
        }
      };

      const results = [];
      for await (const compressed of streamingCompress(testStream())) {
        results.push(compressed);
      }

      expect(results).toHaveLength(3);
      expect(results[0]).toContain('This');
      expect(results[0]).toContain('first');
      expect(results[0]).toContain('chunk');
    });
  });
});
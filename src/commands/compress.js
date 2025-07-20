#!/usr/bin/env node

/**
 * AIWF 컨텍스트 압축 명령어
 * 대용량 컨텍스트를 효율적으로 압축하여 토큰 사용량 감소
 */

import { ResourceLoader } from '../lib/resource-loader.js';
import chalk from 'chalk';

class CompressCommand {
  constructor() {
    this.resourceLoader = new ResourceLoader();
  }

  /**
   * 압축 명령어 실행
   */
  async execute(args) {
    try {
      // compress-context 모듈 동적 로드
      const compressModule = await this.resourceLoader.loadUtil('compress-context.js');
      const executeCompressContext = compressModule.executeCompressContext || compressModule.default;
      
      if (typeof executeCompressContext !== 'function') {
        throw new Error('compress-context 모듈을 로드할 수 없습니다.');
      }
      
      // 실행
      await executeCompressContext(args);
      
    } catch (error) {
      console.error(chalk.red('❌ 압축 실행 중 오류가 발생했습니다:'), error.message);
      this.showHelp();
    }
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log(chalk.cyan('\n🗜️  AIWF 컨텍스트 압축'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log('사용법: aiwf compress [옵션] [경로]');
    console.log('');
    console.log('옵션:');
    console.log('  aggressive    공격적 압축 (50-70% 토큰 감소)');
    console.log('  balanced      균형잡힌 압축 (30-50% 토큰 감소) [기본값]');
    console.log('  minimal       최소 압축 (10-30% 토큰 감소)');
    console.log('  --persona     페르소나 인식 압축 활성화');
    console.log('');
    console.log('예시:');
    console.log('  aiwf compress                    # 기본 압축');
    console.log('  aiwf compress aggressive         # 공격적 압축');
    console.log('  aiwf compress --persona balanced # 페르소나 인식 압축');
    console.log('  aiwf compress .aiwf              # 특정 경로 압축');
  }
}

export default CompressCommand;
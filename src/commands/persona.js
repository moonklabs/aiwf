#!/usr/bin/env node

/**
 * AI 페르소나 명령어
 * AI 행동 페르소나 관리 및 전환
 */

import { AIPersonaManager } from '../lib/ai-persona-manager.js';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PersonaCommand {
  constructor() {
    this.personaManager = null;
  }

  /**
   * 페르소나 매니저 초기화
   */
  async initPersonaManager() {
    if (!this.personaManager) {
      this.personaManager = new AIPersonaManager({
        personaConfigPath: path.join(process.cwd(), '.aiwf', 'personas'),
        metricsPath: path.join(process.cwd(), '.aiwf', 'metrics'),
        metricsEnabled: true,
        autoDetectionEnabled: true
      });
      
      await this.personaManager.init();
    }
    
    return this.personaManager;
  }

  /**
   * 페르소나 상태 표시
   */
  async showStatus() {
    try {
      // 파일에서 현재 페르소나 읽기
      const fs = await import('fs/promises');
      const path = await import('path');
      const personaFile = path.join(process.cwd(), '.aiwf', 'personas', 'current.json');
      
      try {
        const content = await fs.readFile(personaFile, 'utf-8');
        const currentPersona = JSON.parse(content);
        
        console.log(chalk.cyan('🎭 현재 AI 페르소나 상태'));
        console.log(chalk.gray('-'.repeat(50)));
        console.log(`현재 페르소나: ${chalk.yellow(currentPersona.name)}`);
        console.log(`설명: ${currentPersona.description}`);
        console.log(`활성화 시간: ${new Date(currentPersona.activatedAt).toLocaleString('ko-KR')}`);
        
        const behaviors = this.getKoreanBehaviors(currentPersona.name);
        if (behaviors.length > 0) {
          console.log('\n주요 동작:');
          behaviors.forEach(behavior => {
            console.log(`  • ${behavior}`);
          });
        }

        console.log(chalk.gray('\n' + '-'.repeat(50)));
        console.log(chalk.green('✅ 페르소나가 활성화되어 있습니다.'));
        
      } catch (fileError) {
        console.log(chalk.yellow('⚠️  현재 활성화된 페르소나가 없습니다.'));
        console.log(chalk.gray('사용 가능한 페르소나 목록을 보려면: aiwf persona list'));
        console.log(chalk.gray('페르소나를 설정하려면: aiwf persona set <페르소나명>'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 페르소나 상태 확인 중 오류가 발생했습니다:'), error.message);
      console.error(error.stack);
    }
  }

  /**
   * 페르소나 목록 표시
   */
  async listPersonas() {
    try {
      console.log(chalk.cyan('🎭 사용 가능한 AI 페르소나'));
      console.log(chalk.gray('-'.repeat(50)));
      
      // 기본 페르소나 목록을 하드코딩으로 표시 (초기화 문제 회피)
      const defaultPersonas = [
        { name: 'architect', description: '시스템 설계 및 아키텍처 전문가' },
        { name: 'developer', description: '일반 개발자 (기본값)' },
        { name: 'reviewer', description: '코드 리뷰 및 품질 관리 전문가' },
        { name: 'debugger', description: '디버깅 및 문제 해결 전문가' },
        { name: 'optimizer', description: '성능 최적화 전문가' },
        { name: 'security', description: '보안 및 취약점 분석 전문가' },
        { name: 'documenter', description: '문서화 및 기술 작성 전문가' }
      ];
      
      defaultPersonas.forEach(persona => {
        const displayName = chalk.yellow(persona.name);
        console.log(`  ${displayName} - ${persona.description}`);
      });
      
      console.log(chalk.gray('\n' + '-'.repeat(50)));
      console.log(chalk.gray('사용법: aiwf persona set <페르소나명>'));
      
    } catch (error) {
      console.error(chalk.red('❌ 페르소나 목록 조회 중 오류가 발생했습니다:'), error.message);
      console.error(error.stack);
    }
  }

  /**
   * 페르소나 전환
   */
  async setPersona(personaName) {
    if (!personaName) {
      console.error(chalk.red('❌ 페르소나 이름을 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf persona set <페르소나명>'));
      console.log(chalk.gray('사용 가능한 페르소나: aiwf persona list'));
      return;
    }

    try {
      // 유효한 페르소나인지 확인
      const validPersonas = ['architect', 'developer', 'reviewer', 'debugger', 'optimizer', 'security', 'documenter'];
      
      if (!validPersonas.includes(personaName)) {
        console.error(chalk.red(`❌ 페르소나 '${personaName}'를 찾을 수 없습니다.`));
        console.log(chalk.gray('사용 가능한 페르소나: aiwf persona list'));
        return;
      }

      // 간단한 페르소나 설정 (파일 기반)
      const fs = await import('fs/promises');
      const path = await import('path');
      const personaDir = path.join(process.cwd(), '.aiwf', 'personas');
      
      // 디렉토리 생성
      await fs.mkdir(personaDir, { recursive: true });
      
      // 현재 페르소나 저장
      const personaConfig = {
        name: personaName,
        description: this.getKoreanDescription(personaName),
        activatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(personaDir, 'current.json'),
        JSON.stringify(personaConfig, null, 2)
      );
      
      console.log(chalk.green('🎭 AI 페르소나 활성화 완료'));
      console.log(chalk.gray('-'.repeat(50)));
      console.log(`현재 페르소나: ${chalk.yellow(personaName)}`);
      console.log(`전문 분야: ${this.getKoreanDescription(personaName)}`);
      console.log(chalk.gray('-'.repeat(50)));
      console.log(chalk.green('✅ 페르소나가 성공적으로 활성화되었습니다.'));
      
    } catch (error) {
      console.error(chalk.red('❌ 페르소나 전환 중 오류가 발생했습니다:'), error.message);
      console.error(error.stack);
    }
  }

  /**
   * 페르소나 리셋
   */
  async resetPersona() {
    try {
      // 기본 페르소나(developer)로 리셋
      await this.setPersona('developer');
      console.log(chalk.green('🔄 페르소나가 기본값(developer)으로 리셋되었습니다.'));
      
    } catch (error) {
      console.error(chalk.red('❌ 페르소나 리셋 중 오류가 발생했습니다:'), error.message);
      console.error(error.stack);
    }
  }

  /**
   * 명령어 실행
   */
  async execute(args) {
    const [subcommand, ...restArgs] = args;

    switch (subcommand) {
      case 'status':
        await this.showStatus();
        break;
      case 'list':
        await this.listPersonas();
        break;
      case 'set':
        await this.setPersona(restArgs[0]);
        break;
      case 'reset':
        await this.resetPersona();
        break;
      default:
        this.showHelp();
        break;
    }
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log(chalk.cyan('🎭 AIWF 페르소나 관리'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log('사용법: aiwf persona <명령어> [옵션]');
    console.log('');
    console.log('명령어:');
    console.log('  status              현재 페르소나 상태 표시');
    console.log('  list                사용 가능한 페르소나 목록');
    console.log('  set <페르소나명>     특정 페르소나로 전환');
    console.log('  reset               기본 페르소나로 리셋');
    console.log('');
    console.log('예시:');
    console.log('  aiwf persona status');
    console.log('  aiwf persona list');
    console.log('  aiwf persona set architect');
    console.log('  aiwf persona reset');
  }

  /**
   * 한국어 설명 가져오기
   */
  getKoreanDescription(persona) {
    const descriptions = {
      architect: '시스템 설계 및 아키텍처 전문가',
      developer: '일반 개발자 (기본값)',
      reviewer: '코드 리뷰 및 품질 관리 전문가',
      debugger: '디버깅 및 문제 해결 전문가',
      optimizer: '성능 최적화 전문가',
      security: '보안 및 취약점 분석 전문가',
      devops: 'DevOps 및 인프라 관리 전문가',
      tester: '테스트 및 QA 전문가',
      documenter: '문서화 및 기술 작성 전문가',
      mentor: '멘토링 및 교육 전문가'
    };
    
    return descriptions[persona] || '설명 없음';
  }

  /**
   * 한국어 동작 설명 가져오기
   */
  getKoreanBehaviors(persona) {
    const behaviors = {
      architect: [
        '큰 그림과 전체 시스템 구조에 집중',
        '확장성과 유지보수성 우선시',
        '디자인 패턴과 아키텍처 원칙 적용',
        '통합 지점과 인터페이스 고려'
      ],
      developer: [
        '실용적이고 효율적인 코드 작성',
        '베스트 프랙티스 적용',
        '가독성과 유지보수성 중시'
      ],
      reviewer: [
        '코드 품질과 표준 준수 확인',
        '잠재적 버그와 개선점 식별',
        '성능과 보안 측면 검토'
      ],
      debugger: [
        '문제의 근본 원인 분석',
        '체계적인 디버깅 접근',
        '재현 가능한 테스트 케이스 생성'
      ],
      optimizer: [
        '성능 병목 지점 식별',
        '메모리 사용량 최적화',
        '알고리즘 효율성 개선'
      ]
    };
    
    return behaviors[persona] || ['기본 동작'];
  }
}

export default PersonaCommand;

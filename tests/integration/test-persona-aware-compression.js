/**
 * 페르소나 인식 압축 통합 테스트
 */

import { PersonaAwareCompressor } from '../../claude-code/aiwf/ko/utils/persona-aware-compressor.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPersonaAwareCompression() {
  console.log('🧪 페르소나 인식 압축 테스트 시작...\n');

  // 테스트용 마크다운 컨텐츠
  const testContent = `
# 시스템 아키텍처 문서

## 개요
이 문서는 전체 시스템의 아키텍처를 설명합니다. 확장성과 유지보수성을 고려한 설계입니다.

## 컴포넌트 구조
- API Gateway: 모든 요청의 진입점
- 마이크로서비스: 독립적인 서비스 단위
- 데이터베이스: PostgreSQL 클러스터

## 보안 고려사항
- JWT 기반 인증
- API 키 관리
- SQL 인젝션 방어

## 프론트엔드 UI
- React 컴포넌트 구조
- 반응형 디자인
- 접근성 준수

## 데이터 분석
- 실시간 지표 수집
- 통계적 분석
- 시각화 대시보드
`;

  try {
    // 테스트 시나리오 1: 페르소나 없이 압축
    console.log('📌 시나리오 1: 일반 압축');
    const normalCompressor = new PersonaAwareCompressor('balanced');
    const normalResult = await normalCompressor.compress(testContent);
    
    console.log(`- 원본 토큰: ${normalResult.originalTokens}`);
    console.log(`- 압축 토큰: ${normalResult.compressedTokens}`);
    console.log(`- 압축률: ${normalResult.compressionRatio}%`);
    console.log(`- 페르소나: ${normalResult.metadata?.persona || '없음'}\n`);

    // 테스트 시나리오 2: 각 페르소나로 압축
    const personas = ['architect', 'security', 'frontend', 'backend', 'data_analyst'];
    
    for (const persona of personas) {
      console.log(`📌 시나리오 2-${personas.indexOf(persona) + 1}: ${persona} 페르소나 압축`);
      
      // 임시 페르소나 파일 생성
      const personaPath = path.join(__dirname, '../../.aiwf/current_persona.json');
      await fs.mkdir(path.dirname(personaPath), { recursive: true });
      await fs.writeFile(personaPath, JSON.stringify({
        persona: persona,
        timestamp: new Date().toISOString()
      }));
      
      const personaCompressor = new PersonaAwareCompressor('balanced');
      const personaResult = await personaCompressor.compress(testContent);
      
      console.log(`- 압축률: ${personaResult.compressionRatio}%`);
      console.log(`- 패턴 보존율: ${personaResult.metadata?.validation?.patternPreservationRate || 'N/A'}%`);
      console.log(`- 페르소나 정렬: ${personaResult.metadata?.validation?.personaAligned ? '✓' : '✗'}`);
      
      // 압축된 내용에서 페르소나 특화 키워드 확인
      const preserved = personaCompressor.personaStrategies[persona].preservePatterns
        .filter(pattern => personaResult.compressed.includes(pattern));
      console.log(`- 보존된 키워드: ${preserved.slice(0, 3).join(', ')}...\n`);
    }

    // 정리
    await fs.unlink(path.join(__dirname, '../../.aiwf/current_persona.json')).catch(() => {});
    
    console.log('✅ 모든 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 테스트 실행
testPersonaAwareCompression();
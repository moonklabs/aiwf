/**
 * 페르소나 행동 패턴 검증기
 * AI 페르소나별 응답 패턴을 분석하고 검증하는 모듈
 */

class PersonaBehaviorValidator {
  constructor() {
    this.behaviorPatterns = this.initializeBehaviorPatterns();
    this.validationHistory = [];
  }

  /**
   * 페르소나별 예상 행동 패턴 초기화
   * @returns {Object} 행동 패턴 정의
   */
  initializeBehaviorPatterns() {
    return {
      architect: {
        keywords: ['아키텍처', '설계', '구조', '시스템', '확장성', '모듈', '패턴', '계층'],
        responseStructure: ['overview', 'components', 'relationships', 'considerations'],
        communicationTraits: ['structured', 'logical', 'comprehensive'],
        focusAreas: ['system_design', 'scalability', 'maintainability']
      },
      frontend: {
        keywords: ['UI', 'UX', '사용자', '인터페이스', '반응형', '컴포넌트', '스타일', '애니메이션'],
        responseStructure: ['visual_description', 'user_flow', 'implementation'],
        communicationTraits: ['visual', 'user_focused', 'intuitive'],
        focusAreas: ['user_experience', 'accessibility', 'responsiveness']
      },
      backend: {
        keywords: ['API', '데이터베이스', '서버', '성능', '보안', '트랜잭션', '캐싱', '인증'],
        responseStructure: ['technical_details', 'data_flow', 'security_considerations'],
        communicationTraits: ['technical', 'precise', 'performance_oriented'],
        focusAreas: ['data_processing', 'security', 'efficiency']
      },
      data_analyst: {
        keywords: ['데이터', '분석', '통계', '지표', '인사이트', '시각화', '트렌드', '패턴'],
        responseStructure: ['data_overview', 'analysis_methods', 'insights', 'recommendations'],
        communicationTraits: ['analytical', 'data_driven', 'insightful'],
        focusAreas: ['data_analysis', 'visualization', 'insights']
      },
      security: {
        keywords: ['보안', '취약점', '암호화', '인증', '권한', '침입', '방어', '감사'],
        responseStructure: ['threat_assessment', 'vulnerabilities', 'mitigation_strategies'],
        communicationTraits: ['cautious', 'thorough', 'risk_focused'],
        focusAreas: ['security_threats', 'compliance', 'protection']
      }
    };
  }

  /**
   * 페르소나 응답 검증
   * @param {string} response - AI 응답
   * @param {string} personaName - 페르소나 이름
   * @param {string} originalPrompt - 원본 프롬프트
   * @returns {Object} 검증 결과
   */
  validateResponse(response, personaName, originalPrompt) {
    const pattern = this.behaviorPatterns[personaName];
    if (!pattern) {
      return this.createValidationResult(false, '알 수 없는 페르소나');
    }

    const validationScores = {
      keywordMatch: this.calculateKeywordMatch(response, pattern.keywords),
      structureMatch: this.analyzeResponseStructure(response, pattern.responseStructure),
      communicationMatch: this.analyzeCommunicationStyle(response, pattern.communicationTraits),
      focusMatch: this.analyzeFocusAreas(response, pattern.focusAreas)
    };

    const overallScore = this.calculateOverallScore(validationScores);
    const isValid = overallScore >= 0.7; // 70% 이상 일치 시 유효

    const result = this.createValidationResult(isValid, null, {
      personaName,
      scores: validationScores,
      overallScore,
      timestamp: new Date().toISOString(),
      responseLength: response.length,
      prompt: originalPrompt.substring(0, 100) + '...'
    });

    this.validationHistory.push(result);
    return result;
  }

  /**
   * 키워드 일치도 계산
   * @param {string} response - 응답 텍스트
   * @param {Array} keywords - 예상 키워드 목록
   * @returns {number} 일치도 점수 (0-1)
   */
  calculateKeywordMatch(response, keywords) {
    const lowerResponse = response.toLowerCase();
    let matchCount = 0;

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = lowerResponse.match(regex);
      if (matches) {
        matchCount += matches.length;
      }
    });

    // 정규화: 키워드당 평균 2회 출현을 100%로 간주
    const normalizedScore = matchCount / (keywords.length * 2);
    return Math.min(normalizedScore, 1);
  }

  /**
   * 응답 구조 분석
   * @param {string} response - 응답 텍스트
   * @param {Array} expectedStructure - 예상 구조 요소
   * @returns {number} 구조 일치도 점수 (0-1)
   */
  analyzeResponseStructure(response, expectedStructure) {
    const structureIndicators = {
      overview: ['개요', '요약', '전체적으로', '소개'],
      components: ['구성요소', '모듈', '부분', '요소'],
      relationships: ['관계', '연결', '상호작용', '통신'],
      considerations: ['고려사항', '주의점', '참고', '권장'],
      visual_description: ['화면', '디자인', '레이아웃', '색상'],
      user_flow: ['사용자 흐름', '단계', '프로세스', '경험'],
      implementation: ['구현', '코드', '개발', '적용'],
      technical_details: ['기술적', '상세', '스펙', '사양'],
      data_flow: ['데이터 흐름', '처리', '저장', '전송'],
      security_considerations: ['보안', '인증', '권한', '암호화'],
      data_overview: ['데이터 개요', '현황', '요약', '통계'],
      analysis_methods: ['분석 방법', '기법', '접근법', '도구'],
      insights: ['인사이트', '발견', '시사점', '통찰'],
      recommendations: ['제안', '권장', '추천', '개선'],
      threat_assessment: ['위협 평가', '위험', '취약점', '공격'],
      vulnerabilities: ['취약성', '약점', '문제점', '허점'],
      mitigation_strategies: ['완화 전략', '대응', '방어', '보호']
    };

    let matchedStructures = 0;
    expectedStructure.forEach(structure => {
      const indicators = structureIndicators[structure] || [];
      const hasStructure = indicators.some(indicator => 
        response.includes(indicator)
      );
      if (hasStructure) matchedStructures++;
    });

    return matchedStructures / expectedStructure.length;
  }

  /**
   * 소통 스타일 분석
   * @param {string} response - 응답 텍스트
   * @param {Array} traits - 예상 소통 특성
   * @returns {number} 스타일 일치도 점수 (0-1)
   */
  analyzeCommunicationStyle(response, traits) {
    const styleIndicators = {
      structured: {
        patterns: [/^\d+\./gm, /^-\s/gm, /^###?\s/gm],
        features: ['목록', '단계', '섹션']
      },
      logical: {
        patterns: [/따라서|그러므로|왜냐하면|결과적으로/g],
        features: ['논리적', '순차적', '인과관계']
      },
      comprehensive: {
        patterns: [/전체|모든|각각|상세히/g],
        features: ['포괄적', '완전한', '전반적']
      },
      visual: {
        patterns: [/보이는|시각적|디자인|색상|레이아웃/g],
        features: ['그래픽', '이미지', 'UI']
      },
      user_focused: {
        patterns: [/사용자|고객|경험|편의성/g],
        features: ['사용성', '접근성', '직관적']
      },
      technical: {
        patterns: [/API|데이터베이스|알고리즘|프로토콜/g],
        features: ['기술적', '전문적', '상세']
      },
      analytical: {
        patterns: [/분석|통계|데이터|지표/g],
        features: ['정량적', '객관적', '근거']
      },
      cautious: {
        patterns: [/주의|위험|취약|방어/g],
        features: ['신중한', '보수적', '안전']
      }
    };

    let totalScore = 0;
    traits.forEach(trait => {
      const indicators = styleIndicators[trait];
      if (indicators) {
        let traitScore = 0;
        
        // 패턴 매칭
        indicators.patterns.forEach(pattern => {
          const matches = response.match(pattern);
          if (matches) traitScore += 0.5;
        });

        // 특성 단어 확인
        indicators.features.forEach(feature => {
          if (response.includes(feature)) traitScore += 0.5;
        });

        totalScore += Math.min(traitScore / indicators.patterns.length, 1);
      }
    });

    return totalScore / traits.length;
  }

  /**
   * 주요 관심 영역 분석
   * @param {string} response - 응답 텍스트
   * @param {Array} focusAreas - 예상 관심 영역
   * @returns {number} 관심 영역 일치도 점수 (0-1)
   */
  analyzeFocusAreas(response, focusAreas) {
    const focusIndicators = {
      system_design: ['시스템 설계', '아키텍처', '구조', '패턴'],
      scalability: ['확장성', '스케일', '성장', '증가'],
      maintainability: ['유지보수', '관리', '수정', '업데이트'],
      user_experience: ['사용자 경험', 'UX', '편의성', '만족도'],
      accessibility: ['접근성', '장애인', '웹 표준', 'ARIA'],
      responsiveness: ['반응형', '모바일', '태블릿', '화면 크기'],
      data_processing: ['데이터 처리', '변환', '가공', '파이프라인'],
      security: ['보안', '암호화', '인증', '권한'],
      efficiency: ['효율성', '성능', '최적화', '속도'],
      data_analysis: ['데이터 분석', '통계', '집계', '추세'],
      visualization: ['시각화', '차트', '그래프', '대시보드'],
      insights: ['인사이트', '통찰', '발견', '의미'],
      security_threats: ['보안 위협', '공격', '침입', '악성'],
      compliance: ['규정 준수', '컴플라이언스', '법규', '표준'],
      protection: ['보호', '방어', '차단', '예방']
    };

    let matchedAreas = 0;
    focusAreas.forEach(area => {
      const indicators = focusIndicators[area] || [];
      const hasArea = indicators.some(indicator => 
        response.toLowerCase().includes(indicator.toLowerCase())
      );
      if (hasArea) matchedAreas++;
    });

    return matchedAreas / focusAreas.length;
  }

  /**
   * 전체 점수 계산
   * @param {Object} scores - 각 영역별 점수
   * @returns {number} 전체 점수 (0-1)
   */
  calculateOverallScore(scores) {
    const weights = {
      keywordMatch: 0.3,
      structureMatch: 0.25,
      communicationMatch: 0.25,
      focusMatch: 0.2
    };

    let weightedSum = 0;
    Object.entries(scores).forEach(([key, score]) => {
      weightedSum += score * (weights[key] || 0);
    });

    return weightedSum;
  }

  /**
   * 검증 결과 생성
   * @param {boolean} isValid - 유효성 여부
   * @param {string} error - 오류 메시지
   * @param {Object} details - 상세 정보
   * @returns {Object} 검증 결과
   */
  createValidationResult(isValid, error = null, details = {}) {
    return {
      valid: isValid,
      error,
      ...details
    };
  }

  /**
   * 페르소나별 행동 패턴 비교
   * @param {Array} responses - 여러 페르소나의 응답 목록
   * @returns {Object} 비교 분석 결과
   */
  comparePersonaBehaviors(responses) {
    const comparisons = {};
    
    // 각 페르소나별 점수 계산
    responses.forEach(({ response, personaName, prompt }) => {
      const validation = this.validateResponse(response, personaName, prompt);
      comparisons[personaName] = validation;
    });

    // 페르소나 간 차이 분석
    const personas = Object.keys(comparisons);
    const differences = {};

    for (let i = 0; i < personas.length; i++) {
      for (let j = i + 1; j < personas.length; j++) {
        const p1 = personas[i];
        const p2 = personas[j];
        const key = `${p1}_vs_${p2}`;
        
        differences[key] = {
          scoreDifference: Math.abs(
            comparisons[p1].overallScore - comparisons[p2].overallScore
          ),
          distinctiveness: this.calculateDistinctiveness(
            comparisons[p1].scores,
            comparisons[p2].scores
          )
        };
      }
    }

    return {
      individualScores: comparisons,
      pairwiseDifferences: differences,
      overallDistinctiveness: this.calculateOverallDistinctiveness(differences)
    };
  }

  /**
   * 두 페르소나 간 구별도 계산
   * @param {Object} scores1 - 첫 번째 페르소나 점수
   * @param {Object} scores2 - 두 번째 페르소나 점수
   * @returns {number} 구별도 점수
   */
  calculateDistinctiveness(scores1, scores2) {
    let totalDifference = 0;
    let count = 0;

    Object.keys(scores1).forEach(key => {
      if (scores2[key] !== undefined) {
        totalDifference += Math.abs(scores1[key] - scores2[key]);
        count++;
      }
    });

    return count > 0 ? totalDifference / count : 0;
  }

  /**
   * 전체 구별도 계산
   * @param {Object} differences - 페르소나 간 차이
   * @returns {number} 전체 구별도 점수
   */
  calculateOverallDistinctiveness(differences) {
    const values = Object.values(differences).map(d => d.distinctiveness);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return average;
  }

  /**
   * 검증 히스토리 조회
   * @param {string} personaName - 페르소나 이름 (선택)
   * @param {number} limit - 결과 수 제한
   * @returns {Array} 검증 히스토리
   */
  getValidationHistory(personaName = null, limit = 10) {
    let history = this.validationHistory;
    
    if (personaName) {
      history = history.filter(h => h.personaName === personaName);
    }

    return history.slice(-limit);
  }

  /**
   * 검증 통계 생성
   * @param {string} personaName - 페르소나 이름 (선택)
   * @returns {Object} 통계 정보
   */
  generateStatistics(personaName = null) {
    const history = personaName 
      ? this.validationHistory.filter(h => h.personaName === personaName)
      : this.validationHistory;

    if (history.length === 0) {
      return { message: '검증 기록이 없습니다.' };
    }

    const scores = history.map(h => h.overallScore);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const validCount = history.filter(h => h.valid).length;

    return {
      totalValidations: history.length,
      validCount,
      invalidCount: history.length - validCount,
      validationRate: (validCount / history.length * 100).toFixed(2) + '%',
      averageScore: average.toFixed(3),
      minScore: Math.min(...scores).toFixed(3),
      maxScore: Math.max(...scores).toFixed(3)
    };
  }
}

export default PersonaBehaviorValidator;
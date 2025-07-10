/**
 * 페르소나 응답 품질 평가 도구
 * AI 페르소나별 응답 품질을 평가하고 개선점을 제시하는 모듈
 */

class PersonaQualityEvaluator {
  constructor() {
    this.evaluationMetrics = this.initializeMetrics();
    this.evaluationHistory = [];
    this.benchmarks = this.initializeBenchmarks();
  }

  /**
   * 평가 지표 초기화
   * @returns {Object} 평가 지표 정의
   */
  initializeMetrics() {
    return {
      relevance: {
        name: '관련성',
        description: '프롬프트와 응답의 관련성',
        weight: 0.25
      },
      consistency: {
        name: '일관성',
        description: '페르소나 특성과의 일관성',
        weight: 0.25
      },
      completeness: {
        name: '완전성',
        description: '응답의 완전성과 충실도',
        weight: 0.20
      },
      clarity: {
        name: '명확성',
        description: '응답의 명확성과 이해도',
        weight: 0.15
      },
      actionability: {
        name: '실행가능성',
        description: '제안의 구체성과 실행가능성',
        weight: 0.15
      }
    };
  }

  /**
   * 페르소나별 벤치마크 초기화
   * @returns {Object} 벤치마크 기준
   */
  initializeBenchmarks() {
    return {
      architect: {
        expectedPatterns: ['시스템 구조', '컴포넌트 관계', '설계 원칙', '확장성 고려'],
        qualityThreshold: 0.8,
        responseLength: { min: 300, ideal: 800, max: 1500 }
      },
      frontend: {
        expectedPatterns: ['사용자 경험', 'UI 요소', '반응형 디자인', '접근성'],
        qualityThreshold: 0.75,
        responseLength: { min: 250, ideal: 600, max: 1200 }
      },
      backend: {
        expectedPatterns: ['API 설계', '데이터 처리', '보안 고려', '성능 최적화'],
        qualityThreshold: 0.8,
        responseLength: { min: 300, ideal: 700, max: 1400 }
      },
      data_analyst: {
        expectedPatterns: ['데이터 분석', '통계적 근거', '시각화', '인사이트'],
        qualityThreshold: 0.85,
        responseLength: { min: 400, ideal: 900, max: 1600 }
      },
      security: {
        expectedPatterns: ['보안 위협', '취약점 분석', '대응 방안', '모범 사례'],
        qualityThreshold: 0.85,
        responseLength: { min: 350, ideal: 800, max: 1500 }
      }
    };
  }

  /**
   * 응답 품질 평가
   * @param {Object} evaluationData - 평가 데이터
   * @returns {Object} 평가 결과
   */
  async evaluateResponse(evaluationData) {
    const {
      prompt,
      response,
      personaName,
      context,
      expectedOutcome = null
    } = evaluationData;

    const benchmark = this.benchmarks[personaName];
    if (!benchmark) {
      return this.createEvaluationResult(0, '알 수 없는 페르소나');
    }

    // 각 지표별 점수 계산
    const scores = {
      relevance: this.evaluateRelevance(prompt, response),
      consistency: this.evaluateConsistency(response, personaName, context),
      completeness: this.evaluateCompleteness(response, expectedOutcome),
      clarity: this.evaluateClarity(response),
      actionability: this.evaluateActionability(response, personaName)
    };

    // 가중 평균 점수 계산
    const weightedScore = this.calculateWeightedScore(scores);

    // 응답 길이 평가
    const lengthScore = this.evaluateResponseLength(response, benchmark.responseLength);

    // 패턴 매칭 점수
    const patternScore = this.evaluatePatternMatching(response, benchmark.expectedPatterns);

    // 최종 점수 계산
    const finalScore = (weightedScore * 0.7) + (lengthScore * 0.15) + (patternScore * 0.15);

    // 평가 결과 생성
    const result = {
      personaName,
      timestamp: new Date().toISOString(),
      scores: {
        individual: scores,
        weighted: weightedScore,
        length: lengthScore,
        pattern: patternScore,
        final: finalScore
      },
      quality: this.determineQualityLevel(finalScore, benchmark.qualityThreshold),
      feedback: this.generateFeedback(scores, lengthScore, patternScore, benchmark),
      recommendations: this.generateRecommendations(scores, finalScore, benchmark)
    };

    // 히스토리에 추가
    this.evaluationHistory.push(result);

    return result;
  }

  /**
   * 관련성 평가
   * @param {string} prompt - 원본 프롬프트
   * @param {string} response - AI 응답
   * @returns {number} 관련성 점수 (0-1)
   */
  evaluateRelevance(prompt, response) {
    // 프롬프트의 주요 키워드 추출
    const promptKeywords = this.extractKeywords(prompt);
    
    // 응답에서 키워드 출현 빈도 확인
    let relevanceCount = 0;
    promptKeywords.forEach(keyword => {
      if (response.toLowerCase().includes(keyword.toLowerCase())) {
        relevanceCount++;
      }
    });

    // 관련성 점수 계산
    const baseScore = promptKeywords.length > 0 
      ? relevanceCount / promptKeywords.length 
      : 0.5;

    // 응답이 질문에 직접적으로 답하는지 확인
    const directAnswerBonus = this.checkDirectAnswer(prompt, response) ? 0.2 : 0;

    return Math.min(baseScore + directAnswerBonus, 1);
  }

  /**
   * 일관성 평가
   * @param {string} response - AI 응답
   * @param {string} personaName - 페르소나 이름
   * @param {Object} context - 페르소나 컨텍스트
   * @returns {number} 일관성 점수 (0-1)
   */
  evaluateConsistency(response, personaName, context) {
    let consistencyScore = 0;
    let checks = 0;

    // 분석 접근법 일관성
    if (context.analysis_approach) {
      const approachConsistent = this.checkApproachConsistency(
        response, 
        context.analysis_approach
      );
      consistencyScore += approachConsistent ? 1 : 0;
      checks++;
    }

    // 소통 스타일 일관성
    if (context.communication_style) {
      const styleConsistent = this.checkStyleConsistency(
        response,
        context.communication_style
      );
      consistencyScore += styleConsistent ? 1 : 0;
      checks++;
    }

    // 설계 원칙 반영도
    if (context.design_principles && context.design_principles.length > 0) {
      const principlesScore = this.checkPrinciplesReflection(
        response,
        context.design_principles
      );
      consistencyScore += principlesScore;
      checks++;
    }

    return checks > 0 ? consistencyScore / checks : 0.5;
  }

  /**
   * 완전성 평가
   * @param {string} response - AI 응답
   * @param {string} expectedOutcome - 예상 결과 (선택)
   * @returns {number} 완전성 점수 (0-1)
   */
  evaluateCompleteness(response, expectedOutcome) {
    let completenessScore = 0;

    // 응답 구조 완전성
    const hasIntroduction = /^(.*요약|.*개요|.*소개)/m.test(response);
    const hasMainContent = response.length > 200;
    const hasConclusion = /(결론|요약하면|따라서|마무리)/m.test(response);

    if (hasIntroduction) completenessScore += 0.2;
    if (hasMainContent) completenessScore += 0.5;
    if (hasConclusion) completenessScore += 0.3;

    // 예상 결과와 비교 (있는 경우)
    if (expectedOutcome) {
      const outcomeMatch = this.compareWithExpectedOutcome(response, expectedOutcome);
      completenessScore = (completenessScore + outcomeMatch) / 2;
    }

    return completenessScore;
  }

  /**
   * 명확성 평가
   * @param {string} response - AI 응답
   * @returns {number} 명확성 점수 (0-1)
   */
  evaluateClarity(response) {
    let clarityScore = 1;

    // 문장 길이 확인 (너무 긴 문장은 명확성 저하)
    const sentences = response.split(/[.!?]+/);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    if (avgSentenceLength > 30) clarityScore -= 0.2;

    // 전문 용어 과다 사용 확인
    const jargonDensity = this.calculateJargonDensity(response);
    if (jargonDensity > 0.3) clarityScore -= 0.2;

    // 구조화 확인 (목록, 단계 등)
    const hasStructure = /(\d+\.|[-*]|\n##)/m.test(response);
    if (hasStructure) clarityScore += 0.1;

    // 모호한 표현 확인
    const vagueTerms = ['아마도', '어쩌면', '대략', '약간', '조금'];
    const vagueCount = vagueTerms.filter(term => response.includes(term)).length;
    clarityScore -= vagueCount * 0.05;

    return Math.max(0, Math.min(1, clarityScore));
  }

  /**
   * 실행가능성 평가
   * @param {string} response - AI 응답
   * @param {string} personaName - 페르소나 이름
   * @returns {number} 실행가능성 점수 (0-1)
   */
  evaluateActionability(response, personaName) {
    let actionabilityScore = 0;

    // 구체적인 단계나 지침 포함 여부
    const hasSteps = /(\d+[.)]\s|단계 \d+|첫째|둘째|셋째)/m.test(response);
    if (hasSteps) actionabilityScore += 0.3;

    // 구체적인 예시 포함 여부
    const hasExamples = /(예를 들어|예시|예제|다음과 같이)/m.test(response);
    if (hasExamples) actionabilityScore += 0.2;

    // 코드 스니펫 포함 여부 (기술 페르소나의 경우)
    if (['architect', 'frontend', 'backend', 'security'].includes(personaName)) {
      const hasCode = /```[\s\S]*?```/m.test(response);
      if (hasCode) actionabilityScore += 0.3;
    }

    // 구체적인 도구나 기술 언급
    const hasSpecificTools = this.checkSpecificTools(response, personaName);
    if (hasSpecificTools) actionabilityScore += 0.2;

    return Math.min(actionabilityScore, 1);
  }

  /**
   * 가중 평균 점수 계산
   * @param {Object} scores - 각 지표별 점수
   * @returns {number} 가중 평균 점수
   */
  calculateWeightedScore(scores) {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([metric, score]) => {
      const weight = this.evaluationMetrics[metric]?.weight || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * 응답 길이 평가
   * @param {string} response - AI 응답
   * @param {Object} lengthBenchmark - 길이 기준
   * @returns {number} 길이 점수 (0-1)
   */
  evaluateResponseLength(response, lengthBenchmark) {
    const responseLength = response.length;
    const { min, ideal, max } = lengthBenchmark;

    if (responseLength < min) {
      return responseLength / min;
    } else if (responseLength > max) {
      return Math.max(0, 1 - (responseLength - max) / max);
    } else if (responseLength >= min && responseLength <= ideal) {
      return 0.8 + 0.2 * ((responseLength - min) / (ideal - min));
    } else {
      return 1 - 0.2 * ((responseLength - ideal) / (max - ideal));
    }
  }

  /**
   * 패턴 매칭 평가
   * @param {string} response - AI 응답
   * @param {Array} expectedPatterns - 예상 패턴
   * @returns {number} 패턴 매칭 점수 (0-1)
   */
  evaluatePatternMatching(response, expectedPatterns) {
    let matchCount = 0;

    expectedPatterns.forEach(pattern => {
      if (response.includes(pattern)) {
        matchCount++;
      }
    });

    return matchCount / expectedPatterns.length;
  }

  /**
   * 품질 수준 결정
   * @param {number} score - 최종 점수
   * @param {number} threshold - 임계값
   * @returns {string} 품질 수준
   */
  determineQualityLevel(score, threshold) {
    if (score >= threshold) {
      return 'excellent';
    } else if (score >= threshold * 0.8) {
      return 'good';
    } else if (score >= threshold * 0.6) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * 피드백 생성
   * @param {Object} scores - 점수들
   * @param {number} lengthScore - 길이 점수
   * @param {number} patternScore - 패턴 점수
   * @param {Object} benchmark - 벤치마크
   * @returns {Array} 피드백 메시지
   */
  generateFeedback(scores, lengthScore, patternScore, benchmark) {
    const feedback = [];

    // 각 지표별 피드백
    Object.entries(scores).forEach(([metric, score]) => {
      if (score < 0.7) {
        const metricInfo = this.evaluationMetrics[metric];
        feedback.push({
          metric: metricInfo.name,
          score: score.toFixed(2),
          message: `${metricInfo.name}이(가) 낮습니다. ${metricInfo.description}을(를) 개선하세요.`
        });
      }
    });

    // 길이 피드백
    if (lengthScore < 0.8) {
      feedback.push({
        metric: '응답 길이',
        score: lengthScore.toFixed(2),
        message: '응답 길이가 적절하지 않습니다. 너무 짧거나 길지 않도록 조정하세요.'
      });
    }

    // 패턴 피드백
    if (patternScore < 0.5) {
      feedback.push({
        metric: '패턴 일치',
        score: patternScore.toFixed(2),
        message: `페르소나 특성이 부족합니다. ${benchmark.expectedPatterns.join(', ')} 등을 포함하세요.`
      });
    }

    return feedback;
  }

  /**
   * 개선 권장사항 생성
   * @param {Object} scores - 점수들
   * @param {number} finalScore - 최종 점수
   * @param {Object} benchmark - 벤치마크
   * @returns {Array} 권장사항
   */
  generateRecommendations(scores, finalScore, benchmark) {
    const recommendations = [];

    if (finalScore < benchmark.qualityThreshold) {
      // 가장 낮은 점수의 지표 찾기
      const lowestMetric = Object.entries(scores)
        .sort((a, b) => a[1] - b[1])[0];

      recommendations.push({
        priority: 'high',
        area: this.evaluationMetrics[lowestMetric[0]].name,
        suggestion: this.getSpecificRecommendation(lowestMetric[0], lowestMetric[1])
      });
    }

    // 일반적인 개선 권장사항
    if (scores.consistency < 0.8) {
      recommendations.push({
        priority: 'medium',
        area: '페르소나 일관성',
        suggestion: '페르소나의 핵심 특성을 더 명확하게 반영하세요.'
      });
    }

    if (scores.actionability < 0.7) {
      recommendations.push({
        priority: 'medium',
        area: '실행가능성',
        suggestion: '구체적인 예시와 단계별 지침을 추가하세요.'
      });
    }

    return recommendations;
  }

  /**
   * 특정 권장사항 생성
   * @param {string} metric - 지표 이름
   * @param {number} score - 점수
   * @returns {string} 권장사항
   */
  getSpecificRecommendation(metric, score) {
    const recommendations = {
      relevance: '프롬프트의 핵심 요구사항에 더 직접적으로 답변하세요.',
      consistency: '페르소나의 분석 접근법과 소통 스타일을 일관되게 유지하세요.',
      completeness: '응답에 도입부, 본문, 결론을 포함하여 완전한 구조를 갖추세요.',
      clarity: '전문 용어를 줄이고 더 명확하고 간결한 표현을 사용하세요.',
      actionability: '실제로 적용 가능한 구체적인 단계와 예시를 제공하세요.'
    };

    return recommendations[metric] || '전반적인 품질 향상이 필요합니다.';
  }

  /**
   * 키워드 추출
   * @param {string} text - 텍스트
   * @returns {Array} 키워드 목록
   */
  extractKeywords(text) {
    // 간단한 키워드 추출 (실제로는 더 정교한 알고리즘 필요)
    const stopWords = ['이', '그', '저', '것', '수', '등', '및', '를', '을', '가', '에', '의', '과', '와'];
    const words = text.split(/\s+/)
      .map(w => w.replace(/[^\w가-힣]/g, ''))
      .filter(w => w.length > 2 && !stopWords.includes(w));

    // 빈도수 계산
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // 상위 5개 키워드 반환
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * 직접 답변 확인
   * @param {string} prompt - 프롬프트
   * @param {string} response - 응답
   * @returns {boolean} 직접 답변 여부
   */
  checkDirectAnswer(prompt, response) {
    // 질문 유형 파악
    const questionPatterns = [
      { pattern: /어떻게|어떤 방법/i, answer: /방법|단계|절차/ },
      { pattern: /무엇|뭐/i, answer: /는|은|이다|입니다/ },
      { pattern: /왜|이유/i, answer: /때문|이유|원인/ },
      { pattern: /언제/i, answer: /때|시간|날짜/ },
      { pattern: /누가|누구/i, answer: /사람|담당|역할/ }
    ];

    for (const { pattern, answer } of questionPatterns) {
      if (pattern.test(prompt) && answer.test(response)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 접근법 일관성 확인
   * @param {string} response - 응답
   * @param {string} approach - 분석 접근법
   * @returns {boolean} 일관성 여부
   */
  checkApproachConsistency(response, approach) {
    const approachKeywords = {
      '시스템 설계 중심': ['시스템', '아키텍처', '구조', '설계'],
      'UI/UX 중심': ['사용자', 'UI', 'UX', '인터페이스'],
      'API 및 데이터 처리 중심': ['API', '데이터', '서버', '처리'],
      '데이터 기반 의사결정': ['데이터', '분석', '통계', '지표'],
      '보안 취약점 중심': ['보안', '취약점', '위협', '방어']
    };

    const keywords = approachKeywords[approach] || [];
    const matchCount = keywords.filter(keyword => 
      response.includes(keyword)
    ).length;

    return matchCount >= 2;
  }

  /**
   * 스타일 일관성 확인
   * @param {string} response - 응답
   * @param {string} style - 소통 스타일
   * @returns {boolean} 일관성 여부
   */
  checkStyleConsistency(response, style) {
    const stylePatterns = {
      '구조적이고 논리적': /(\d+\.|첫째|둘째|따라서|그러므로)/,
      '시각적이고 직관적': /(화면|디자인|보이는|색상|레이아웃)/,
      '기술적이고 정확함': /(정확히|구체적으로|기술적으로|명시적으로)/,
      '분석적이고 통계적': /(분석|데이터|통계|수치|지표)/,
      '신중하고 방어적': /(주의|위험|취약|보호|방어)/
    };

    const pattern = stylePatterns[style];
    return pattern ? pattern.test(response) : false;
  }

  /**
   * 설계 원칙 반영도 확인
   * @param {string} response - 응답
   * @param {Array} principles - 설계 원칙
   * @returns {number} 반영도 점수 (0-1)
   */
  checkPrinciplesReflection(response, principles) {
    const principleKeywords = {
      '확장성': ['확장', '스케일', '성장', '증가'],
      '유지보수성': ['유지보수', '관리', '수정', '업데이트'],
      '성능': ['성능', '속도', '효율', '최적화'],
      '사용성': ['사용', '편의', '직관', '쉬운'],
      '접근성': ['접근성', '장애인', '웹표준', 'ARIA'],
      '반응성': ['반응형', '모바일', '적응형', '디바이스'],
      '보안': ['보안', '암호화', '인증', '권한'],
      '효율성': ['효율', '최적', '빠른', '경제적'],
      '정확성': ['정확', '정밀', '올바른', '검증'],
      '통찰력': ['통찰', '인사이트', '발견', '의미'],
      '시각화': ['시각화', '차트', '그래프', '대시보드'],
      '보안성': ['보안', '안전', '보호', '방어'],
      '무결성': ['무결성', '완전성', '일관성', '정합성'],
      '기밀성': ['기밀', '비밀', '암호', '접근제어']
    };

    let matchScore = 0;
    principles.forEach(principle => {
      const keywords = principleKeywords[principle] || [principle];
      const hasKeyword = keywords.some(keyword => 
        response.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasKeyword) matchScore += 1;
    });

    return principles.length > 0 ? matchScore / principles.length : 0;
  }

  /**
   * 예상 결과와 비교
   * @param {string} response - 응답
   * @param {string} expectedOutcome - 예상 결과
   * @returns {number} 일치도 점수 (0-1)
   */
  compareWithExpectedOutcome(response, expectedOutcome) {
    const expectedKeywords = this.extractKeywords(expectedOutcome);
    let matchCount = 0;

    expectedKeywords.forEach(keyword => {
      if (response.toLowerCase().includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });

    return expectedKeywords.length > 0 
      ? matchCount / expectedKeywords.length 
      : 0.5;
  }

  /**
   * 전문 용어 밀도 계산
   * @param {string} response - 응답
   * @returns {number} 전문 용어 밀도
   */
  calculateJargonDensity(response) {
    // 일반적인 기술 전문 용어 목록 (확장 가능)
    const jargonTerms = [
      'API', 'REST', 'GraphQL', 'microservices', 'containerization',
      'scalability', 'throughput', 'latency', 'redundancy', 'failover',
      'encryption', 'authentication', 'authorization', 'middleware',
      'refactoring', 'polymorphism', 'encapsulation', 'abstraction'
    ];

    const words = response.split(/\s+/);
    const jargonCount = words.filter(word => 
      jargonTerms.some(term => 
        word.toLowerCase().includes(term.toLowerCase())
      )
    ).length;

    return jargonCount / words.length;
  }

  /**
   * 구체적인 도구 확인
   * @param {string} response - 응답
   * @param {string} personaName - 페르소나 이름
   * @returns {boolean} 도구 언급 여부
   */
  checkSpecificTools(response, personaName) {
    const toolsByPersona = {
      architect: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Terraform'],
      frontend: ['React', 'Vue', 'Angular', 'Webpack', 'Sass'],
      backend: ['Node.js', 'Django', 'Spring', 'PostgreSQL', 'Redis'],
      data_analyst: ['Python', 'R', 'Tableau', 'Power BI', 'SQL'],
      security: ['OWASP', 'Burp Suite', 'Wireshark', 'Metasploit', 'Nmap']
    };

    const tools = toolsByPersona[personaName] || [];
    return tools.some(tool => 
      response.toLowerCase().includes(tool.toLowerCase())
    );
  }

  /**
   * 평가 통계 생성
   * @param {string} personaName - 페르소나 이름 (선택)
   * @returns {Object} 통계 정보
   */
  generateStatistics(personaName = null) {
    let history = this.evaluationHistory;
    
    if (personaName) {
      history = history.filter(h => h.personaName === personaName);
    }

    if (history.length === 0) {
      return { message: '평가 기록이 없습니다.' };
    }

    // 평균 점수 계산
    const avgScores = {};
    Object.keys(this.evaluationMetrics).forEach(metric => {
      const scores = history.map(h => h.scores.individual[metric]);
      avgScores[metric] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    });

    // 최종 점수 통계
    const finalScores = history.map(h => h.scores.final);
    const avgFinalScore = finalScores.reduce((sum, s) => sum + s, 0) / finalScores.length;

    // 품질 수준 분포
    const qualityDistribution = {};
    history.forEach(h => {
      qualityDistribution[h.quality] = (qualityDistribution[h.quality] || 0) + 1;
    });

    return {
      evaluationCount: history.length,
      averageScores: {
        individual: avgScores,
        final: avgFinalScore.toFixed(3)
      },
      qualityDistribution,
      bestPerformingMetric: Object.entries(avgScores)
        .sort((a, b) => b[1] - a[1])[0][0],
      worstPerformingMetric: Object.entries(avgScores)
        .sort((a, b) => a[1] - b[1])[0][0]
    };
  }

  /**
   * 비교 평가 수행
   * @param {Array} responses - 여러 페르소나의 응답
   * @param {string} prompt - 공통 프롬프트
   * @returns {Object} 비교 결과
   */
  async comparePersonaResponses(responses, prompt) {
    const evaluations = {};

    // 각 페르소나 응답 평가
    for (const { personaName, response, context } of responses) {
      const evaluation = await this.evaluateResponse({
        prompt,
        response,
        personaName,
        context
      });
      evaluations[personaName] = evaluation;
    }

    // 비교 분석
    const comparison = {
      evaluations,
      ranking: Object.entries(evaluations)
        .sort((a, b) => b[1].scores.final - a[1].scores.final)
        .map(([persona, evaluation]) => ({
          persona,
          score: evaluation.scores.final,
          quality: evaluation.quality
        })),
      bestPersona: null,
      analysis: {}
    };

    // 최고 성과 페르소나
    comparison.bestPersona = comparison.ranking[0].persona;

    // 지표별 최고 성과자
    Object.keys(this.evaluationMetrics).forEach(metric => {
      const scores = Object.entries(evaluations)
        .map(([persona, evaluation]) => ({
          persona,
          score: evaluation.scores.individual[metric]
        }))
        .sort((a, b) => b.score - a.score);
      
      comparison.analysis[metric] = {
        best: scores[0],
        worst: scores[scores.length - 1]
      };
    });

    return comparison;
  }
}

export default PersonaQualityEvaluator;
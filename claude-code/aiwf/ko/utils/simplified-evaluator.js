/**
 * 경량화된 페르소나 평가기
 * 3가지 핵심 지표만으로 빠른 평가 수행
 */

export class SimplifiedEvaluator {
  constructor() {
    // 3가지 핵심 지표와 가중치
    this.coreMetrics = {
      roleAlignment: 0.5,    // 페르소나 역할 일치도
      taskRelevance: 0.3,    // 작업 관련성
      responseQuality: 0.2   // 기본 품질
    };

    // 페르소나별 핵심 키워드 (최소한만)
    this.personaKeywords = {
      architect: ['시스템', '설계', '구조', '아키텍처'],
      security: ['보안', '취약점', '암호화', '위협'],
      frontend: ['UI', 'UX', '사용자', '화면'],
      backend: ['API', '데이터베이스', '서버', '성능'],
      data_analyst: ['데이터', '분석', '통계', '인사이트']
    };

    // 간단한 피드백 메시지
    this.feedbackMessages = {
      architect: "💡 시스템 설계 관점을 더 포함해보세요",
      security: "🔒 보안 측면을 좀 더 고려해보세요",
      frontend: "🎨 사용자 경험 관점을 추가해보세요",
      backend: "⚙️ 서버/데이터 처리 관점을 강화해보세요",
      data_analyst: "📊 데이터 기반 인사이트를 더 제공해보세요"
    };
  }

  /**
   * 빠른 평가 수행
   * @param {string} response - AI 응답
   * @param {string} persona - 현재 페르소나
   * @returns {Object} 평가 결과
   */
  quickEvaluate(response, persona) {
    if (!response || !persona) {
      return { score: 1, feedback: null };
    }

    const scores = {
      roleAlignment: this.checkRoleAlignment(response, persona),
      taskRelevance: this.checkTaskRelevance(response),
      responseQuality: this.checkBasicQuality(response)
    };

    // 가중 평균 계산
    const totalScore = Object.entries(scores).reduce((sum, [metric, score]) => {
      return sum + (score * this.coreMetrics[metric]);
    }, 0);

    return {
      score: totalScore,
      scores: scores,
      needsFeedback: totalScore < 0.6,
      feedback: totalScore < 0.6 ? this.feedbackMessages[persona] : null
    };
  }

  /**
   * 페르소나 역할 일치도 체크 (간단하게)
   */
  checkRoleAlignment(response, persona) {
    const keywords = this.personaKeywords[persona] || [];
    if (keywords.length === 0) return 0.7;

    const lowerResponse = response.toLowerCase();
    const matchCount = keywords.filter(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    ).length;

    // 키워드 중 절반 이상 포함하면 높은 점수
    return matchCount >= keywords.length / 2 ? 0.9 : 0.5;
  }

  /**
   * 작업 관련성 체크 (기본값 높게)
   */
  checkTaskRelevance(response) {
    // 응답이 충분히 길면 관련성 있다고 가정
    if (response.length < 50) return 0.3;
    if (response.length < 200) return 0.6;
    return 0.8;
  }

  /**
   * 기본 품질 체크
   */
  checkBasicQuality(response) {
    // 매우 간단한 품질 체크
    const hasStructure = response.includes('\n') || response.includes('-');
    const hasContent = response.length > 100;
    
    if (hasStructure && hasContent) return 0.9;
    if (hasContent) return 0.7;
    return 0.5;
  }

  /**
   * 사용자에게 피드백이 필요한지 판단
   */
  shouldNotifyUser(score) {
    return score < 0.6;
  }

  /**
   * 부드러운 피드백 생성
   */
  getGentleFeedback(persona, score) {
    if (score >= 0.6) return null;
    return this.feedbackMessages[persona] || "💡 페르소나 특성을 더 활용해보세요";
  }
}

export default SimplifiedEvaluator;
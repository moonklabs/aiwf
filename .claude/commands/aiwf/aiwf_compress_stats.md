# aiwf compress-stats

페르소나별 압축 통계를 확인합니다.

## 실행

```javascript
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// PersonaAwareCompressor import
const { PersonaAwareCompressor } = require(path.join(
  process.cwd(), 
  'claude-code/aiwf/ko/utils/persona-aware-compressor.js'
));

try {
  const compressor = new PersonaAwareCompressor();
  const stats = compressor.getPersonaCompressionStats();
  
  console.log(chalk.cyan('📊 페르소나별 압축 통계'));
  console.log(chalk.gray('━'.repeat(50)));
  
  if (stats.currentPersona) {
    console.log(`현재 페르소나: ${chalk.yellow(stats.currentPersona)}`);
    
    if (stats.strategy) {
      console.log('\n📋 현재 페르소나 압축 전략:');
      console.log(`- 포커스 영역: ${stats.strategy.focusAreas.join(', ')}`);
      console.log(`- 요약 초점: ${stats.strategy.summarizationFocus}`);
      console.log(`- 보존 패턴: ${stats.strategy.preservePatterns.slice(0, 5).join(', ')}...`);
    }
  } else {
    console.log(chalk.yellow('⚠️  활성화된 페르소나가 없습니다.'));
  }
  
  const avgRatios = stats.averageRatioByPersona;
  if (Object.keys(avgRatios).length > 0) {
    console.log('\n📈 페르소나별 평균 압축률:');
    Object.entries(avgRatios).forEach(([persona, ratio]) => {
      const personaNames = {
        architect: 'Architect',
        security: 'Security Expert',
        frontend: 'Frontend Developer',
        backend: 'Backend Developer',
        data_analyst: 'Data Analyst'
      };
      console.log(`- ${personaNames[persona] || persona}: ${chalk.green(ratio + '%')}`);
    });
  } else {
    console.log('\n압축 히스토리가 없습니다.');
  }
  
} catch (error) {
  console.error(chalk.red('오류:'), error.message);
}
```

## 설명

페르소나별 압축 통계와 현재 활성화된 페르소나의 압축 전략을 확인합니다.

### 제공 정보

1. **현재 페르소나 정보**
   - 활성 페르소나 이름
   - 압축 전략 상세
   - 보존 패턴 목록

2. **압축 히스토리 통계**
   - 페르소나별 평균 압축률
   - 압축 성능 비교

## 활용 방법

- 페르소나별 압축 효율성 비교
- 최적의 압축 모드 선택
- 압축 전략 개선점 파악
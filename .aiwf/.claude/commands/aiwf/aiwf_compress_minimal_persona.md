# aiwf compress-minimal-persona

활성화된 페르소나를 고려하여 최소 모드로 컨텍스트를 압축합니다.

## 실행

```javascript
const { spawn } = require('child_process');
const path = require('path');

// .aiwf 디렉토리로 이동하여 명령 실행
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('node', [
  '../claude-code/aiwf/ko/commands/compress-context.js',
  'minimal',
  '--persona'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('명령 실행 실패:', err.message);
});
```

## 설명

페르소나 특성을 고려하면서도 최소한의 압축만 수행합니다. 10-30%의 낮은 압축률로 원본 내용을 최대한 보존합니다.

### 압축 전략

- 페르소나 관련 패턴은 100% 보존
- 중복 내용만 제거
- 불필요한 공백과 포맷팅 정리
- 페르소나별 중요도 점수가 평균 이상인 섹션은 그대로 유지

## 적합한 사용 사례

- 중요한 기술 문서
- 상세한 API 문서
- 보안 관련 문서
- 데이터 분석 리포트

## 결과

압축 후에도 다음이 보장됩니다:
- 모든 페르소나 관련 키워드 보존
- 문서 구조 완전 유지
- 코드 블록과 예제 보존
- 테이블과 다이어그램 유지
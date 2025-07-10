# aiwf compress-aggressive-persona

활성화된 페르소나를 고려하여 공격적 모드로 컨텍스트를 압축합니다.

## 실행

```javascript
const { spawn } = require('child_process');
const path = require('path');

// .aiwf 디렉토리로 이동하여 명령 실행
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('node', [
  '../claude-code/aiwf/ko/commands/compress-context.js',
  'aggressive',
  '--persona'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('명령 실행 실패:', err.message);
});
```

## 설명

페르소나 특성을 고려하면서도 50-70%의 높은 압축률을 목표로 합니다. 페르소나 관련 핵심 정보는 보존하되, 나머지는 적극적으로 요약합니다.

### 특징

- 페르소나 중심 요약 생성
- 핵심 패턴만 보존
- 중요도가 낮은 섹션은 요약으로 대체
- 페르소나별 summarization focus 적용

## 압축 결과

압축 후 페르소나별 요약이 문서 하단에 추가됩니다:

```markdown
---
### [페르소나명] 관점 요약

주요 내용 ([페르소나의 focus]):
- 핵심 포인트 1
- 핵심 포인트 2
- ...
---
```

## 주의사항

- 매우 높은 압축률로 인해 일부 세부 정보가 손실될 수 있습니다
- 중요한 문서는 백업 후 사용을 권장합니다
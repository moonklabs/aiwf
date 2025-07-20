# aiwf compress-stats

페르소나별 압축 통계를 확인합니다.

## 실행

```javascript
const { spawn } = require('child_process');
const path = require('path');

// .aiwf 디렉토리로 이동하여 명령 실행
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('aiwf', [
  'compress',
  '--stats'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('명령 실행 실패:', err.message);
});
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
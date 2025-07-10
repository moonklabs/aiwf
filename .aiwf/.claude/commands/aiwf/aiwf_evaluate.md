# aiwf evaluate

AI 응답 품질을 간단하게 평가합니다.

## 실행

```javascript
const { spawn } = require('child_process');
const path = require('path');

// .aiwf 디렉토리로 이동하여 명령 실행
const cwd = path.join(process.cwd(), '.aiwf');
const args = process.argv.slice(2); // 추가 인자 전달

const proc = spawn('node', [
  '../claude-code/aiwf/ko/commands/evaluate.js',
  ...args
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('명령 실행 실패:', err.message);
});
```

## 설명

경량화된 평가 시스템으로 AI 응답 품질을 모니터링합니다. 기본적으로 백그라운드에서 자동 실행되며, 필요할 때만 상세 정보를 확인할 수 있습니다.

## 사용 옵션

### 기본 사용 (빠른 평가)
```bash
aiwf evaluate
```
현재 페르소나의 최근 평가 통계를 간단히 표시합니다.

### 상세 분석
```bash
aiwf evaluate --detailed
# 또는
aiwf evaluate -d
```
모든 페르소나의 상세 통계와 개선 제안을 표시합니다.

### 평가 히스토리
```bash
aiwf evaluate --history
# 또는
aiwf evaluate -h
```
최근 10개의 평가 기록을 시간순으로 표시합니다.

### 주간 통계
```bash
aiwf evaluate --stats
# 또는
aiwf evaluate -s
```
일주일간의 평가 통계와 페르소나별 활용도를 표시합니다.

## 자동 평가 시스템

이 명령어는 수동으로 실행할 수 있지만, 실제로는 다음 상황에서 자동으로 백그라운드 평가가 수행됩니다:

- 페르소나 전환 시
- 컨텍스트 압축 시
- AI 응답 생성 후 (향후 구현)

평가 점수가 60% 미만일 때만 자동으로 피드백이 표시되므로, 작업 흐름을 방해하지 않습니다.

## 평가 기준

### 3가지 핵심 지표
1. **역할 일치도 (50%)**: 페르소나 특성 반영 정도
2. **작업 관련성 (30%)**: 요청된 작업과의 관련성
3. **기본 품질 (20%)**: 응답의 구조와 내용

### 점수 해석
- 80% 이상: 훌륭함 🎉
- 60-79%: 양호함 ✅
- 60% 미만: 개선 필요 💡

## 예시 출력

```
🔍 최근 응답 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재 페르소나: architect
평균 점수: 0.75
평가 횟수: 23
추세: 📈 개선 중
```
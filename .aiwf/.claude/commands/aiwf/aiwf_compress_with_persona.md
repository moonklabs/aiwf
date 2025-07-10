# aiwf compress-with-persona

활성화된 페르소나를 고려하여 컨텍스트를 압축합니다.

## 실행

```javascript
const { spawn } = require('child_process');
const path = require('path');

// .aiwf 디렉토리로 이동하여 명령 실행
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('node', [
  '../claude-code/aiwf/ko/commands/compress-context.js',
  'balanced',
  '--persona'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('명령 실행 실패:', err.message);
});
```

## 설명

현재 활성화된 페르소나의 특성을 고려하여 컨텍스트를 압축합니다. 페르소나별로 중요한 패턴과 키워드를 보존하며, 관련성이 낮은 내용은 더 적극적으로 압축합니다.

### 페르소나별 압축 전략

- **Architect**: 시스템 설계, 아키텍처 패턴 중심 보존
- **Security**: 보안 경고, 취약점 정보 완전 보존
- **Frontend**: UI/UX 설명, 시각적 요소 중심 보존
- **Backend**: API 명세, 데이터베이스 스키마 보존
- **Data Analyst**: 데이터 설명, 인사이트 완전 보존

## 사용 예시

```bash
# 기본 모드 (balanced)로 페르소나 인식 압축
aiwf compress-with-persona

# 다른 압축 모드와 함께 사용
aiwf compress-aggressive-persona  # aggressive 모드
aiwf compress-minimal-persona     # minimal 모드
```

## 참고

- 페르소나가 활성화되지 않은 경우 일반 압축이 수행됩니다
- 압축된 파일은 `.aiwf_compressed/` 디렉토리에 저장됩니다
- 페르소나별 중요 패턴 보존율이 리포트에 포함됩니다
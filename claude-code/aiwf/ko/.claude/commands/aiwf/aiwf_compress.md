# /compress - 통합 컨텍스트 압축 명령어

토큰 사용량을 최적화하기 위한 통합 압축 명령어입니다. 다양한 압축 모드와 페르소나별 최적화를 제공합니다.

## 사용법

```
/compress [type] [options]
```

### 압축 타입

#### 1. **context** - 기본 컨텍스트 압축
```
/compress context [mode] [path]
```
- `mode`: aggressive | balanced | minimal (기본: balanced)
- `path`: 파일/디렉토리 경로 (기본: 프로젝트 주요 문서)

#### 2. **persona** - 페르소나 기반 압축
```
/compress persona [persona_name] [level]
```
- `persona_name`: architect | developer | security | frontend | data
- `level`: 1-5 (1=최소, 5=최대 압축)

#### 3. **stats** - 압축 통계 및 분석
```
/compress stats [period]
```
- `period`: today | week | month | all

#### 4. **auto** - 자동 최적화 압축
```
/compress auto
```
- 현재 컨텍스트와 페르소나를 분석하여 최적 압축 적용

## 압축 모드별 특징

### 🔴 Aggressive (50-70% 압축)
- Critical/High 중요도만 유지
- 코드 예제 최소화
- 히스토리/로그 제거
- **사용 시기**: 토큰 한계 임박, 핵심 정보만 필요

### 🟡 Balanced (30-50% 압축)
- Critical/High/Medium 중요도 유지
- 주요 코드 예제 보존
- 최근 히스토리만 유지
- **사용 시기**: 일반적인 작업, 균형잡힌 압축

### 🟢 Minimal (10-30% 압축)
- 모든 중요도 유지
- 포맷팅 최적화
- 명백한 중복만 제거
- **사용 시기**: 상세 정보 필요, 안전한 압축

## 페르소나별 최적화

### 👷 Architect 페르소나
- 아키텍처 다이어그램 우선
- 구현 세부사항 압축
- 설계 결정 사항 보존

### 👨‍💻 Developer 페르소나
- 코드 예제 최대한 보존
- API 문서 유지
- 설계 문서 압축

### 🔒 Security 페르소나
- 보안 관련 정보 우선
- 취약점 분석 보존
- 일반 구현 압축

### 🎨 Frontend 페르소나
- UI/UX 관련 정보 우선
- 컴포넌트 구조 보존
- 백엔드 로직 압축

### 📊 Data Analyst 페르소나
- 데이터 스키마 우선
- 분석 결과 보존
- UI 관련 정보 압축

## 실행 단계

### 1. 압축 타입 결정
```bash
# 타입 파라미터 확인
TYPE="${1:-context}"  # 기본: context

case "$TYPE" in
  context|persona|stats|auto)
    echo "✅ 압축 타입: $TYPE"
    ;;
  *)
    echo "❌ 잘못된 타입. 사용 가능: context, persona, stats, auto"
    exit 1
    ;;
esac
```

### 2. Context 압축 실행
```bash
if [[ "$TYPE" == "context" ]]; then
  MODE="${2:-balanced}"
  TARGET="${3:-.}"
  
  echo "🗜️ Context 압축 시작..."
  echo "📊 모드: $MODE"
  echo "📁 대상: $TARGET"
  
  # 압축 전 토큰 카운트
  BEFORE_TOKENS=$(find "$TARGET" -name "*.md" -exec wc -w {} + | tail -1 | awk '{print $1 * 0.75}')
  echo "📈 압축 전 예상 토큰: $BEFORE_TOKENS"
  
  # 압축 실행
  aiwf compress "$MODE" "$TARGET"
  
  # 압축 후 토큰 카운트
  AFTER_TOKENS=$(find "$TARGET" -name "*.md" -exec wc -w {} + | tail -1 | awk '{print $1 * 0.75}')
  SAVED_PERCENT=$(( (BEFORE_TOKENS - AFTER_TOKENS) * 100 / BEFORE_TOKENS ))
  
  echo "📉 압축 후 예상 토큰: $AFTER_TOKENS"
  echo "💰 절약률: ${SAVED_PERCENT}%"
fi
```

### 3. Persona 압축 실행
```bash
if [[ "$TYPE" == "persona" ]]; then
  PERSONA="${2:-developer}"
  LEVEL="${3:-3}"
  
  echo "🎭 Persona 기반 압축 시작..."
  echo "👤 페르소나: $PERSONA"
  echo "📊 압축 레벨: $LEVEL/5"
  
  # 페르소나별 압축 규칙 적용
  case "$PERSONA" in
    architect)
      PRIORITIES="architecture,design,decisions"
      COMPRESS="implementation,code-details"
      ;;
    developer)
      PRIORITIES="code,api,implementation"
      COMPRESS="architecture,ui-details"
      ;;
    security)
      PRIORITIES="security,vulnerabilities,auth"
      COMPRESS="ui,styling,non-critical"
      ;;
    frontend)
      PRIORITIES="ui,components,styling"
      COMPRESS="backend,database,infrastructure"
      ;;
    data)
      PRIORITIES="schema,queries,analysis"
      COMPRESS="ui,frontend,styling"
      ;;
  esac
  
  echo "✅ 우선 보존: $PRIORITIES"
  echo "🗜️ 압축 대상: $COMPRESS"
  
  # 페르소나 기반 압축 실행
  aiwf compress --persona "$PERSONA" --level "$LEVEL"
fi
```

### 4. 압축 통계 표시
```bash
if [[ "$TYPE" == "stats" ]]; then
  PERIOD="${2:-today}"
  
  echo "📊 압축 통계 분석..."
  echo "📅 기간: $PERIOD"
  
  # 통계 수집 및 표시
  aiwf token report "$PERIOD" | grep -E "compression|saved|tokens"
  
  # 압축 히스토리
  echo -e "\n📜 최근 압축 이력:"
  tail -10 .aiwf/logs/compression.log 2>/dev/null || echo "압축 이력 없음"
  
  # 권장사항
  echo -e "\n💡 권장사항:"
  CURRENT_USAGE=$(aiwf token status | grep "percentage" | awk '{print $2}')
  if (( CURRENT_USAGE > 80 )); then
    echo "⚠️ 토큰 사용률이 높습니다. Aggressive 모드 권장"
  elif (( CURRENT_USAGE > 50 )); then
    echo "📊 적절한 사용률입니다. Balanced 모드 유지"
  else
    echo "✅ 토큰 여유가 있습니다. Minimal 모드 가능"
  fi
fi
```

### 5. 자동 최적화
```bash
if [[ "$TYPE" == "auto" ]]; then
  echo "🤖 자동 압축 최적화 시작..."
  
  # 현재 페르소나 감지
  ACTIVE_PERSONA=$(aiwf persona status | grep "active" | awk '{print $2}')
  echo "👤 활성 페르소나: ${ACTIVE_PERSONA:-none}"
  
  # 토큰 사용률 확인
  TOKEN_USAGE=$(aiwf token status | grep "percentage" | awk '{print $2}')
  echo "📊 현재 토큰 사용률: ${TOKEN_USAGE}%"
  
  # 자동 모드 결정
  if (( TOKEN_USAGE > 80 )); then
    AUTO_MODE="aggressive"
    AUTO_LEVEL="5"
  elif (( TOKEN_USAGE > 50 )); then
    AUTO_MODE="balanced"
    AUTO_LEVEL="3"
  else
    AUTO_MODE="minimal"
    AUTO_LEVEL="1"
  fi
  
  echo "🎯 자동 선택: $AUTO_MODE 모드 (레벨 $AUTO_LEVEL)"
  
  # 자동 압축 실행
  if [[ -n "$ACTIVE_PERSONA" ]]; then
    /compress persona "$ACTIVE_PERSONA" "$AUTO_LEVEL"
  else
    /compress context "$AUTO_MODE"
  fi
fi
```

## 압축 결과 저장

```bash
# 압축 로그 기록
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_ENTRY="$TIMESTAMP | Type: $TYPE | Mode: ${MODE:-$PERSONA} | Saved: ${SAVED_PERCENT:-N/A}%"
echo "$LOG_ENTRY" >> .aiwf/logs/compression.log

# 상태 업데이트
aiwf state update
```

## 출력 예시

```
🗜️ AIWF 통합 압축 도구
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 압축 분석:
├─ 타입: context
├─ 모드: balanced
├─ 대상: .aiwf/
└─ 예상 절약: 30-50%

⏳ 압축 진행 중...
[████████████████████████████████] 100%

✅ 압축 완료!
├─ 압축 전: 150,000 토큰
├─ 압축 후: 90,000 토큰
├─ 절약량: 60,000 토큰 (40%)
└─ 소요 시간: 2.3초

💡 다음 권장사항:
- 현재 모드 유지 권장
- 다음 압축 예정: 24시간 후
- 페르소나 최적화 가능: architect
```

## 주의사항

- 압축된 파일은 `.compressed` 백업 생성
- 중요 정보는 모든 모드에서 보존
- 압축 해제: `aiwf compress --restore`
- 압축 이력은 `.aiwf/logs/compression.log`에 저장

**팁**: 작업 시작 전 `auto` 모드로 자동 최적화를 실행하면 효율적입니다.
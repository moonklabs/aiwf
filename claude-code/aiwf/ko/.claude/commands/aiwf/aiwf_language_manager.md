# AIWF 언어 관리자

AIWF 프레임워크의 언어 관련 기능을 통합적으로 관리하는 명령어입니다.

## 사용법

```
/project:aiwf:language_manager [action] [arguments]
```

### 액션 종류

- `status` - 현재 언어 상태 확인
- `switch <언어코드>` - 언어 전환  
- `detect` - 시스템 언어 자동 감지
- `reset` - 언어 설정 초기화
- `test` - 언어 시스템 테스트
- `config` - 설정 파일 관리

## 실행 단계

### 1. 인수 분석 및 액션 라우팅

```bash
# 인수 파싱
ACTION="${1:-status}"
ARGUMENT="${2:-}"

echo "=== AIWF 언어 관리자 ==="
echo "액션: $ACTION"
echo "인수: $ARGUMENT"
echo ""
```

### 2. 액션별 실행

#### 2.1 상태 확인 (status)

```bash
if [ "$ACTION" = "status" ]; then
  echo "📊 언어 상태 확인 중..."
  node -e "
  import('./language-utils.js').then(async ({ getLanguageStatus }) => {
    const status = await getLanguageStatus();
    
    console.log('=== 언어 설정 상태 ===');
    console.log('감지된 언어:', status.detectedLanguage);
    console.log('설정된 언어:', status.configuredLanguage || '없음');
    console.log('현재 사용 언어:', status.effectiveLanguage);
    console.log('자동 감지:', status.autoDetect ? '활성화' : '비활성화');
    console.log('폴백 언어:', status.fallbackLanguage);
    console.log('지원 언어:', status.supportedLanguages.join(', '));
    
    if (status.error) {
      console.log('⚠️ 오류:', status.error);
    }
  });
  "
fi
```

#### 2.2 언어 전환 (switch)

```bash
if [ "$ACTION" = "switch" ]; then
  if [ -z "$ARGUMENT" ]; then
    echo "❌ 오류: 언어 코드를 지정해주세요"
    echo "사용법: /project:aiwf:language_manager switch [ko|en]"
    exit 1
  fi
  
  echo "🔄 언어 전환 중: $ARGUMENT"
  node -e "
  import('./language-utils.js').then(async ({ switchLanguage }) => {
    const result = await switchLanguage(process.argv[1]);
    
    if (result.success) {
      console.log('✅ 언어 전환 성공!');
      console.log('이전 언어:', result.previousLanguage);
      console.log('새 언어:', result.newLanguage);
    } else {
      console.error('❌ 언어 전환 실패:', result.error);
      process.exit(1);
    }
  });
  " -- "$ARGUMENT"
fi
```

#### 2.3 언어 감지 (detect)

```bash
if [ "$ACTION" = "detect" ]; then
  echo "🔍 시스템 언어 감지 중..."
  node -e "
  import('./language-utils.js').then(async ({ detectLanguage }) => {
    const detected = await detectLanguage();
    
    console.log('=== 언어 감지 결과 ===');
    console.log('감지된 언어:', detected);
    console.log('');
    console.log('환경 변수:');
    console.log('  LANG:', process.env.LANG || '설정되지 않음');
    console.log('  LC_ALL:', process.env.LC_ALL || '설정되지 않음');
    console.log('  LANGUAGE:', process.env.LANGUAGE || '설정되지 않음');
  });
  "
fi
```

#### 2.4 설정 초기화 (reset)

```bash
if [ "$ACTION" = "reset" ]; then
  echo "🗑️ 언어 설정 초기화 중..."
  
  # 설정 파일 삭제
  if [ -f ".aiwf/config/language.json" ]; then
    rm ".aiwf/config/language.json"
    echo "✅ 언어 설정 파일이 삭제되었습니다"
  else
    echo "ℹ️ 언어 설정 파일이 존재하지 않습니다"
  fi
  
  # 재감지 수행
  echo "🔄 언어 재감지 중..."
  node -e "
  import('./language-utils.js').then(async ({ detectLanguage }) => {
    const detected = await detectLanguage();
    console.log('재감지된 언어:', detected);
  });
  "
fi
```

#### 2.5 시스템 테스트 (test)

```bash
if [ "$ACTION" = "test" ]; then
  echo "🧪 언어 시스템 테스트 중..."
  node -e "
  import('./language-utils.js').then(async (utils) => {
    const { resolveCommandPath, detectLanguage, getLocalizedMessage } = utils;
    
    console.log('=== 언어 시스템 테스트 ===');
    
    // 1. 언어 감지 테스트
    const detected = await detectLanguage();
    console.log('✅ 언어 감지:', detected);
    
    // 2. 명령어 경로 해결 테스트
    const testCommands = ['aiwf_do_task', 'aiwf_commit'];
    console.log('\n📁 명령어 경로 테스트:');
    
    for (const cmd of testCommands) {
      const result = await resolveCommandPath(cmd);
      if (result.path) {
        console.log('  ✅', cmd, result.fallback ? '(폴백)' : '(직접)');
      } else {
        console.log('  ❌', cmd, '실패');
      }
    }
    
    // 3. 메시지 시스템 테스트
    console.log('\n💬 메시지 시스템 테스트:');
    const testMsg = getLocalizedMessage('LANGUAGE_NOT_SUPPORTED', detected);
    console.log('  메시지:', testMsg);
    
    console.log('\n✅ 모든 테스트 완료');
  });
  "
fi
```

#### 2.6 설정 관리 (config)

```bash
if [ "$ACTION" = "config" ]; then
  echo "⚙️ 언어 설정 파일 관리"
  
  CONFIG_FILE=".aiwf/config/language.json"
  
  if [ -f "$CONFIG_FILE" ]; then
    echo "📄 현재 설정 파일 내용:"
    cat "$CONFIG_FILE" | jq . 2>/dev/null || cat "$CONFIG_FILE"
    echo ""
    
    echo "📊 설정 파일 정보:"
    echo "  위치: $CONFIG_FILE"
    echo "  크기: $(stat -f%z "$CONFIG_FILE" 2>/dev/null || stat -c%s "$CONFIG_FILE" 2>/dev/null) bytes"
    echo "  수정일: $(stat -f%Sm "$CONFIG_FILE" 2>/dev/null || stat -c%y "$CONFIG_FILE" 2>/dev/null)"
  else
    echo "❌ 설정 파일이 존재하지 않습니다: $CONFIG_FILE"
    echo ""
    echo "💡 설정 파일을 생성하려면 언어를 설정하세요:"
    echo "   /project:aiwf:language_manager switch ko"
    echo "   /project:aiwf:language_manager switch en"
  fi
fi
```

### 3. 도움말 (기본값)

```bash
if [ "$ACTION" = "help" ] || [ "$ACTION" = "--help" ]; then
  echo "📖 AIWF 언어 관리자 도움말"
  echo ""
  echo "사용법:"
  echo "  /project:aiwf:language_manager [action] [arguments]"
  echo ""
  echo "액션:"
  echo "  status          현재 언어 상태 확인"
  echo "  switch <lang>   언어 전환 (ko|en)"
  echo "  detect          시스템 언어 자동 감지"
  echo "  reset           언어 설정 초기화"
  echo "  test            언어 시스템 테스트"
  echo "  config          설정 파일 관리"
  echo "  help            이 도움말 표시"
  echo ""
  echo "예시:"
  echo "  /project:aiwf:language_manager status"
  echo "  /project:aiwf:language_manager switch ko"
  echo "  /project:aiwf:language_manager test"
fi
```

### 4. 결과 요약

```bash
echo ""
echo "=== 실행 완료 ==="
echo "액션: $ACTION"
echo "시각: $(date '+%Y-%m-%d %H:%M:%S')"

# 현재 언어 상태 간단 표시
node -e "
import('./language-utils.js').then(async ({ detectLanguage }) => {
  const lang = await detectLanguage();
  console.log('현재 언어:', lang);
});
" 2>/dev/null || echo "현재 언어: 감지 불가"
```

## 출력 예시

### 상태 확인
```
=== AIWF 언어 관리자 ===
액션: status

📊 언어 상태 확인 중...
=== 언어 설정 상태 ===
감지된 언어: ko
설정된 언어: ko  
현재 사용 언어: ko
자동 감지: 활성화
폴백 언어: en
지원 언어: ko, en

=== 실행 완료 ===
액션: status
시각: 2025-07-03 06:25:30
현재 언어: ko
```

### 언어 전환
```
=== AIWF 언어 관리자 ===
액션: switch
인수: en

🔄 언어 전환 중: en
✅ 언어 전환 성공!
이전 언어: ko
새 언어: en

=== 실행 완료 ===
액션: switch
시각: 2025-07-03 06:25:35
현재 언어: en
```

## 관련 명령어

- `/project:aiwf:switch_language` - 간단한 언어 전환
- `/project:aiwf:language_status` - 상세한 상태 확인
- `/project:aiwf:initialize` - AIWF 초기화 (언어 선택 포함)
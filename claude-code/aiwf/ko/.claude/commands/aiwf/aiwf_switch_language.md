# AIWF 언어 전환

사용자가 AIWF 프레임워크의 언어 설정을 변경할 수 있도록 하는 명령어입니다.

## 사용법

이 명령어는 다음과 같은 경우에 사용됩니다:
- 현재 언어 설정을 다른 언어로 변경하고 싶은 경우
- 언어 설정 상태를 확인하고 싶은 경우
- 언어 감지 문제를 해결하고 싶은 경우

## 파라미터

- `<언어코드>` (선택사항): 변경할 언어 (`ko` 또는 `en`)
- 파라미터 없이 실행하면 현재 언어 상태를 표시

## 실행 단계

### 1. 현재 언어 상태 확인

먼저 현재 언어 설정 상태를 확인합니다:

```bash
node -e "
import('./language-utils.js').then(async ({ getLanguageStatus }) => {
  const status = await getLanguageStatus();
  console.log('=== AIWF 언어 설정 상태 ===');
  console.log('감지된 언어:', status.detectedLanguage);
  console.log('설정된 언어:', status.configuredLanguage || '없음');
  console.log('현재 사용 언어:', status.effectiveLanguage);
  console.log('자동 감지:', status.autoDetect ? '활성화' : '비활성화');
  console.log('폴백 언어:', status.fallbackLanguage);
  console.log('설정 파일 경로:', status.configPath);
  if (status.error) console.log('오류:', status.error);
});
"
```

### 2. 인수 분석

`<$ARGUMENTS>` 값을 확인하여 다음 중 하나를 수행합니다:

- **인수 없음**: 현재 상태만 표시하고 종료
- **유효한 언어코드 (`ko` 또는 `en`)**: 해당 언어로 전환
- **무효한 인수**: 오류 메시지 표시 후 사용법 안내

### 3. 언어 전환 실행

유효한 언어코드가 제공된 경우 언어를 전환합니다:

```bash
node -e "
import('./language-utils.js').then(async ({ switchLanguage }) => {
  const targetLanguage = process.argv[1];
  const result = await switchLanguage(targetLanguage);
  
  if (result.success) {
    console.log('✅ 언어 전환 성공!');
    console.log('이전 언어:', result.previousLanguage);
    console.log('새 언어:', result.newLanguage);
    console.log('메시지:', result.message);
  } else {
    console.error('❌ 언어 전환 실패:', result.error);
    console.log('메시지:', result.message);
  }
});
" -- $ARGUMENTS
```

### 4. 전환 후 검증

언어 전환 후 설정이 제대로 적용되었는지 확인합니다:

```bash
node -e "
import('./language-utils.js').then(async ({ getLanguageStatus }) => {
  const status = await getLanguageStatus();
  console.log('\n=== 전환 후 언어 설정 상태 ===');
  console.log('현재 사용 언어:', status.effectiveLanguage);
  console.log('설정 파일:', status.configuredLanguage ? '저장됨' : '없음');
});
"
```

### 5. 명령어 경로 테스트

새 언어로 명령어 경로가 제대로 해결되는지 테스트합니다:

```bash
node -e "
import('./language-utils.js').then(async ({ resolveCommandPath, detectLanguage }) => {
  const currentLang = await detectLanguage();
  const testCommands = ['aiwf_do_task', 'aiwf_commit', 'aiwf_initialize'];
  
  console.log('\n=== 명령어 경로 테스트 ===');
  console.log('현재 언어:', currentLang);
  
  for (const cmd of testCommands) {
    const result = await resolveCommandPath(cmd);
    if (result.path) {
      console.log('✅', cmd, '->', result.path, result.fallback ? '(폴백)' : '(직접)');
    } else {
      console.log('❌', cmd, '-> 찾을 수 없음:', result.error);
    }
  }
});
"
```

## 출력 형식

### 성공적인 언어 전환
```
✅ 언어 전환 성공!
이전 언어: en
새 언어: ko
메시지: 언어가 성공적으로 변경되었습니다

=== 전환 후 언어 설정 상태 ===
현재 사용 언어: ko
설정 파일: 저장됨

=== 명령어 경로 테스트 ===
현재 언어: ko
✅ aiwf_do_task -> claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_do_task.md (직접)
✅ aiwf_commit -> claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_commit.md (직접)
✅ aiwf_initialize -> claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_initialize.md (직접)
```

### 현재 상태 확인만 수행
```
=== AIWF 언어 설정 상태 ===
감지된 언어: ko
설정된 언어: ko
현재 사용 언어: ko
자동 감지: 활성화
폴백 언어: en
설정 파일 경로: .aiwf/config/language.json
```

### 오류 발생 시
```
❌ 언어 전환 실패: 지원되지 않는 언어입니다
메시지: 언어 변경에 실패했습니다

사용법: /project:aiwf:switch_language [ko|en]
지원 언어: ko (한국어), en (English)
```

## 주의사항

1. **설정 파일 권한**: `.aiwf/config/` 디렉토리에 쓰기 권한이 필요합니다
2. **명령어 파일 존재**: 전환하려는 언어의 명령어 파일들이 존재해야 합니다
3. **프로젝트 루트**: AIWF가 초기화된 프로젝트에서만 사용 가능합니다

## 관련 명령어

- `/project:aiwf:initialize` - AIWF 프로젝트 초기화
- `/project:aiwf:update_docs` - 문서 업데이트 (언어별)
- `/project:aiwf:help` - 도움말 (현재 언어로 표시)
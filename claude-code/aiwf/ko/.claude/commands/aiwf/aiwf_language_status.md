# AIWF 언어 상태 확인

AIWF 프레임워크의 현재 언어 설정 상태를 자세히 확인하는 명령어입니다.

## 사용법

이 명령어는 다음과 같은 정보를 제공합니다:
- 현재 감지된 시스템 언어
- 사용자가 설정한 언어 (있는 경우)
- 실제로 사용되는 언어
- 언어 설정 파일 상태
- 명령어 경로 해결 상태

## 실행 과정

### 1. 언어 상태 종합 분석

```bash
node -e "
import('./language-utils.js').then(async (utils) => {
  const { getLanguageStatus, resolveCommandPath, getLocalizedMessage } = utils;
  
  console.log('=== AIWF 언어 시스템 상태 분석 ===\n');
  
  // 기본 상태 정보
  const status = await getLanguageStatus();
  
  console.log('📍 기본 정보:');
  console.log('  감지된 언어:', status.detectedLanguage);
  console.log('  설정된 언어:', status.configuredLanguage || '없음');
  console.log('  현재 사용 언어:', status.effectiveLanguage);
  console.log('  자동 감지:', status.autoDetect ? '활성화' : '비활성화');
  console.log('  폴백 언어:', status.fallbackLanguage);
  console.log('  지원 언어:', status.supportedLanguages.join(', '));
  console.log('  설정 파일:', status.configPath);
  
  if (status.error) {
    console.log('  ⚠️ 오류:', status.error);
  }
  
  console.log('\n📂 설정 파일 상태:');
  try {
    const fs = await import('fs/promises');
    const configExists = await fs.access(status.configPath).then(() => true).catch(() => false);
    
    if (configExists) {
      const configContent = await fs.readFile(status.configPath, 'utf8');
      const config = JSON.parse(configContent);
      console.log('  ✅ 설정 파일 존재');
      console.log('  📄 내용:', JSON.stringify(config, null, 4));
    } else {
      console.log('  ❌ 설정 파일 없음');
    }
  } catch (error) {
    console.log('  ⚠️ 설정 파일 읽기 오류:', error.message);
  }
});
"
```

### 2. 환경 변수 분석

```bash
node -e "
console.log('\n🌍 시스템 환경 변수:');
console.log('  LANG:', process.env.LANG || '설정되지 않음');
console.log('  LC_ALL:', process.env.LC_ALL || '설정되지 않음');
console.log('  LANGUAGE:', process.env.LANGUAGE || '설정되지 않음');
console.log('  NODE_ENV:', process.env.NODE_ENV || '설정되지 않음');
"
```

### 3. 명령어 경로 테스트

```bash
node -e "
import('./language-utils.js').then(async ({ resolveCommandPath, detectLanguage }) => {
  console.log('\n🔍 명령어 경로 해결 테스트:');
  
  const currentLang = await detectLanguage();
  console.log('  현재 언어:', currentLang);
  
  const testCommands = [
    'aiwf_do_task',
    'aiwf_commit', 
    'aiwf_initialize',
    'aiwf_switch_language',
    'aiwf_test',
    'aiwf_code_review',
    'aiwf_project_review'
  ];
  
  for (const cmd of testCommands) {
    const result = await resolveCommandPath(cmd);
    if (result.path) {
      const status = result.fallback ? '🔄 폴백' : '✅ 직접';
      console.log('  ' + status, cmd + ':', result.language);
    } else {
      console.log('  ❌ 없음', cmd + ':', result.error);
    }
  }
});
"
```

### 4. 메시지 시스템 테스트

```bash
node -e "
import('./language-utils.js').then(async ({ getLocalizedMessage, detectLanguage }) => {
  console.log('\n💬 다국어 메시지 시스템 테스트:');
  
  const currentLang = await detectLanguage();
  console.log('  현재 언어:', currentLang);
  
  const testMessages = [
    'LANGUAGE_NOT_SUPPORTED',
    'CONFIG_LOAD_FAILED', 
    'CONFIG_SAVE_FAILED',
    'COMMAND_NOT_FOUND',
    'LANGUAGE_SWITCH_SUCCESS'
  ];
  
  for (const msgKey of testMessages) {
    const koMsg = getLocalizedMessage(msgKey, 'ko');
    const enMsg = getLocalizedMessage(msgKey, 'en');
    console.log('  ' + msgKey + ':');
    console.log('    한국어: ' + koMsg);
    console.log('    English: ' + enMsg);
  }
});
"
```

### 5. 디렉토리 구조 확인

```bash
node -e "
const fs = await import('fs/promises');
const path = await import('path');

console.log('\n📁 AIWF 디렉토리 구조:');

const checkDirs = [
  '.aiwf',
  '.aiwf/config',
  '.claude',
  '.claude/commands',
  '.claude/commands/aiwf',
  'claude-code/aiwf/ko/.claude/commands/aiwf',
  'claude-code/aiwf/en/.claude/commands/aiwf'
];

for (const dir of checkDirs) {
  try {
    const exists = await fs.access(dir).then(() => true).catch(() => false);
    if (exists) {
      const files = await fs.readdir(dir);
      console.log('  ✅', dir + ':', files.length + '개 파일');
    } else {
      console.log('  ❌', dir + ':', '디렉토리 없음');
    }
  } catch (error) {
    console.log('  ⚠️', dir + ':', '접근 오류');
  }
}
"
```

## 진단 및 권장사항

### 언어 감지 문제 해결

명령어가 다음과 같은 권장사항을 제공합니다:

1. **설정 파일이 없는 경우**:
   ```
   💡 권장사항: 언어를 명시적으로 설정하세요
   /project:aiwf:switch_language ko
   ```

2. **환경 변수 문제**:
   ```
   💡 권장사항: 환경 변수를 확인하세요
   export LANG=ko_KR.UTF-8
   ```

3. **명령어 파일 누락**:
   ```
   💡 권장사항: AIWF를 다시 설치하세요
   npx aiwf --force
   ```

## 출력 예시

```
=== AIWF 언어 시스템 상태 분석 ===

📍 기본 정보:
  감지된 언어: ko
  설정된 언어: ko
  현재 사용 언어: ko
  자동 감지: 활성화
  폴백 언어: en
  지원 언어: ko, en
  설정 파일: .aiwf/config/language.json

📂 설정 파일 상태:
  ✅ 설정 파일 존재
  📄 내용: {
      "language": "ko",
      "auto_detect": true,
      "last_updated": "2025-07-03T06:25:00.000Z",
      "fallback": "en"
  }

🌍 시스템 환경 변수:
  LANG: ko_KR.UTF-8
  LC_ALL: 설정되지 않음
  LANGUAGE: 설정되지 않음
  NODE_ENV: 설정되지 않음

🔍 명령어 경로 해결 테스트:
  현재 언어: ko
  ✅ 직접 aiwf_do_task: ko
  ✅ 직접 aiwf_commit: ko
  ✅ 직접 aiwf_initialize: ko
  ✅ 직접 aiwf_switch_language: ko
  🔄 폴백 aiwf_test: en
  ❌ 없음 aiwf_unknown: 명령어 파일을 찾을 수 없습니다

💬 다국어 메시지 시스템 테스트:
  현재 언어: ko
  LANGUAGE_NOT_SUPPORTED:
    한국어: 지원되지 않는 언어입니다
    English: Language not supported
  
📁 AIWF 디렉토리 구조:
  ✅ .aiwf: 8개 파일
  ✅ .aiwf/config: 1개 파일
  ✅ .claude: 2개 파일
  ✅ .claude/commands: 1개 파일
  ❌ .claude/commands/aiwf: 디렉토리 없음
  ✅ claude-code/aiwf/ko/.claude/commands/aiwf: 15개 파일
  ✅ claude-code/aiwf/en/.claude/commands/aiwf: 14개 파일
```
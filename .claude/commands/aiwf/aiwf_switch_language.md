# AIWF 언어 전환

AIWF 프레임워크의 언어 설정을 변경합니다.

## 사용법

```bash
# 현재 언어 상태 확인
aiwf-lang status

# 한국어로 전환
aiwf-lang set ko

# 영어로 전환
aiwf-lang set en

# 언어 설정 초기화 (자동 감지로 되돌림)
aiwf-lang reset
```

## 설명

이 명령어는 다음과 같은 경우에 사용됩니다:
- 현재 언어 설정을 다른 언어로 변경하고 싶은 경우
- 언어 설정 상태를 확인하고 싶은 경우
- 언어 감지 문제를 해결하고 싶은 경우

## 지원 언어

- `ko` - 한국어
- `en` - 영어

## 사용 예시

### 현재 상태 확인
```bash
aiwf-lang status
```

### 언어 변경
```bash
# 한국어로 변경
aiwf-lang set ko

# 영어로 변경  
aiwf-lang set en
```

## 출력 예시

### 상태 확인
```bash
$ aiwf-lang status
=== AIWF 언어 설정 상태 ===
감지된 언어: ko
설정된 언어: ko  
현재 사용 언어: ko
자동 감지: 활성화
폴백 언어: en
```

### 성공적인 언어 전환
```bash
$ aiwf-lang set en
✅ 언어 전환 성공!
이전 언어: ko
새 언어: en
언어가 성공적으로 변경되었습니다.
```

### 오류 발생 시
```bash
$ aiwf-lang set invalid
❌ 오류: 지원되지 않는 언어입니다
지원 언어: ko (한국어), en (English)
```

## 주의사항

1. **설정 파일 권한**: 설정 파일에 쓰기 권한이 필요합니다
2. **프로젝트 루트**: AIWF가 설치된 환경에서 사용 가능합니다
3. **언어 파일**: 전환하려는 언어의 리소스 파일들이 존재해야 합니다

## 관련 명령어

- `aiwf --help` - AIWF 도움말 (현재 언어로 표시)
- `aiwf feature` - Feature 관리 명령어
- `aiwf compress` - 컨텍스트 압축 명령어
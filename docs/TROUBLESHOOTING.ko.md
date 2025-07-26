# AIWF 문제 해결 가이드

[한국어](TROUBLESHOOTING.ko.md) | [English](TROUBLESHOOTING.md)

> AIWF 사용 중 발생할 수 있는 일반적인 문제와 해결 방법

## 📋 목차

1. [설치 문제](#설치-문제)
2. [명령어 실행 오류](#명령어-실행-오류)
3. [상태 관리 문제](#상태-관리-문제)
4. [Git 통합 문제](#git-통합-문제)
5. [YOLO 모드 문제](#yolo-모드-문제)
6. [성능 문제](#성능-문제)
7. [호환성 문제](#호환성-문제)
8. [FAQ](#faq)

## 설치 문제

### 전역 설치 실패

**문제**: `npm install -g aiwf` 실행 시 권한 오류

**해결책**:
```bash
# macOS/Linux
sudo npm install -g aiwf

# Windows (관리자 권한으로 실행)
npm install -g aiwf

# 또는 npm 권한 설정 변경
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### 프로젝트 설치 실패

**문제**: `aiwf install` 실행 시 오류

**원인 및 해결책**:
1. **Node.js 버전**: Node.js 16.0.0 이상 필요
   ```bash
   node --version  # 버전 확인
   ```

2. **기존 설치 충돌**: 
   ```bash
   # 기존 설치 제거
   rm -rf .aiwf
   # 재설치
   aiwf install --force
   ```

3. **권한 문제**:
   ```bash
   # 현재 디렉토리 권한 확인
   ls -la
   # 필요시 권한 변경
   chmod -R 755 .
   ```

## 명령어 실행 오류

### "Command not found" 오류

**문제**: `aiwf: command not found`

**해결책**:
```bash
# PATH 확인
echo $PATH

# npm 전역 경로 확인
npm config get prefix

# PATH에 추가 (bash)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# PATH에 추가 (zsh)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### ES 모듈 오류

**문제**: `Cannot use import statement outside a module`

**해결책**:
```bash
# Node.js 버전 확인 (16+ 필요)
node --version

# package.json에 type 추가
{
  "type": "module"
}
```

### 리소스를 찾을 수 없음

**문제**: `Resource not found: commands/...`

**해결책**:
```bash
# AIWF 재설치
aiwf install --force

# 캐시 정리
npm cache clean --force
npm install -g aiwf@latest
```

## 상태 관리 문제

### 상태 동기화 실패

**문제**: `aiwf state update` 실행 시 오류

**해결책**:
1. **상태 파일 확인**:
   ```bash
   ls -la .aiwf/state/
   ```

2. **상태 초기화**:
   ```bash
   aiwf state init --force
   ```

3. **권한 문제 해결**:
   ```bash
   chmod -R 644 .aiwf/state/*
   ```

### 순환 의존성 감지

**문제**: "Circular dependency detected"

**해결책**:
1. 의존성 확인:
   ```bash
   aiwf state validate
   ```

2. 의존성 제거:
   - 태스크 파일에서 순환 참조 수정
   - 의존성 재구성

### 상태 파일 손상

**문제**: "Invalid state file format"

**해결책**:
```bash
# 백업에서 복원
cp .aiwf/state/task-state-index.json.backup .aiwf/state/task-state-index.json

# 또는 상태 재구성
aiwf state rebuild
```

## Git 통합 문제

### Git Hook 오류

**문제**: 커밋 시 hook 오류 발생

**해결책**:
1. **Hook 확인**:
   ```bash
   ls -la .git/hooks/
   ```

2. **Hook 재설치**:
   ```bash
   ./hooks/install-hooks.sh
   ```

3. **Hook 비활성화** (임시):
   ```bash
   git commit --no-verify
   ```

### Feature ID 추출 실패

**문제**: 커밋 메시지에서 Feature ID가 인식되지 않음

**해결책**:
- 올바른 형식 사용: `FL001`, `FL002` 등
- 커밋 메시지 예:
  ```
  feat(FL001): 사용자 인증 구현
  ```

## YOLO 모드 문제

### YOLO 실행 중단

**문제**: YOLO 모드가 예기치 않게 중단됨

**해결책**:
1. **체크포인트에서 재개**:
   ```bash
   # 마지막 체크포인트 확인
   aiwf checkpoint list
   
   # 재개
   aiwf yolo --resume
   ```

2. **안전 모드 사용**:
   ```bash
   aiwf yolo --safe
   ```

### 메모리 부족

**문제**: "JavaScript heap out of memory"

**해결책**:
```bash
# Node.js 메모리 증가
export NODE_OPTIONS="--max-old-space-size=4096"

# 또는 명령어 실행 시
NODE_OPTIONS="--max-old-space-size=4096" aiwf yolo
```

### 무한 루프 감지

**문제**: YOLO가 같은 태스크를 반복 실행

**해결책**:
1. 태스크 상태 확인
2. 의존성 검증
3. 필요시 수동으로 태스크 완료:
   ```bash
   aiwf state complete TASK_ID
   ```

## 성능 문제

### 느린 명령어 실행

**원인 및 해결책**:
1. **큰 프로젝트**: 
   ```bash
   # 인덱싱 최적화
   aiwf optimize index
   ```

2. **많은 파일**:
   ```bash
   # .aiwfignore 파일 생성
   echo "node_modules/" > .aiwfignore
   echo "dist/" >> .aiwfignore
   ```

3. **캐시 문제**:
   ```bash
   # 캐시 정리
   rm -rf .aiwf/cache/*
   ```

### 높은 토큰 사용량

**해결책**:
1. **컨텍스트 압축 사용**:
   ```bash
   aiwf compress aggressive
   ```

2. **불필요한 파일 제외**:
   ```bash
   # .aiwfignore에 추가
   *.log
   *.tmp
   coverage/
   ```

## 호환성 문제

### Windows 경로 문제

**문제**: Windows에서 경로 오류

**해결책**:
```bash
# Git Bash 또는 WSL 사용 권장
# 또는 경로에 슬래시 사용
aiwf create-task "태스크" --path ./tasks/
```

### 인코딩 문제

**문제**: 한글 깨짐 현상

**해결책**:
1. **터미널 인코딩 설정**:
   ```bash
   export LANG=ko_KR.UTF-8
   export LC_ALL=ko_KR.UTF-8
   ```

2. **파일 인코딩 확인**:
   - 모든 파일을 UTF-8로 저장

## FAQ

### Q: AIWF 버전을 확인하려면?
```bash
aiwf --version
```

### Q: 업데이트하려면?
```bash
npm update -g aiwf
```

### Q: 설정을 초기화하려면?
```bash
aiwf reset --all
```

### Q: 로그를 확인하려면?
```bash
# 상세 로그 활성화
export AIWF_DEBUG=true
aiwf [명령어]

# 로그 파일 확인
cat .aiwf/logs/aiwf.log
```

### Q: 백업을 생성하려면?
```bash
# 전체 백업
tar -czf aiwf-backup.tar.gz .aiwf/

# 상태만 백업
cp -r .aiwf/state/ .aiwf/state.backup/
```

## 추가 도움말

### 디버그 모드
```bash
# 디버그 모드 활성화
AIWF_DEBUG=true aiwf [명령어]
```

### 지원 받기
1. [공식 문서](https://github.com/moonklabs/aiwf/docs) 확인
2. [GitHub 이슈](https://github.com/moonklabs/aiwf/issues) 검색
3. 새 이슈 생성 시 포함할 정보:
   - AIWF 버전 (`aiwf --version`)
   - Node.js 버전 (`node --version`)
   - 운영체제
   - 오류 메시지 전문
   - 재현 단계

---

💡 **팁**: 대부분의 문제는 `aiwf install --force`로 해결됩니다!
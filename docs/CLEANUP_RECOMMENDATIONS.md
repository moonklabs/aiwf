# AIWF 프로젝트 정리 권장사항

## ✅ 완료된 작업

1. **import 경로 수정**
   - index.js의 잘못된 경로 수정 완료
   - `./src/commands/ai-tool.js` → `./commands/ai-tool.js`

2. **미사용 파일 삭제** (4개 파일, 1,734줄 제거)
   - lib/file-batch-processor.js
   - lib/performance-benchmark.js
   - lib/template-manager.js
   - lib/cache-integration.js

## 📋 추가 권장사항

### 1. 코드 구조 개선

#### index.js 모듈화 (1,950줄 → 여러 모듈로 분리)
```
index.js
├── lib/installer.js         # 설치 로직
├── lib/validator.js         # 검증 로직
├── lib/backup-manager.js    # 백업/복원 로직
└── lib/github-client.js     # GitHub API 통신
```

#### 토큰 관리 시스템 통합
현재 8개 파일에 분산된 토큰 기능을 2개로 통합:
- `lib/token-manager.js` - 핵심 토큰 관리
- `commands/token-tracking.js` - CLI 명령어

### 2. 파일명 일관성

스네이크 케이스를 케밥 케이스로 통일:
```bash
# 변경 필요
sync-feature-commits.js → sync-feature-commits.js ✓ (완료)
feature-commit-report.js → feature-commit-report.js ✓ (완료)
scan-git-history.js → scan-git-history.js ✓ (완료)
```

### 3. 중복 기능 통합

#### 압축 시스템 (4개 → 2개)
- 유지: `utils/context-compressor.js`, `commands/compress-context.js`
- 통합: `compression-strategies.js`, `persona-aware-compressor.js`

### 4. 문서 정리

중복되거나 오래된 문서 통합:
- PRD.md와 PRD.ko.md의 정보 동기화
- 여러 개의 가이드 문서를 하나로 통합
- 사용되지 않는 문서에서만 참조되는 기능 제거

### 5. 테스트 개선

- 큰 테스트 파일 분리 (compression-test-suite.js: 1,251줄)
- 주석 처리된 테스트 코드 정리
- 실제 사용되는 유틸리티에 대한 테스트 추가

### 6. 성능 최적화

- 복잡한 메트릭 수집 간소화 (metrics-collector.js: 884줄)
- 불필요한 추상화 레벨 제거
- 캐시 시스템 단순화

## 🎯 예상 효과

- **코드 감소**: 약 20-30% 코드량 감소
- **유지보수성**: 파일 구조 명확화로 이해도 향상
- **성능**: 불필요한 추상화 제거로 성능 개선
- **일관성**: 명명 규칙 통일로 개발 경험 개선

## ⚠️ 주의사항

1. **Git 통합 파일들은 유지**: 실제로 활발히 사용 중
2. **페르소나 시스템 유지**: Claude Code 통합에 필수
3. **변경 시 테스트 필수**: 기능 손상 방지

## 🔄 단계별 진행

1. **Phase 1** (즉시): ✅ 미사용 파일 제거 (완료)
2. **Phase 2** (단기): 파일명 통일, 중복 통합
3. **Phase 3** (중기): index.js 모듈화, 테스트 개선
4. **Phase 4** (장기): 전체 구조 최적화
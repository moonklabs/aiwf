/**
 * AIWF 설치 시 다운로드할 파일 목록들
 * 이 파일은 GitHub에서 다운로드할 파일들의 사전 정의된 목록을 포함합니다.
 * 
 * ⚠️  이 파일은 자동 생성됩니다. 수동으로 편집하지 마세요!
 * 업데이트하려면: npm run update:file-lists
 * 
 * Generated at: 2025-07-22T16:39:32.225Z
 */

// Claude Code 명령어 파일 목록 (한국어와 영어 공통)
export const COMMAND_FILES = [
  'aiwf_add_sprint_task.md',
  'aiwf_analyze_milestone.md',
  'aiwf_changelog.md',
  'aiwf_check_state.md',
  'aiwf_code_review.md',
  'aiwf_commit.md',
  'aiwf_compress_aggressive_persona.md',
  'aiwf_compress_context.md',
  'aiwf_compress_minimal_persona.md',
  'aiwf_compress_stats.md',
  'aiwf_compress_with_persona.md',
  'aiwf_create_general_task.md',
  'aiwf_create_milestone_plan.md',
  'aiwf_create_prd.md',
  'aiwf_create_sprint_tasks.md',
  'aiwf_create_sprints_from_milestone.md',
  'aiwf_create_testcase.md',
  'aiwf_default_mode.md',
  'aiwf_discuss_review.md',
  'aiwf_do_task.md',
  'aiwf_docs.md',
  'aiwf_evaluate.md',
  'aiwf_infinite.md',
  'aiwf_initialize.md',
  'aiwf_issue_create.md',
  'aiwf_mermaid.md',
  'aiwf_next_action.md',
  'aiwf_persona_architect.md',
  'aiwf_persona_backend.md',
  'aiwf_persona_data_analyst.md',
  'aiwf_persona_frontend.md',
  'aiwf_persona_security.md',
  'aiwf_persona_status.md',
  'aiwf_pr_create.md',
  'aiwf_prime.md',
  'aiwf_project_review.md',
  'aiwf_project_status.md',
  'aiwf_smart_complete.md',
  'aiwf_smart_start.md',
  'aiwf_test.md',
  'aiwf_testing_review.md',
  'aiwf_tm-run-all-subtask.md',
  'aiwf_transition.md',
  'aiwf_ultrathink_code_advanced.md',
  'aiwf_ultrathink_code_basic.md',
  'aiwf_ultrathink_general.md',
  'aiwf_update_docs.md',
  'aiwf_update_state.md',
  'aiwf_validate_state.md',
  'aiwf_validate_workflow.md',
  'aiwf_workflow_context.md',
  'aiwf_yolo.md'
];

// 글로벌 룰 파일 목록
export const GLOBAL_RULES_FILES = [
  'aiwf-code-style-guide.md',
  'aiwf-coding-principles.md',
  'aiwf-development-process.md',
  'aiwf-global-rules.md'
];

// 수동 룰 파일 목록
export const MANUAL_RULES_FILES = [
  'aiwf-generate-plan-docs.md'
];

// 템플릿 파일 목록 (향후 추가 예정)
export const TEMPLATE_FILES = [
  // 템플릿 파일들이 추가되면 여기에 나열
];

// 프롬프트 파일 목록 (향후 추가 예정)
export const PROMPT_FILES = [
  // 프롬프트 파일들이 추가되면 여기에 나열
];

// 모든 파일 목록을 하나의 객체로 export
export const FILE_LISTS = {
  COMMAND_FILES,
  GLOBAL_RULES_FILES,
  MANUAL_RULES_FILES,
  TEMPLATE_FILES,
  PROMPT_FILES
};

// 개별 카테고리별 파일 수 정보
export const FILE_COUNTS = {
  commands: COMMAND_FILES.length,
  globalRules: GLOBAL_RULES_FILES.length,
  manualRules: MANUAL_RULES_FILES.length,
  templates: TEMPLATE_FILES.length,
  prompts: PROMPT_FILES.length,
  total: COMMAND_FILES.length + GLOBAL_RULES_FILES.length + MANUAL_RULES_FILES.length + TEMPLATE_FILES.length + PROMPT_FILES.length
};

/**
 * 특정 언어의 파일 존재 여부 확인을 위한 헬퍼 함수들
 */

/**
 * 언어별로 존재하지 않을 수 있는 파일들을 필터링
 * @param {Array<string>} fileList - 원본 파일 목록
 * @param {string} language - 언어 코드 (ko, en)
 * @returns {Array<string>} 필터링된 파일 목록
 */
export function filterFilesByLanguage(fileList, language) {
  // 일부 파일들은 특정 언어에만 존재할 수 있음
  const languageSpecificFiles = {
    ko: [
      // 한국어에만 있는 파일들 (현재는 없음)
    ],
    en: [
      // 영어에만 있는 파일들 (현재는 없음)
    ]
  };
  
  // 현재는 모든 파일이 두 언어 모두 존재한다고 가정
  return fileList;
}

/**
 * 파일 목록 업데이트를 위한 헬퍼 함수
 * 실제 디렉토리를 스캔하여 파일 목록을 업데이트할 수 있는 함수
 */
export function getLatestFileList() {
  // 이 함수는 향후 자동 업데이트 기능 구현 시 사용
  return {
    commands: COMMAND_FILES,
    globalRules: GLOBAL_RULES_FILES,
    manualRules: MANUAL_RULES_FILES,
    templates: TEMPLATE_FILES,
    prompts: PROMPT_FILES
  };
}
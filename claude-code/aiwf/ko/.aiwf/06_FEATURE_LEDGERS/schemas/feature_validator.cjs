/**
 * AIWF Feature Ledger 스키마 검증 함수
 * Feature 데이터의 유효성을 검증하고 오류를 반환합니다.
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

class FeatureValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    
    // Feature 스키마 로드
    const schemaPath = path.join(__dirname, 'feature_schema.json');
    this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    this.validate = this.ajv.compile(this.schema);
  }

  /**
   * Feature 데이터 검증
   * @param {Object} featureData - 검증할 Feature 데이터
   * @returns {Object} 검증 결과 { valid: boolean, errors: Array }
   */
  validateFeature(featureData) {
    const isValid = this.validate(featureData);
    
    return {
      valid: isValid,
      errors: isValid ? [] : this.formatErrors(this.validate.errors),
      data: featureData
    };
  }

  /**
   * Feature ID 형식 검증
   * @param {string} featureId - 검증할 Feature ID
   * @returns {boolean} 유효성 여부
   */
  validateFeatureId(featureId) {
    const pattern = /^FL[0-9]{3}$/;
    return pattern.test(featureId);
  }

  /**
   * 마일스톤 ID 형식 검증
   * @param {string} milestoneId - 검증할 마일스톤 ID
   * @returns {boolean} 유효성 여부
   */
  validateMilestoneId(milestoneId) {
    const pattern = /^M[0-9]{2}$/;
    return pattern.test(milestoneId);
  }

  /**
   * Feature 상태 검증
   * @param {string} status - 검증할 상태
   * @returns {boolean} 유효성 여부
   */
  validateStatus(status) {
    const validStatuses = ['draft', 'active', 'on-hold', 'completed', 'archived'];
    return validStatuses.includes(status);
  }

  /**
   * 우선순위 검증
   * @param {string} priority - 검증할 우선순위
   * @returns {boolean} 유효성 여부
   */
  validatePriority(priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    return validPriorities.includes(priority);
  }

  /**
   * 의존성 검증 (순환 참조 확인)
   * @param {string} featureId - 현재 Feature ID
   * @param {Array} dependencies - 의존성 목록
   * @param {Array} allFeatures - 전체 Feature 목록
   * @returns {Object} 검증 결과
   */
  validateDependencies(featureId, dependencies, allFeatures = []) {
    const result = {
      valid: true,
      errors: [],
      circularDependencies: []
    };

    // 의존성 Feature ID 형식 검증
    for (const depId of dependencies) {
      if (!this.validateFeatureId(depId)) {
        result.valid = false;
        result.errors.push(`Invalid dependency feature ID format: ${depId}`);
      }
    }

    // 순환 참조 검증
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (currentId, deps) => {
      if (recursionStack.has(currentId)) {
        result.circularDependencies.push(currentId);
        return true;
      }
      
      if (visited.has(currentId)) {
        return false;
      }
      
      visited.add(currentId);
      recursionStack.add(currentId);
      
      const currentFeature = allFeatures.find(f => f.feature_id === currentId);
      const currentDeps = currentFeature ? currentFeature.dependencies : [];
      
      for (const depId of currentDeps) {
        if (hasCycle(depId, allFeatures)) {
          return true;
        }
      }
      
      recursionStack.delete(currentId);
      return false;
    };

    if (hasCycle(featureId, allFeatures)) {
      result.valid = false;
      result.errors.push(`Circular dependency detected for feature ${featureId}`);
    }

    return result;
  }

  /**
   * Git 브랜치명 검증
   * @param {Array} branches - 브랜치명 배열
   * @returns {Object} 검증 결과
   */
  validateGitBranches(branches) {
    const result = {
      valid: true,
      errors: []
    };

    const branchPattern = /^[a-zA-Z0-9/_-]+$/;
    
    for (const branch of branches) {
      if (!branchPattern.test(branch)) {
        result.valid = false;
        result.errors.push(`Invalid git branch name: ${branch}`);
      }
      
      // Git 브랜치명 길이 제한 (일반적으로 255자)
      if (branch.length > 255) {
        result.valid = false;
        result.errors.push(`Branch name too long: ${branch}`);
      }
    }

    return result;
  }

  /**
   * 날짜 형식 검증
   * @param {string} dateString - 검증할 날짜 문자열
   * @returns {boolean} 유효성 여부
   */
  validateDateTime(dateString) {
    try {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
    } catch (error) {
      return false;
    }
  }

  /**
   * 작업 시간 검증
   * @param {number} estimated - 예상 시간
   * @param {number} actual - 실제 시간
   * @returns {Object} 검증 결과
   */
  validateWorkHours(estimated, actual) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // 기본 범위 검증
    if (estimated < 0 || estimated > 1000) {
      result.valid = false;
      result.errors.push(`Estimated hours out of range: ${estimated}`);
    }

    if (actual < 0 || actual > 1000) {
      result.valid = false;
      result.errors.push(`Actual hours out of range: ${actual}`);
    }

    // 비즈니스 로직 검증
    if (actual > estimated * 2) {
      result.warnings.push(`Actual hours significantly exceed estimated: ${actual} vs ${estimated}`);
    }

    if (estimated > 0 && actual === 0) {
      result.warnings.push('Work has been estimated but no actual hours recorded');
    }

    return result;
  }

  /**
   * 태그 검증
   * @param {Array} tags - 태그 배열
   * @returns {Object} 검증 결과
   */
  validateTags(tags) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    const validCategories = [
      'frontend', 'backend', 'api', 'database', 'ui', 'ux',
      'feature', 'enhancement', 'bugfix', 'refactor', 'docs',
      'simple', 'complex', 'critical', 'auth', 'payment',
      'notification', 'search', 'admin', 'security', 'core'
    ];

    for (const tag of tags) {
      // 길이 검증
      if (tag.length < 1 || tag.length > 30) {
        result.valid = false;
        result.errors.push(`Tag length out of range: ${tag}`);
      }

      // 형식 검증 (알파벳, 숫자, 하이픈만 허용)
      if (!/^[a-zA-Z0-9-_]+$/.test(tag)) {
        result.valid = false;
        result.errors.push(`Invalid tag format: ${tag}`);
      }

      // 권장 태그 체크 (경고)
      if (!validCategories.includes(tag.toLowerCase())) {
        result.warnings.push(`Non-standard tag used: ${tag}`);
      }
    }

    // 중복 태그 체크
    const uniqueTags = new Set(tags);
    if (uniqueTags.size !== tags.length) {
      result.warnings.push('Duplicate tags found');
    }

    return result;
  }

  /**
   * 종합 Feature 검증
   * @param {Object} featureData - Feature 데이터
   * @param {Array} allFeatures - 전체 Feature 목록 (의존성 검증용)
   * @returns {Object} 종합 검증 결과
   */
  validateFeatureComprehensive(featureData, allFeatures = []) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      details: {}
    };

    // 기본 스키마 검증
    const schemaResult = this.validateFeature(featureData);
    result.valid = result.valid && schemaResult.valid;
    result.errors.push(...schemaResult.errors);

    // 의존성 검증
    if (featureData.dependencies && featureData.dependencies.length > 0) {
      const depResult = this.validateDependencies(
        featureData.feature_id,
        featureData.dependencies,
        allFeatures
      );
      result.valid = result.valid && depResult.valid;
      result.errors.push(...depResult.errors);
      result.details.dependencies = depResult;
    }

    // Git 브랜치 검증
    if (featureData.git_branches) {
      const branchResult = this.validateGitBranches(featureData.git_branches);
      result.valid = result.valid && branchResult.valid;
      result.errors.push(...branchResult.errors);
      result.details.git_branches = branchResult;
    }

    // 작업 시간 검증
    const hoursResult = this.validateWorkHours(
      featureData.estimated_hours,
      featureData.actual_hours
    );
    result.valid = result.valid && hoursResult.valid;
    result.errors.push(...hoursResult.errors);
    result.warnings.push(...hoursResult.warnings);
    result.details.work_hours = hoursResult;

    // 태그 검증
    if (featureData.tags) {
      const tagResult = this.validateTags(featureData.tags);
      result.valid = result.valid && tagResult.valid;
      result.errors.push(...tagResult.errors);
      result.warnings.push(...tagResult.warnings);
      result.details.tags = tagResult;
    }

    return result;
  }

  /**
   * 오류 메시지 포맷팅
   * @param {Array} errors - AJV 오류 배열
   * @returns {Array} 포맷된 오류 메시지
   */
  formatErrors(errors) {
    return errors.map(error => {
      const { instancePath, message, params } = error;
      const field = instancePath.replace('/', '') || 'root';
      
      return {
        field,
        message,
        value: params?.missingProperty || 'unknown',
        path: instancePath
      };
    });
  }

  /**
   * 검증 리포트 생성
   * @param {Object} validationResult - 검증 결과
   * @returns {string} 포맷된 리포트
   */
  generateReport(validationResult) {
    const { valid, errors, warnings, details } = validationResult;
    
    let report = `\n=== Feature Validation Report ===\n`;
    report += `Status: ${valid ? '✅ VALID' : '❌ INVALID'}\n`;
    
    if (errors.length > 0) {
      report += `\nErrors (${errors.length}):\n`;
      errors.forEach((error, index) => {
        report += `  ${index + 1}. ${error.field}: ${error.message}\n`;
      });
    }
    
    if (warnings.length > 0) {
      report += `\nWarnings (${warnings.length}):\n`;
      warnings.forEach((warning, index) => {
        report += `  ${index + 1}. ${warning}\n`;
      });
    }
    
    if (details) {
      report += `\nValidation Details:\n`;
      Object.keys(details).forEach(key => {
        const detail = details[key];
        report += `  ${key}: ${detail.valid ? '✅' : '❌'}\n`;
      });
    }
    
    return report;
  }
}

// 사용 예시 및 테스트
if (require.main === module) {
  const validator = new FeatureValidator();
  
  // 샘플 데이터 검증
  const sampleFeature = {
    feature_id: "FL001",
    title: "사용자 인증 시스템",
    description: "JWT 기반 사용자 인증 시스템 구현",
    status: "active",
    priority: "high",
    milestone_id: "M02",
    assignee: "moonklabs",
    created_date: "2025-07-08T20:55:00+0900",
    updated_date: "2025-07-08T20:55:00+0900",
    estimated_hours: 24,
    actual_hours: 8,
    tags: ["authentication", "security", "core"],
    dependencies: [],
    git_branches: ["feature/FL001-user-auth"]
  };
  
  const result = validator.validateFeatureComprehensive(sampleFeature);
  console.log(validator.generateReport(result));
}

module.exports = FeatureValidator;
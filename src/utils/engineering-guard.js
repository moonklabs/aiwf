/**
 * 오버엔지니어링 방지 가드
 * YOLO 모드에서 과도한 복잡성을 방지하는 유틸리티
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export class EngineeringGuard {
  constructor(configPath = null) {
    this.config = null;
    this.violations = [];
    this.warnings = [];
    
    if (configPath) {
      this.loadConfig(configPath);
    }
  }

  /**
   * 설정 파일 로드
   */
  async loadConfig(configPath) {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const yoloConfig = yaml.load(content);
      this.config = yoloConfig.overengineering_prevention || {};
    } catch (error) {
      // 기본 설정 사용
      this.config = {
        max_file_lines: 300,
        max_function_lines: 50,
        max_nesting_depth: 4,
        max_abstraction_layers: 3,
        limit_design_patterns: true,
        no_future_proofing: true
      };
    }
  }

  /**
   * 파일 복잡도 검사
   */
  async checkFileComplexity(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // 파일 크기 검사
      if (lines.length > this.config.max_file_lines) {
        this.violations.push({
          type: 'file_too_large',
          file: filePath,
          lines: lines.length,
          limit: this.config.max_file_lines,
          severity: 'high'
        });
      }
      
      // 함수 크기 검사 (간단한 휴리스틱)
      const functions = this.extractFunctions(content);
      for (const func of functions) {
        if (func.lines > this.config.max_function_lines) {
          this.violations.push({
            type: 'function_too_large',
            file: filePath,
            function: func.name,
            lines: func.lines,
            limit: this.config.max_function_lines,
            severity: 'medium'
          });
        }
      }
      
      // 중첩 깊이 검사
      const maxNesting = this.calculateMaxNesting(content);
      if (maxNesting > this.config.max_nesting_depth) {
        this.violations.push({
          type: 'excessive_nesting',
          file: filePath,
          depth: maxNesting,
          limit: this.config.max_nesting_depth,
          severity: 'medium'
        });
      }
      
      // 디자인 패턴 과용 검사
      if (this.config.limit_design_patterns) {
        const patterns = this.detectDesignPatterns(content);
        if (patterns.length > 2) {
          this.warnings.push({
            type: 'too_many_patterns',
            file: filePath,
            patterns: patterns,
            message: '단순한 해결책을 고려하세요'
          });
        }
      }
      
      // 미래 대비 코드 검사
      if (this.config.no_future_proofing) {
        const futureProofing = this.detectFutureProofing(content);
        if (futureProofing.length > 0) {
          this.warnings.push({
            type: 'future_proofing',
            file: filePath,
            instances: futureProofing,
            message: 'YAGNI (You Ain\'t Gonna Need It) 원칙을 따르세요'
          });
        }
      }
      
    } catch (error) {
      // 파일 읽기 실패는 무시
    }
  }

  /**
   * 함수 추출 (간단한 패턴 매칭)
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');
    
    // JavaScript/TypeScript 함수 패턴
    const functionPatterns = [
      /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
      /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]+)\s*=>/,
      /^\s*(\w+)\s*\([^)]*\)\s*\{/,
      /^\s*(?:async\s+)?(\w+)\s*:\s*(?:async\s+)?(?:\([^)]*\)|[^=]+)\s*=>/
    ];
    
    let currentFunction = null;
    let braceCount = 0;
    
    lines.forEach((line, index) => {
      // 함수 시작 감지
      if (!currentFunction) {
        for (const pattern of functionPatterns) {
          const match = line.match(pattern);
          if (match) {
            currentFunction = {
              name: match[1],
              startLine: index,
              lines: 0
            };
            braceCount = 0;
            break;
          }
        }
      }
      
      // 중괄호 카운트
      if (currentFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        // 함수 끝 감지
        if (braceCount === 0 && line.includes('}')) {
          currentFunction.lines = index - currentFunction.startLine + 1;
          functions.push(currentFunction);
          currentFunction = null;
        }
      }
    });
    
    return functions;
  }

  /**
   * 최대 중첩 깊이 계산
   */
  calculateMaxNesting(content) {
    const lines = content.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;
    
    lines.forEach(line => {
      // 들여쓰기 기반 간단한 계산
      const indent = line.match(/^(\s*)/)[1].length;
      const depth = Math.floor(indent / 2); // 2 spaces = 1 level
      
      // 중괄호 기반 계산도 추가
      currentDepth += (line.match(/\{/g) || []).length;
      currentDepth -= (line.match(/\}/g) || []).length;
      
      maxDepth = Math.max(maxDepth, Math.max(depth, currentDepth));
    });
    
    return maxDepth;
  }

  /**
   * 디자인 패턴 감지
   */
  detectDesignPatterns(content) {
    const patterns = [];
    
    // 일반적인 패턴 키워드
    const patternKeywords = {
      'Factory': /class\s+\w*Factory|createFactory|factory\s*:/i,
      'Singleton': /getInstance|singleton|private\s+constructor/i,
      'Observer': /subscribe|unsubscribe|notify|observer|listeners/i,
      'Strategy': /strategy|setStrategy|executeStrategy/i,
      'Decorator': /decorator|@\w+|wrapped|enhance/i,
      'Adapter': /adapter|adapt|wrapper/i,
      'Proxy': /proxy|handler|intercept/i
    };
    
    for (const [pattern, regex] of Object.entries(patternKeywords)) {
      if (regex.test(content)) {
        patterns.push(pattern);
      }
    }
    
    return patterns;
  }

  /**
   * 미래 대비 코드 감지
   */
  detectFutureProofing(content) {
    const instances = [];
    
    // 미래 대비 코드 패턴
    const futurePatterns = [
      { pattern: /TODO:?\s*(?:future|later|someday|eventually)/gi, type: 'future_todo' },
      { pattern: /FIXME:?\s*(?:when|if|after)/gi, type: 'conditional_fixme' },
      { pattern: /\/\/\s*(?:Will|Might|Could)\s+(?:be|need|require)/gi, type: 'speculative_comment' },
      { pattern: /reserved|future[Uu]se|placeholder|notImplemented/g, type: 'reserved_code' },
      { pattern: /version\s*[><=]+\s*['"]?\d+\.\d+/g, type: 'version_check' },
      { pattern: /deprecated.*future/gi, type: 'future_deprecation' }
    ];
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const { pattern, type } of futurePatterns) {
        const matches = line.match(pattern);
        if (matches) {
          instances.push({
            type,
            line: index + 1,
            content: line.trim(),
            matches
          });
        }
      }
    });
    
    return instances;
  }

  /**
   * 프로젝트 전체 검사
   */
  async checkProject(projectPath, filePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']) {
    this.violations = [];
    this.warnings = [];
    
    // 간단한 파일 목록 수집 (실제로는 glob 패턴 사용 필요)
    const checkDir = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await checkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
            await this.checkFileComplexity(fullPath);
          }
        }
      }
    };
    
    await checkDir(projectPath);
    
    return this.generateReport();
  }

  /**
   * 검사 결과 리포트 생성
   */
  generateReport() {
    const report = {
      passed: this.violations.length === 0,
      violations: this.violations,
      warnings: this.warnings,
      summary: {
        total_violations: this.violations.length,
        high_severity: this.violations.filter(v => v.severity === 'high').length,
        medium_severity: this.violations.filter(v => v.severity === 'medium').length,
        warnings: this.warnings.length
      },
      recommendations: []
    };
    
    // 권장사항 생성
    if (report.summary.high_severity > 0) {
      report.recommendations.push('큰 파일을 작은 모듈로 분할하세요');
    }
    
    if (this.violations.some(v => v.type === 'function_too_large')) {
      report.recommendations.push('긴 함수를 더 작은 단위로 리팩토링하세요');
    }
    
    if (this.violations.some(v => v.type === 'excessive_nesting')) {
      report.recommendations.push('조기 반환(early return)을 사용하여 중첩을 줄이세요');
    }
    
    if (this.warnings.some(w => w.type === 'too_many_patterns')) {
      report.recommendations.push('필요한 경우가 아니면 단순한 해결책을 선택하세요');
    }
    
    if (this.warnings.some(w => w.type === 'future_proofing')) {
      report.recommendations.push('현재 요구사항에만 집중하세요 (YAGNI)');
    }
    
    return report;
  }

  /**
   * 실시간 피드백 제공
   */
  async provideFeedback(filePath, content = null) {
    if (!content) {
      content = await fs.readFile(filePath, 'utf-8');
    }
    
    const feedback = [];
    const lines = content.split('\n');
    
    // 즉각적인 피드백 규칙
    if (lines.length > this.config.max_file_lines * 0.8) {
      feedback.push({
        level: 'warning',
        message: `파일이 너무 커지고 있습니다 (${lines.length}/${this.config.max_file_lines} 줄). 분할을 고려하세요.`
      });
    }
    
    // 복잡한 조건문 감지
    const complexConditions = content.match(/if\s*\([^)]{50,}\)/g);
    if (complexConditions && complexConditions.length > 0) {
      feedback.push({
        level: 'suggestion',
        message: '복잡한 조건문을 별도의 함수로 추출하는 것을 고려하세요.'
      });
    }
    
    // 과도한 주석 감지
    const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
    if (commentLines > codeLines * 0.5) {
      feedback.push({
        level: 'info',
        message: '코드보다 주석이 많습니다. 코드 자체가 문서가 되도록 리팩토링을 고려하세요.'
      });
    }
    
    return feedback;
  }
}

// 싱글톤 인스턴스
let guardInstance = null;

/**
 * EngineeringGuard 인스턴스 가져오기
 */
export function getEngineeringGuard(configPath = null) {
  if (!guardInstance) {
    guardInstance = new EngineeringGuard(configPath);
  }
  return guardInstance;
}

/**
 * 빠른 검사 헬퍼 함수
 */
export async function quickCheck(filePath) {
  const guard = getEngineeringGuard();
  await guard.checkFileComplexity(filePath);
  return guard.generateReport();
}

export default EngineeringGuard;
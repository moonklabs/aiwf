import tiktoken from 'tiktoken';
import fs from 'fs';
import path from 'path';

/**
 * 토큰 카운팅 및 분석을 위한 유틸리티 클래스
 */
export class TokenCounter {
  constructor(model = 'gpt-4') {
    this.model = model;
    this.encoder = tiktoken.get_encoding('cl100k_base'); // GPT-4 기본 인코딩
  }

  /**
   * 텍스트의 토큰 수를 계산합니다
   * @param {string} text - 분석할 텍스트
   * @returns {number} 토큰 수
   */
  countTokens(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    
    try {
      return this.encoder.encode(text).length;
    } catch (error) {
      console.error('토큰 카운팅 중 오류 발생:', error);
      return 0;
    }
  }

  /**
   * 파일의 토큰 수를 계산합니다
   * @param {string} filePath - 파일 경로
   * @returns {number} 토큰 수
   */
  countFileTokens(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      return this.countTokens(content);
    } catch (error) {
      console.error(`파일 토큰 카운팅 중 오류 발생 (${filePath}):`, error);
      return 0;
    }
  }

  /**
   * 디렉토리의 모든 마크다운 파일 토큰 수를 계산합니다
   * @param {string} dirPath - 디렉토리 경로
   * @returns {number} 총 토큰 수
   */
  countDirectoryTokens(dirPath) {
    try {
      const files = this.getMarkdownFiles(dirPath);
      return files.reduce((total, file) => {
        return total + this.countFileTokens(file);
      }, 0);
    } catch (error) {
      console.error(`디렉토리 토큰 카운팅 중 오류 발생 (${dirPath}):`, error);
      return 0;
    }
  }

  /**
   * 디렉토리에서 마크다운 파일 목록을 가져옵니다
   * @param {string} dirPath - 디렉토리 경로
   * @returns {Array<string>} 마크다운 파일 경로 배열
   */
  getMarkdownFiles(dirPath) {
    const files = [];
    
    try {
      if (!fs.existsSync(dirPath)) {
        return files;
      }

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...this.getMarkdownFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`마크다운 파일 탐색 중 오류 발생 (${dirPath}):`, error);
    }
    
    return files;
  }

  /**
   * 콘텐츠의 토큰 분포를 분석합니다
   * @param {string} content - 분석할 콘텐츠
   * @returns {Array<Object>} 섹션별 토큰 분포 정보
   */
  analyzeTokenDistribution(content) {
    try {
      const sections = this.parseSections(content);
      const totalTokens = this.countTokens(content);
      
      return sections.map(section => ({
        name: section.name,
        tokens: this.countTokens(section.content),
        percentage: totalTokens > 0 ? ((this.countTokens(section.content) / totalTokens) * 100).toFixed(1) : 0,
        content: section.content
      }));
    } catch (error) {
      console.error('토큰 분포 분석 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 마크다운 콘텐츠를 섹션별로 파싱합니다
   * @param {string} content - 마크다운 콘텐츠
   * @returns {Array<Object>} 섹션 정보 배열
   */
  parseSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      // 헤더 라인 감지 (# ## ### 등)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // 이전 섹션 저장
        if (currentSection) {
          sections.push({
            name: currentSection,
            content: currentContent.join('\n').trim()
          });
        }
        
        // 새 섹션 시작
        currentSection = headerMatch[2];
        currentContent = [line];
      } else {
        // 현재 섹션에 라인 추가
        if (currentSection) {
          currentContent.push(line);
        }
      }
    }
    
    // 마지막 섹션 저장
    if (currentSection) {
      sections.push({
        name: currentSection,
        content: currentContent.join('\n').trim()
      });
    }

    return sections;
  }

  /**
   * 토큰 카운터 리소스를 정리합니다
   */
  cleanup() {
    if (this.encoder) {
      this.encoder.free();
    }
  }
}

export default TokenCounter;
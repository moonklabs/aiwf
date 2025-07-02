/**
 * 기본 프로젝트 구조 테스트
 */

const fs = require('fs');
const path = require('path');

describe('프로젝트 기본 구조', () => {
  test('package.json 파일이 존재한다', () => {
    const packagePath = path.join(__dirname, '../package.json');
    expect(fs.existsSync(packagePath)).toBe(true);
  });

  test('메인 실행 파일 index.js가 존재한다', () => {
    const indexPath = path.join(__dirname, '../index.js');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  test('AIWF 프레임워크 디렉토리가 존재한다', () => {
    const aiwfPath = path.join(__dirname, '../claude-code/aiwf');
    expect(fs.existsSync(aiwfPath)).toBe(true);
  });

  test('한국어 버전 디렉토리가 존재한다', () => {
    const koPath = path.join(__dirname, '../claude-code/aiwf/ko');
    expect(fs.existsSync(koPath)).toBe(true);
  });

  test('영어 버전 디렉토리가 존재한다', () => {
    const enPath = path.join(__dirname, '../claude-code/aiwf/en');
    expect(fs.existsSync(enPath)).toBe(true);
  });
});

describe('패키지 구성 검증', () => {
  let packageJson;

  beforeAll(() => {
    const packagePath = path.join(__dirname, '../package.json');
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  });

  test('패키지 이름이 올바르다', () => {
    expect(packageJson.name).toBe('aiwf');
  });

  test('필수 의존성이 설치되어 있다', () => {
    expect(packageJson.dependencies).toHaveProperty('commander');
    expect(packageJson.dependencies).toHaveProperty('chalk');
    expect(packageJson.dependencies).toHaveProperty('ora');
    expect(packageJson.dependencies).toHaveProperty('prompts');
  });

  test('bin 명령어가 설정되어 있다', () => {
    expect(packageJson.bin).toHaveProperty('aiwf');
    expect(packageJson.bin.aiwf).toBe('./index.js');
  });
});
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const tar = require('tar');
const chalk = require('chalk');
const ora = require('ora');

const CACHE_DIR = path.join(__dirname, '../.cache');
const TEMPLATES_DIR = path.join(__dirname, '../templates');
const DEPENDENCIES_CACHE = path.join(CACHE_DIR, 'dependencies');

// 각 템플릿의 주요 의존성 목록
const TEMPLATE_DEPENDENCIES = {
  'web-app': [
    'react@18',
    'react-dom@18',
    'vite@4',
    'typescript@5',
    'tailwindcss@3'
  ],
  'api-server': [
    'express@4',
    'typescript@5',
    'jsonwebtoken@9',
    'swagger-ui-express@5'
  ],
  'npm-library': [
    'typescript@5',
    'rollup@3',
    'jest@29'
  ]
};

async function cacheTemplates() {
  console.log(chalk.cyan('\n📦 AIWF 템플릿 캐시 시스템\n'));

  const spinner = ora('캐시 디렉토리 준비 중...').start();

  try {
    // 캐시 디렉토리 생성
    await fs.ensureDir(CACHE_DIR);
    await fs.ensureDir(DEPENDENCIES_CACHE);

    spinner.text = '템플릿 압축 중...';

    // 각 템플릿을 압축하여 캐시
    const templates = await fs.readdir(TEMPLATES_DIR);
    
    for (const template of templates) {
      const templatePath = path.join(TEMPLATES_DIR, template);
      const stat = await fs.stat(templatePath);
      
      if (stat.isDirectory()) {
        const cachePath = path.join(CACHE_DIR, `${template}.tar.gz`);
        
        await tar.create(
          {
            gzip: true,
            file: cachePath,
            cwd: TEMPLATES_DIR
          },
          [template]
        );

        spinner.text = `${template} 템플릿 캐시 완료`;
      }
    }

    spinner.text = '템플릿 메타데이터 생성 중...';

    // 캐시 메타데이터 생성
    const metadata = {
      version: require('../../package.json').version,
      cachedAt: new Date().toISOString(),
      templates: {},
      dependencies: {}
    };

    for (const template of templates) {
      const configPath = path.join(TEMPLATES_DIR, template, 'config.json');
      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        metadata.templates[template] = {
          name: config.name,
          displayName: config.displayName,
          description: config.description,
          size: (await fs.stat(path.join(CACHE_DIR, `${template}.tar.gz`))).size
        };
      }
    }

    await fs.writeJson(path.join(CACHE_DIR, 'metadata.json'), metadata, { spaces: 2 });

    spinner.succeed('템플릿 캐시 완료!');

    // 캐시 통계 출력
    console.log(chalk.green('\n✅ 캐시 생성 완료\n'));
    console.log('캐시된 템플릿:');
    for (const [template, info] of Object.entries(metadata.templates)) {
      console.log(chalk.gray(`  - ${info.displayName}: ${(info.size / 1024).toFixed(2)} KB`));
    }

    const totalSize = Object.values(metadata.templates)
      .reduce((sum, info) => sum + info.size, 0);
    console.log(chalk.gray(`\n총 캐시 크기: ${(totalSize / 1024 / 1024).toFixed(2)} MB`));

  } catch (error) {
    spinner.fail('캐시 생성 중 오류가 발생했습니다.');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function restoreFromCache(templateName, targetPath) {
  const cachePath = path.join(CACHE_DIR, `${templateName}.tar.gz`);
  
  if (!await fs.pathExists(cachePath)) {
    throw new Error(`캐시된 템플릿을 찾을 수 없습니다: ${templateName}`);
  }

  await tar.extract({
    file: cachePath,
    cwd: targetPath
  });

  // 템플릿 내용을 상위 디렉토리로 이동
  const extractedPath = path.join(targetPath, templateName, 'template');
  const files = await fs.readdir(extractedPath);
  
  for (const file of files) {
    await fs.move(
      path.join(extractedPath, file),
      path.join(targetPath, file)
    );
  }

  // 임시 디렉토리 삭제
  await fs.remove(path.join(targetPath, templateName));
}

async function checkCache() {
  const metadataPath = path.join(CACHE_DIR, 'metadata.json');
  
  if (!await fs.pathExists(metadataPath)) {
    return { valid: false, reason: '캐시가 존재하지 않습니다' };
  }

  const metadata = await fs.readJson(metadataPath);
  const packageVersion = require('../../package.json').version;

  if (metadata.version !== packageVersion) {
    return { valid: false, reason: '버전이 일치하지 않습니다' };
  }

  // 캐시가 7일 이상 오래된 경우
  const cacheAge = Date.now() - new Date(metadata.cachedAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  if (cacheAge > sevenDays) {
    return { valid: false, reason: '캐시가 오래되었습니다' };
  }

  return { valid: true, metadata };
}

// CLI 명령어 처리
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      cacheTemplates().catch(error => {
        console.error(chalk.red('오류:', error.message));
        process.exit(1);
      });
      break;

    case 'check':
      checkCache().then(result => {
        if (result.valid) {
          console.log(chalk.green('✅ 캐시가 유효합니다'));
          console.log(chalk.gray(`생성일: ${result.metadata.cachedAt}`));
        } else {
          console.log(chalk.yellow(`⚠️  ${result.reason}`));
        }
      });
      break;

    case 'clear':
      fs.remove(CACHE_DIR).then(() => {
        console.log(chalk.green('✅ 캐시가 삭제되었습니다'));
      });
      break;

    default:
      console.log(`
사용법: node cache-templates.js [command]

명령어:
  create  템플릿 캐시 생성
  check   캐시 상태 확인
  clear   캐시 삭제
`);
  }
}

module.exports = { cacheTemplates, restoreFromCache, checkCache };
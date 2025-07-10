#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { checkCache, restoreFromCache } = require('./cache-templates');

async function createProjectOffline(template, projectName, targetDir) {
  const spinner = ora('오프라인 모드로 프로젝트 생성 중...').start();

  try {
    // 캐시 확인
    const cacheStatus = await checkCache();
    
    if (!cacheStatus.valid) {
      spinner.fail(`캐시 문제: ${cacheStatus.reason}`);
      console.log(chalk.yellow('\n온라인 모드로 전환하거나 캐시를 업데이트하세요.'));
      return false;
    }

    spinner.text = '캐시에서 템플릿 복원 중...';

    // 캐시에서 템플릿 복원
    await restoreFromCache(template, targetDir);

    // 플레이스홀더 교체
    const replacements = {
      '{{projectName}}': projectName,
      '{{createdAt}}': new Date().toISOString(),
      '{{year}}': new Date().getFullYear().toString()
    };

    await replacePlaceholders(targetDir, replacements);

    spinner.succeed('프로젝트가 오프라인 모드로 생성되었습니다!');

    console.log(chalk.green(`\n✅ ${projectName} 프로젝트가 생성되었습니다!\n`));
    console.log(chalk.yellow('⚠️  오프라인 모드로 생성되었습니다.'));
    console.log('인터넷 연결 후 다음 명령어를 실행하세요:\n');
    console.log(chalk.cyan(`  cd ${targetDir}`));
    console.log(chalk.cyan('  npm install\n'));

    return true;

  } catch (error) {
    spinner.fail('오프라인 프로젝트 생성 실패');
    throw error;
  }
}

async function replacePlaceholders(dir, replacements) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      await replacePlaceholders(filePath, replacements);
    } else if (stat.isFile() && !file.endsWith('.jpg') && !file.endsWith('.png')) {
      try {
        let content = await fs.readFile(filePath, 'utf8');
        
        for (const [placeholder, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(placeholder, 'g'), value);
        }

        await fs.writeFile(filePath, content, 'utf8');
      } catch (error) {
        // 바이너리 파일 무시
      }
    }
  }
}

// 네트워크 연결 확인
function isOnline() {
  return new Promise((resolve) => {
    require('dns').lookup('registry.npmjs.org', (err) => {
      resolve(!err);
    });
  });
}

module.exports = { createProjectOffline, isOnline };
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const ora = require('ora');

const TEMPLATES_DIR = path.join(__dirname, '../templates');

async function createProject() {
  console.log(chalk.cyan('\n🚀 AIWF 프로젝트 생성기\n'));

  // 사용 가능한 템플릿 찾기
  const templates = fs.readdirSync(TEMPLATES_DIR)
    .filter(dir => fs.existsSync(path.join(TEMPLATES_DIR, dir, 'config.json')));

  const templateConfigs = templates.map(template => {
    const config = JSON.parse(
      fs.readFileSync(path.join(TEMPLATES_DIR, template, 'config.json'), 'utf8')
    );
    return {
      value: template,
      title: config.displayName,
      description: config.description
    };
  });

  const questions = [
    {
      type: 'select',
      name: 'template',
      message: '템플릿을 선택하세요',
      choices: templateConfigs,
    },
    {
      type: 'text',
      name: 'projectName',
      message: '프로젝트 이름',
      validate: value => {
        if (!value) return '프로젝트 이름을 입력하세요';
        if (!/^[a-z0-9-]+$/.test(value)) {
          return '소문자, 숫자, 하이픈만 사용 가능합니다';
        }
        return true;
      }
    },
    {
      type: prev => prev === 'npm-library' ? 'text' : null,
      name: 'description',
      message: '프로젝트 설명',
      initial: 'A new AIWF project'
    },
    {
      type: prev => prev === 'npm-library' ? 'text' : null,
      name: 'author',
      message: '작성자',
      initial: ''
    },
    {
      type: 'text',
      name: 'directory',
      message: '프로젝트 디렉토리',
      initial: prev => prev.projectName,
      validate: value => {
        if (!value) return '디렉토리를 입력하세요';
        if (fs.existsSync(value)) {
          return '이미 존재하는 디렉토리입니다';
        }
        return true;
      }
    }
  ];

  const answers = await prompts(questions);

  if (!answers.template || !answers.projectName) {
    console.log(chalk.red('\n❌ 프로젝트 생성이 취소되었습니다.'));
    return;
  }

  const spinner = ora('프로젝트 생성 중...').start();

  try {
    const templatePath = path.join(TEMPLATES_DIR, answers.template, 'template');
    const targetPath = path.resolve(answers.directory);

    // 템플릿 복사
    await fs.copy(templatePath, targetPath);

    // 플레이스홀더 교체
    const replacements = {
      '{{projectName}}': answers.projectName,
      '{{description}}': answers.description || '',
      '{{author}}': answers.author || '',
      '{{year}}': new Date().getFullYear().toString(),
      '{{createdAt}}': new Date().toISOString(),
      '{{username}}': answers.author?.toLowerCase().replace(/\s+/g, '') || 'username'
    };

    // 모든 파일에서 플레이스홀더 교체
    await replacePlaceholders(targetPath, replacements);

    spinner.succeed('프로젝트가 성공적으로 생성되었습니다!');

    console.log(chalk.green(`\n✅ ${answers.projectName} 프로젝트가 생성되었습니다!\n`));
    console.log('다음 명령어로 시작하세요:\n');
    console.log(chalk.cyan(`  cd ${answers.directory}`));
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run dev\n'));
    console.log('AIWF 명령어:');
    console.log(chalk.gray('  npm run aiwf status   # 프로젝트 상태 확인'));
    console.log(chalk.gray('  npm run aiwf feature  # Feature Ledger 관리\n'));

  } catch (error) {
    spinner.fail('프로젝트 생성 중 오류가 발생했습니다.');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function replacePlaceholders(dir, replacements) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await replacePlaceholders(filePath, replacements);
    } else if (stat.isFile()) {
      let content = await fs.readFile(filePath, 'utf8');
      
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }

      await fs.writeFile(filePath, content, 'utf8');
    }
  }
}

// CLI 실행
if (require.main === module) {
  createProject().catch(error => {
    console.error(chalk.red('오류:', error.message));
    process.exit(1);
  });
}

module.exports = { createProject };
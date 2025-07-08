#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
const { 
  getCommitsByFeatureId,
  isGitRepository,
  runGitCommand
} = require('../utils/git-utils');
const { 
  findFeatureFile,
  readFeatureFile
} = require('../utils/feature-updater');

const program = new Command();

/**
 * feature_commit_report 명령어
 * Feature와 Git 커밋의 매핑 리포트 생성
 */

program
  .name('feature_commit_report')
  .description('Feature와 Git 커밋의 매핑 리포트를 생성합니다')
  .option('-f, --feature <id>', '특정 Feature ID의 리포트만 생성')
  .option('-s, --status <status>', 'Feature 상태별 필터링 (active|completed|archived)')
  .option('-o, --output <path>', '리포트 출력 경로', './feature_commit_report.md')
  .option('-F, --format <format>', '출력 형식 (markdown|json|html)', 'markdown')
  .option('-d, --detailed', '상세 커밋 정보 포함')
  .option('-t, --timeline', '타임라인 형식으로 표시')
  .option('-v, --verbose', '상세 로그 출력')
  .action(async (options) => {
    const spinner = ora();
    
    try {
      // Git 저장소 확인
      if (!await isGitRepository()) {
        console.error(chalk.red('❌ 현재 디렉토리는 Git 저장소가 아닙니다.'));
        process.exit(1);
      }
      
      spinner.start('Feature 정보 수집 중...');
      
      // Feature 파일 수집
      const basePath = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS');
      const statuses = options.status ? [options.status] : ['active', 'completed', 'archived'];
      const features = [];
      
      for (const status of statuses) {
        const dirPath = path.join(basePath, status);
        try {
          const files = await fs.readdir(dirPath);
          const featureFiles = files.filter(f => f.endsWith('.md'));
          
          for (const file of featureFiles) {
            const featureId = file.split('_')[0];
            
            // 특정 Feature ID 필터링
            if (options.feature && featureId !== options.feature) {
              continue;
            }
            
            const filePath = path.join(dirPath, file);
            const { frontmatter } = await readFeatureFile(filePath);
            
            features.push({
              id: featureId,
              status: status,
              title: frontmatter.title || 'Untitled',
              milestone: frontmatter.milestone || 'N/A',
              assignee: frontmatter.assignee || 'Unassigned',
              created: frontmatter.created_date || 'Unknown',
              updated: frontmatter.last_updated || 'Unknown',
              gitCommits: frontmatter.git_commits || [],
              progress: frontmatter.progress_percentage || 0
            });
          }
        } catch (error) {
          // 디렉토리가 없을 수 있음
          continue;
        }
      }
      
      spinner.succeed(chalk.green(`${features.length}개 Feature 정보 수집 완료`));
      
      if (features.length === 0) {
        console.log(chalk.yellow('리포트를 생성할 Feature가 없습니다.'));
        return;
      }
      
      // 각 Feature의 커밋 정보 수집
      spinner.start('Git 커밋 정보 수집 중...');
      const reportData = [];
      
      for (const feature of features) {
        const commits = await getCommitsByFeatureId(feature.id);
        
        reportData.push({
          ...feature,
          commits: commits,
          commitCount: commits.length,
          firstCommit: commits.length > 0 ? commits[commits.length - 1] : null,
          lastCommit: commits.length > 0 ? commits[0] : null
        });
      }
      
      spinner.succeed(chalk.green('커밋 정보 수집 완료'));
      
      // 리포트 생성
      spinner.start('리포트 생성 중...');
      
      let reportContent;
      switch (options.format) {
        case 'json':
          reportContent = generateJsonReport(reportData, options);
          break;
        case 'html':
          reportContent = generateHtmlReport(reportData, options);
          break;
        case 'markdown':
        default:
          reportContent = generateMarkdownReport(reportData, options);
      }
      
      // 리포트 저장
      await fs.writeFile(options.output, reportContent, 'utf8');
      spinner.succeed(chalk.green(`리포트 생성 완료: ${options.output}`));
      
      // 요약 정보 출력
      console.log(chalk.cyan('\n📊 리포트 요약:'));
      console.log(chalk.white(`   총 Feature: ${reportData.length}개`));
      console.log(chalk.white(`   총 커밋: ${reportData.reduce((sum, f) => sum + f.commitCount, 0)}개`));
      
      const byStatus = {};
      reportData.forEach(f => {
        byStatus[f.status] = (byStatus[f.status] || 0) + 1;
      });
      
      console.log(chalk.cyan('\n   상태별 분포:'));
      Object.entries(byStatus).forEach(([status, count]) => {
        const icon = status === 'active' ? '🟢' : status === 'completed' ? '✅' : '📦';
        console.log(chalk.white(`     ${icon} ${status}: ${count}개`));
      });
      
    } catch (error) {
      spinner.fail(chalk.red('리포트 생성 중 오류 발생'));
      console.error(chalk.red(error.message));
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * Markdown 형식 리포트 생성
 */
function generateMarkdownReport(data, options) {
  let report = '# Feature-Git Commit Mapping Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // 요약 섹션
  report += '## Summary\n\n';
  report += `- Total Features: ${data.length}\n`;
  report += `- Total Commits: ${data.reduce((sum, f) => sum + f.commitCount, 0)}\n`;
  report += '\n';
  
  // 상태별 통계
  const byStatus = {};
  data.forEach(f => {
    byStatus[f.status] = (byStatus[f.status] || []);
    byStatus[f.status].push(f);
  });
  
  report += '## Features by Status\n\n';
  
  Object.entries(byStatus).forEach(([status, features]) => {
    report += `### ${status.charAt(0).toUpperCase() + status.slice(1)} (${features.length})\n\n`;
    
    features.forEach(feature => {
      report += `#### ${feature.id}: ${feature.title}\n\n`;
      report += `- **Milestone**: ${feature.milestone}\n`;
      report += `- **Assignee**: ${feature.assignee}\n`;
      report += `- **Progress**: ${feature.progress}%\n`;
      report += `- **Commits**: ${feature.commitCount}\n`;
      
      if (feature.firstCommit) {
        report += `- **First Commit**: ${feature.firstCommit.date.substring(0, 10)}\n`;
        report += `- **Last Commit**: ${feature.lastCommit.date.substring(0, 10)}\n`;
      }
      
      if (options.detailed && feature.commits.length > 0) {
        report += '\n**Commit History**:\n\n';
        feature.commits.forEach(commit => {
          const shortHash = commit.hash.substring(0, 7);
          const date = commit.date.substring(0, 10);
          const message = commit.message.split('\n')[0];
          report += `- \`${shortHash}\` (${date}): ${message}\n`;
        });
      }
      
      report += '\n';
    });
  });
  
  // 타임라인 뷰 (옵션)
  if (options.timeline) {
    report += '## Timeline View\n\n';
    
    // 모든 커밋을 날짜순으로 정렬
    const allCommits = [];
    data.forEach(feature => {
      feature.commits.forEach(commit => {
        allCommits.push({
          ...commit,
          featureId: feature.id,
          featureTitle: feature.title
        });
      });
    });
    
    allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentMonth = '';
    allCommits.forEach(commit => {
      const month = commit.date.substring(0, 7);
      if (month !== currentMonth) {
        currentMonth = month;
        report += `\n### ${month}\n\n`;
      }
      
      const shortHash = commit.hash.substring(0, 7);
      const date = commit.date.substring(0, 10);
      const message = commit.message.split('\n')[0];
      report += `- **${date}** - ${commit.featureId}: ${message} (\`${shortHash}\`)\n`;
    });
  }
  
  return report;
}

/**
 * JSON 형식 리포트 생성
 */
function generateJsonReport(data, options) {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      totalFeatures: data.length,
      totalCommits: data.reduce((sum, f) => sum + f.commitCount, 0),
      byStatus: {}
    },
    features: []
  };
  
  // 상태별 집계
  data.forEach(f => {
    report.summary.byStatus[f.status] = (report.summary.byStatus[f.status] || 0) + 1;
  });
  
  // Feature 데이터
  report.features = data.map(feature => {
    const featureData = {
      id: feature.id,
      title: feature.title,
      status: feature.status,
      milestone: feature.milestone,
      assignee: feature.assignee,
      progress: feature.progress,
      commitCount: feature.commitCount,
      created: feature.created,
      updated: feature.updated
    };
    
    if (options.detailed) {
      featureData.commits = feature.commits.map(commit => ({
        hash: commit.hash,
        author: commit.author,
        date: commit.date,
        message: commit.message
      }));
    }
    
    return featureData;
  });
  
  return JSON.stringify(report, null, 2);
}

/**
 * HTML 형식 리포트 생성
 */
function generateHtmlReport(data, options) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Feature-Git Commit Mapping Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .feature { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
    .active { border-left: 4px solid #28a745; }
    .completed { border-left: 4px solid #007bff; }
    .archived { border-left: 4px solid #6c757d; }
    .progress { background: #e9ecef; height: 20px; border-radius: 3px; }
    .progress-bar { background: #007bff; height: 100%; border-radius: 3px; }
    .commit { font-family: monospace; font-size: 0.9em; margin: 5px 0; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>Feature-Git Commit Mapping Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <ul>
      <li>Total Features: ${data.length}</li>
      <li>Total Commits: ${data.reduce((sum, f) => sum + f.commitCount, 0)}</li>
    </ul>
  </div>
`;
  
  // Features by status
  const byStatus = {};
  data.forEach(f => {
    byStatus[f.status] = (byStatus[f.status] || []);
    byStatus[f.status].push(f);
  });
  
  Object.entries(byStatus).forEach(([status, features]) => {
    html += `<h2>${status.charAt(0).toUpperCase() + status.slice(1)} Features (${features.length})</h2>`;
    
    features.forEach(feature => {
      html += `<div class="feature ${status}">`;
      html += `<h3>${feature.id}: ${feature.title}</h3>`;
      html += `<p><strong>Milestone:</strong> ${feature.milestone} | `;
      html += `<strong>Assignee:</strong> ${feature.assignee} | `;
      html += `<strong>Commits:</strong> ${feature.commitCount}</p>`;
      
      html += `<div class="progress">`;
      html += `<div class="progress-bar" style="width: ${feature.progress}%"></div>`;
      html += `</div>`;
      html += `<p>Progress: ${feature.progress}%</p>`;
      
      if (options.detailed && feature.commits.length > 0) {
        html += '<h4>Commit History:</h4>';
        feature.commits.forEach(commit => {
          const shortHash = commit.hash.substring(0, 7);
          const date = commit.date.substring(0, 10);
          const message = commit.message.split('\n')[0];
          html += `<div class="commit"><code>${shortHash}</code> (${date}): ${message}</div>`;
        });
      }
      
      html += '</div>';
    });
  });
  
  html += '</body></html>';
  return html;
}

// 명령어 실행
program.parse(process.argv);
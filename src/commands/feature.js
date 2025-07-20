#!/usr/bin/env node

/**
 * AIWF Feature Ledger 명령어
 * 기능 개발 추적 및 관리
 */

import { ResourceLoader } from '../lib/resource-loader.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

class FeatureCommand {
  constructor() {
    this.resourceLoader = new ResourceLoader();
    this.featureLedgerPath = path.join(process.cwd(), 'feature-ledger');
  }

  /**
   * Feature 명령어 실행
   */
  async execute(args) {
    const [subcommand, ...restArgs] = args;

    switch (subcommand) {
      case 'list':
        await this.listFeatures();
        break;
      case 'create':
      case 'add':
        await this.createFeature(restArgs);
        break;
      case 'update':
        await this.updateFeature(restArgs);
        break;
      case 'status':
        await this.showStatus(restArgs[0]);
        break;
      case 'sync':
        await this.syncWithGit();
        break;
      default:
        this.showHelp();
        break;
    }
  }

  /**
   * Feature 목록 표시
   */
  async listFeatures() {
    try {
      const indexPath = path.join(this.featureLedgerPath, 'feature-index.json');
      
      if (!fs.existsSync(indexPath)) {
        console.log(chalk.yellow('⚠️  Feature Ledger가 초기화되지 않았습니다.'));
        console.log(chalk.gray('초기화하려면: aiwf feature create <기능명>'));
        return;
      }

      const index = await fs.readJson(indexPath);
      const features = index.features || [];

      console.log(chalk.cyan('📋 Feature Ledger'));
      console.log(chalk.gray('-'.repeat(50)));
      
      if (features.length === 0) {
        console.log('등록된 기능이 없습니다.');
      } else {
        features.forEach(feature => {
          const statusIcon = this.getStatusIcon(feature.status);
          const statusColor = this.getStatusColor(feature.status);
          console.log(`${statusIcon} ${chalk.bold(feature.id)} - ${feature.name}`);
          console.log(`  상태: ${chalk[statusColor](feature.status)}`);
          console.log(`  설명: ${feature.description || '없음'}`);
          console.log('');
        });
      }

      console.log(chalk.gray('-'.repeat(50)));
      console.log(`총 ${features.length}개의 기능`);
      
    } catch (error) {
      console.error(chalk.red('❌ Feature 목록 조회 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 새 Feature 생성
   */
  async createFeature(args) {
    const [name, ...descriptionParts] = args;
    
    if (!name) {
      console.error(chalk.red('❌ Feature 이름을 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf feature create <기능명> [설명]'));
      return;
    }

    try {
      // Feature Ledger 디렉토리 생성
      await fs.ensureDir(this.featureLedgerPath);
      
      // Feature Index 로드 또는 생성
      const indexPath = path.join(this.featureLedgerPath, 'feature-index.json');
      let index = { features: [], lastId: 0 };
      
      if (fs.existsSync(indexPath)) {
        index = await fs.readJson(indexPath);
      }

      // 새 Feature ID 생성
      const newId = `FL-${String(index.lastId + 1).padStart(3, '0')}`;
      const description = descriptionParts.join(' ');
      
      // Feature 데이터
      const feature = {
        id: newId,
        name: name,
        description: description,
        status: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commits: [],
        tasks: []
      };

      // Feature 파일 생성
      const featureFile = path.join(this.featureLedgerPath, `${newId}-${name.toLowerCase().replace(/\s+/g, '-')}.json`);
      await fs.writeJson(featureFile, feature, { spaces: 2 });

      // Index 업데이트
      index.features.push({
        id: newId,
        name: name,
        description: description,
        status: 'planned',
        file: path.basename(featureFile)
      });
      index.lastId++;
      
      await fs.writeJson(indexPath, index, { spaces: 2 });

      console.log(chalk.green(`✅ Feature ${chalk.bold(newId)} 생성 완료!`));
      console.log(`파일: ${chalk.yellow(featureFile)}`);
      
    } catch (error) {
      console.error(chalk.red('❌ Feature 생성 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * Feature 상태 업데이트
   */
  async updateFeature(args) {
    const [featureId, status] = args;
    
    if (!featureId || !status) {
      console.error(chalk.red('❌ Feature ID와 상태를 지정해주세요.'));
      console.log(chalk.gray('사용법: aiwf feature update <Feature ID> <상태>'));
      console.log(chalk.gray('상태: planned, in-progress, completed, on-hold'));
      return;
    }

    const validStatuses = ['planned', 'in-progress', 'completed', 'on-hold'];
    if (!validStatuses.includes(status)) {
      console.error(chalk.red(`❌ 유효하지 않은 상태: ${status}`));
      console.log(chalk.gray('유효한 상태: ' + validStatuses.join(', ')));
      return;
    }

    try {
      const indexPath = path.join(this.featureLedgerPath, 'feature-index.json');
      const index = await fs.readJson(indexPath);
      
      const featureIndex = index.features.findIndex(f => f.id === featureId);
      if (featureIndex === -1) {
        console.error(chalk.red(`❌ Feature ${featureId}를 찾을 수 없습니다.`));
        return;
      }

      // Index 업데이트
      index.features[featureIndex].status = status;
      await fs.writeJson(indexPath, index, { spaces: 2 });

      // Feature 파일 업데이트
      const featureFile = path.join(this.featureLedgerPath, index.features[featureIndex].file);
      const feature = await fs.readJson(featureFile);
      feature.status = status;
      feature.updatedAt = new Date().toISOString();
      await fs.writeJson(featureFile, feature, { spaces: 2 });

      console.log(chalk.green(`✅ Feature ${chalk.bold(featureId)} 상태가 ${chalk.yellow(status)}로 업데이트되었습니다.`));
      
    } catch (error) {
      console.error(chalk.red('❌ Feature 업데이트 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * Feature 상태 표시
   */
  async showStatus(featureId) {
    if (!featureId) {
      // 전체 상태 요약 표시
      await this.showSummary();
      return;
    }

    try {
      const indexPath = path.join(this.featureLedgerPath, 'feature-index.json');
      const index = await fs.readJson(indexPath);
      
      const featureInfo = index.features.find(f => f.id === featureId);
      if (!featureInfo) {
        console.error(chalk.red(`❌ Feature ${featureId}를 찾을 수 없습니다.`));
        return;
      }

      // Feature 상세 정보 로드
      const featureFile = path.join(this.featureLedgerPath, featureInfo.file);
      const feature = await fs.readJson(featureFile);

      console.log(chalk.cyan(`📋 Feature: ${feature.name}`));
      console.log(chalk.gray('-'.repeat(50)));
      console.log(`ID: ${chalk.bold(feature.id)}`);
      console.log(`상태: ${chalk[this.getStatusColor(feature.status)](feature.status)}`);
      console.log(`설명: ${feature.description || '없음'}`);
      console.log(`생성일: ${new Date(feature.createdAt).toLocaleString('ko-KR')}`);
      console.log(`수정일: ${new Date(feature.updatedAt).toLocaleString('ko-KR')}`);
      
      if (feature.commits.length > 0) {
        console.log(`\n관련 커밋 (${feature.commits.length}개):`);
        feature.commits.slice(-5).forEach(commit => {
          console.log(`  - ${commit.hash.slice(0, 7)} ${commit.message}`);
        });
      }

      if (feature.tasks.length > 0) {
        console.log(`\n작업 목록 (${feature.tasks.length}개):`);
        feature.tasks.forEach(task => {
          const icon = task.completed ? '✅' : '⬜';
          console.log(`  ${icon} ${task.description}`);
        });
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Feature 상태 조회 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 전체 상태 요약
   */
  async showSummary() {
    try {
      const indexPath = path.join(this.featureLedgerPath, 'feature-index.json');
      
      if (!fs.existsSync(indexPath)) {
        console.log(chalk.yellow('⚠️  Feature Ledger가 초기화되지 않았습니다.'));
        return;
      }

      const index = await fs.readJson(indexPath);
      const features = index.features || [];

      const summary = {
        planned: features.filter(f => f.status === 'planned').length,
        'in-progress': features.filter(f => f.status === 'in-progress').length,
        completed: features.filter(f => f.status === 'completed').length,
        'on-hold': features.filter(f => f.status === 'on-hold').length
      };

      console.log(chalk.cyan('📊 Feature Ledger 요약'));
      console.log(chalk.gray('-'.repeat(50)));
      console.log(`계획됨: ${chalk.blue(summary.planned)}`);
      console.log(`진행중: ${chalk.yellow(summary['in-progress'])}`);
      console.log(`완료됨: ${chalk.green(summary.completed)}`);
      console.log(`보류중: ${chalk.gray(summary['on-hold'])}`);
      console.log(chalk.gray('-'.repeat(50)));
      console.log(`총 기능: ${features.length}`);
      
    } catch (error) {
      console.error(chalk.red('❌ 요약 정보 조회 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * Git 커밋과 동기화
   */
  async syncWithGit() {
    try {
      console.log(chalk.cyan('🔄 Git 커밋과 Feature Ledger 동기화 중...'));
      
      // sync-feature-commits 유틸리티 실행
      const syncModule = await this.resourceLoader.loadUtil('sync-feature-commits.js');
      const syncFunction = syncModule.syncFeatureCommits || syncModule.default;
      
      if (typeof syncFunction === 'function') {
        await syncFunction();
      } else {
        console.error(chalk.red('❌ 동기화 모듈을 로드할 수 없습니다.'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Git 동기화 중 오류가 발생했습니다:'), error.message);
    }
  }

  /**
   * 상태별 아이콘
   */
  getStatusIcon(status) {
    const icons = {
      'planned': '📝',
      'in-progress': '🔄',
      'completed': '✅',
      'on-hold': '⏸️'
    };
    return icons[status] || '❓';
  }

  /**
   * 상태별 색상
   */
  getStatusColor(status) {
    const colors = {
      'planned': 'blue',
      'in-progress': 'yellow',
      'completed': 'green',
      'on-hold': 'gray'
    };
    return colors[status] || 'white';
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log(chalk.cyan('📋 AIWF Feature Ledger'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log('사용법: aiwf feature <명령어> [옵션]');
    console.log('');
    console.log('명령어:');
    console.log('  list                    모든 기능 목록 표시');
    console.log('  create <이름> [설명]    새 기능 생성');
    console.log('  update <ID> <상태>      기능 상태 업데이트');
    console.log('  status [ID]             기능 상태 표시');
    console.log('  sync                    Git 커밋과 동기화');
    console.log('');
    console.log('상태:');
    console.log('  planned     계획됨');
    console.log('  in-progress 진행중');
    console.log('  completed   완료됨');
    console.log('  on-hold     보류중');
    console.log('');
    console.log('예시:');
    console.log('  aiwf feature list');
    console.log('  aiwf feature create "로그인 기능" "사용자 인증 구현"');
    console.log('  aiwf feature update FL-001 in-progress');
    console.log('  aiwf feature status FL-001');
  }
}

export default FeatureCommand;
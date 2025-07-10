#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { parseYamlFrontmatter, updateYamlFrontmatter, getFeaturePath } = require('./git-integration.cjs');

// 진행률 계산 알고리즘
class ProgressCalculator {
    constructor(metadata) {
        this.metadata = metadata;
        this.weights = {
            checklist: 0.4,    // 40%
            tasks: 0.4,        // 40%
            time: 0.2          // 20%
        };
    }

    // 전체 진행률 계산
    calculate() {
        let totalProgress = 0;
        let validWeights = 0;

        // 체크리스트 진행률
        const checklistProgress = this.calculateChecklistProgress();
        if (checklistProgress !== null) {
            totalProgress += checklistProgress * this.weights.checklist;
            validWeights += this.weights.checklist;
        }

        // 태스크 진행률
        const taskProgress = this.calculateTaskProgress();
        if (taskProgress !== null) {
            totalProgress += taskProgress * this.weights.tasks;
            validWeights += this.weights.tasks;
        }

        // 시간 기반 진행률
        const timeProgress = this.calculateTimeProgress();
        if (timeProgress !== null) {
            totalProgress += timeProgress * this.weights.time;
            validWeights += this.weights.time;
        }

        // 가중치 정규화
        if (validWeights > 0) {
            totalProgress = totalProgress / validWeights;
        }

        // 상태별 보정
        if (this.metadata.status === 'completed') {
            totalProgress = 1.0;
        } else if (this.metadata.status === 'planned' && totalProgress === 0) {
            totalProgress = 0.05; // 최소 5%
        }

        return Math.round(totalProgress * 100);
    }

    // 체크리스트 진행률 계산
    calculateChecklistProgress() {
        const total = this.metadata.checklist_items_total || 0;
        const completed = this.metadata.checklist_items_completed || 0;
        
        if (total === 0) return null;
        
        return completed / total;
    }

    // 태스크 진행률 계산 (간소화된 버전)
    calculateTaskProgress() {
        const tasks = this.metadata.tasks || [];
        if (tasks.length === 0) return null;

        // 실제로는 각 태스크의 상태를 확인해야 하지만,
        // 여기서는 커밋 수와 태스크 수의 비율로 추정
        const commits = this.metadata.git_commits || [];
        const commitsPerTask = 3; // 태스크당 평균 커밋 수 가정
        
        const estimatedProgress = commits.length / (tasks.length * commitsPerTask);
        return Math.min(estimatedProgress, 1.0);
    }

    // 시간 기반 진행률 계산
    calculateTimeProgress() {
        const created = this.metadata.created_date;
        const estimated = this.metadata.estimated_completion;
        
        if (!created || !estimated) return null;

        const createdDate = new Date(created);
        const estimatedDate = new Date(estimated);
        const now = new Date();

        // 전체 기간 (일 단위)
        const totalDays = (estimatedDate - createdDate) / (1000 * 60 * 60 * 24);
        if (totalDays <= 0) return null;

        // 경과 기간
        const elapsedDays = (now - createdDate) / (1000 * 60 * 60 * 24);
        
        // 진행률 (최대 100%)
        return Math.min(elapsedDays / totalDays, 1.0);
    }

    // 상세 진행률 리포트
    getDetailedReport() {
        const checklistProgress = this.calculateChecklistProgress();
        const taskProgress = this.calculateTaskProgress();
        const timeProgress = this.calculateTimeProgress();
        const totalProgress = this.calculate();

        return {
            total: totalProgress,
            components: {
                checklist: checklistProgress !== null ? Math.round(checklistProgress * 100) : null,
                tasks: taskProgress !== null ? Math.round(taskProgress * 100) : null,
                time: timeProgress !== null ? Math.round(timeProgress * 100) : null
            },
            metadata: {
                status: this.metadata.status,
                commits: (this.metadata.git_commits || []).length,
                checklist: `${this.metadata.checklist_items_completed || 0}/${this.metadata.checklist_items_total || 0}`,
                tasks: (this.metadata.tasks || []).length
            }
        };
    }
}

// Feature 진행률 업데이트
async function updateFeatureProgress(featureId) {
    const featurePath = await getFeaturePath(featureId);
    if (!featurePath) {
        console.error(`Feature ${featureId} not found`);
        return false;
    }

    try {
        const content = await fs.readFile(featurePath, 'utf-8');
        const metadata = parseYamlFrontmatter(content);
        
        if (!metadata) {
            console.error(`Invalid feature file format: ${featurePath}`);
            return false;
        }

        // 진행률 계산
        const calculator = new ProgressCalculator(metadata);
        const progress = calculator.calculate();
        const report = calculator.getDetailedReport();

        // 메타데이터 업데이트
        metadata.progress_percentage = progress;
        metadata.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);

        // 파일 업데이트
        const updatedContent = updateYamlFrontmatter(content, metadata);
        await fs.writeFile(featurePath, updatedContent);

        // 리포트 출력
        console.log(`Feature ${featureId} Progress Report`);
        console.log('================================');
        console.log(`Total Progress: ${report.total}%`);
        console.log('\nComponent Breakdown:');
        if (report.components.checklist !== null) {
            console.log(`  - Checklist: ${report.components.checklist}% (${report.metadata.checklist})`);
        }
        if (report.components.tasks !== null) {
            console.log(`  - Tasks: ${report.components.tasks}% (${report.metadata.tasks} tasks)`);
        }
        if (report.components.time !== null) {
            console.log(`  - Time: ${report.components.time}%`);
        }
        console.log(`\nStatus: ${report.metadata.status}`);
        console.log(`Commits: ${report.metadata.commits}`);

        return true;
    } catch (error) {
        console.error(`Error updating feature progress: ${error.message}`);
        return false;
    }
}

// 모든 active feature의 진행률 업데이트
async function updateAllFeaturesProgress() {
    const activePath = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS', 'active');
    
    try {
        const files = await fs.readdir(activePath);
        const featureFiles = files.filter(file => file.match(/^FL\d{3}_.*\.md$/));
        
        console.log(`Updating progress for ${featureFiles.length} active features...\n`);
        
        for (const file of featureFiles) {
            const featureId = file.match(/^(FL\d{3})/)[1];
            await updateFeatureProgress(featureId);
            console.log('\n');
        }
        
        console.log('All features updated successfully!');
    } catch (error) {
        console.error(`Error updating all features: ${error.message}`);
    }
}

// 메인 함수
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log('Feature Progress Calculator');
        console.log('\nUsage:');
        console.log('  node feature-progress-calculator.cjs <feature-id>    Update specific feature');
        console.log('  node feature-progress-calculator.cjs --all           Update all active features');
        process.exit(0);
    }

    if (command === '--all') {
        await updateAllFeaturesProgress();
    } else {
        await updateFeatureProgress(command);
    }
}

// 스크립트 실행
if (require.main === module) {
    main().catch(error => {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    ProgressCalculator,
    updateFeatureProgress
};
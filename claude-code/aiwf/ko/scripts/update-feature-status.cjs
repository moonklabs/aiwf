#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { parseYamlFrontmatter, updateYamlFrontmatter, getFeaturePath } = require('./git-integration.cjs');

// Feature 상태 업데이트 함수
async function updateFeatureStatus(featureId, newStatus) {
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

        // 상태 업데이트
        const oldStatus = metadata.status;
        metadata.status = newStatus;
        
        // 완료 시간 기록
        if (newStatus === 'completed' && !metadata.actual_completion) {
            metadata.actual_completion = new Date().toISOString().split('T')[0];
            metadata.progress_percentage = 100;
        }

        // 마지막 업데이트 시간
        metadata.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);

        // 파일 업데이트
        const updatedContent = updateYamlFrontmatter(content, metadata);
        await fs.writeFile(featurePath, updatedContent);

        // 상태에 따라 파일 이동
        if (oldStatus !== newStatus) {
            await moveFeatureFile(featureId, featurePath, oldStatus, newStatus);
        }

        console.log(`✓ Updated feature ${featureId} status: ${oldStatus} → ${newStatus}`);
        return true;
    } catch (error) {
        console.error(`Error updating feature status: ${error.message}`);
        return false;
    }
}

// Feature 파일 이동 (상태 변경 시)
async function moveFeatureFile(featureId, currentPath, oldStatus, newStatus) {
    const FEATURE_LEDGERS_PATH = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS');
    const statusFolderMap = {
        'active': 'active',
        'in_progress': 'active',
        'planned': 'active',
        'completed': 'completed',
        'archived': 'archived',
        'paused': 'active'
    };

    const oldFolder = statusFolderMap[oldStatus] || 'active';
    const newFolder = statusFolderMap[newStatus] || 'active';

    if (oldFolder === newFolder) {
        return; // 같은 폴더면 이동 불필요
    }

    try {
        const fileName = path.basename(currentPath);
        const newPath = path.join(FEATURE_LEDGERS_PATH, newFolder, fileName);
        
        // 대상 폴더 확인 및 생성
        await fs.mkdir(path.dirname(newPath), { recursive: true });
        
        // 파일 이동
        await fs.rename(currentPath, newPath);
        
        console.log(`✓ Moved feature file to ${newFolder}/`);
    } catch (error) {
        console.error(`Warning: Could not move feature file: ${error.message}`);
    }
}

// Feature 진행률 계산 및 업데이트
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

        // 진행률 계산 로직
        let progress = 0;
        
        // 1. 체크리스트 기반 (40%)
        if (metadata.checklist_items_total && metadata.checklist_items_total > 0) {
            const checklistProgress = (metadata.checklist_items_completed || 0) / metadata.checklist_items_total;
            progress += checklistProgress * 40;
        }

        // 2. 태스크 완료 기반 (40%)
        if (metadata.tasks && metadata.tasks.length > 0) {
            // 여기서는 단순히 태스크 수로 계산 (실제로는 각 태스크 상태를 확인해야 함)
            const taskProgress = 0.5; // 임시값
            progress += taskProgress * 40;
        }

        // 3. 시간 경과 기반 (20%)
        if (metadata.estimated_completion && metadata.created_date) {
            const created = new Date(metadata.created_date);
            const estimated = new Date(metadata.estimated_completion);
            const now = new Date();
            
            const totalDays = (estimated - created) / (1000 * 60 * 60 * 24);
            const elapsedDays = (now - created) / (1000 * 60 * 60 * 24);
            
            if (totalDays > 0) {
                const timeProgress = Math.min(elapsedDays / totalDays, 1);
                progress += timeProgress * 20;
            }
        }

        // 진행률 업데이트
        metadata.progress_percentage = Math.round(progress);
        metadata.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);

        // 파일 업데이트
        const updatedContent = updateYamlFrontmatter(content, metadata);
        await fs.writeFile(featurePath, updatedContent);

        console.log(`✓ Updated feature ${featureId} progress: ${metadata.progress_percentage}%`);
        return true;
    } catch (error) {
        console.error(`Error updating feature progress: ${error.message}`);
        return false;
    }
}

// 메인 함수
async function main() {
    const args = process.argv.slice(2);
    const featureId = args[0];
    const newStatus = args[1];

    if (!featureId) {
        console.error('Usage: update-feature-status.js <feature-id> [status]');
        console.error('\nStatus options:');
        console.error('  active      Feature is being worked on');
        console.error('  completed   Feature implementation is complete');
        console.error('  paused      Work is temporarily halted');
        console.error('  archived    Feature is no longer relevant');
        console.error('\nOr update progress:');
        console.error('  update-feature-status.js <feature-id> --progress');
        process.exit(1);
    }

    if (newStatus === '--progress') {
        await updateFeatureProgress(featureId);
    } else if (newStatus) {
        const validStatuses = ['active', 'completed', 'paused', 'archived', 'in_progress', 'planned'];
        if (!validStatuses.includes(newStatus)) {
            console.error(`Invalid status: ${newStatus}`);
            console.error(`Valid statuses: ${validStatuses.join(', ')}`);
            process.exit(1);
        }
        await updateFeatureStatus(featureId, newStatus);
    } else {
        // 상태를 지정하지 않으면 진행률만 업데이트
        await updateFeatureProgress(featureId);
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
    updateFeatureStatus,
    updateFeatureProgress
};
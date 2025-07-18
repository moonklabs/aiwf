#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { parseYamlFrontmatter, updateYamlFrontmatter, getFeaturePath } from '../src/utils/git-integration.js';

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
        }
        
        // 파일 업데이트
        const updatedContent = updateYamlFrontmatter(content, metadata);
        await fs.writeFile(featurePath, updatedContent, 'utf-8');
        
        console.log(`✅ Feature ${featureId} status updated: ${oldStatus} → ${newStatus}`);
        return true;
        
    } catch (error) {
        console.error(`Error updating feature ${featureId}:`, error.message);
        return false;
    }
}

// CLI 실행
if (process.argv.length < 4) {
    console.log('Usage: node update-feature-status.js <featureId> <newStatus>');
    console.log('Status: planning | active | completed | archived');
    process.exit(1);
}

const featureId = process.argv[2];
const newStatus = process.argv[3];

const validStatuses = ['planning', 'active', 'completed', 'archived'];
if (!validStatuses.includes(newStatus)) {
    console.error(`Invalid status: ${newStatus}`);
    console.log(`Valid statuses: ${validStatuses.join(', ')}`);
    process.exit(1);
}

updateFeatureStatus(featureId, newStatus)
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });

export { updateFeatureStatus };
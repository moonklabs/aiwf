#!/usr/bin/env node

const { extractFeatureId } = require('./git-integration.cjs');

// 테스트 케이스
const testCases = [
    // 기본 패턴
    { message: 'FL001 implement user login', expected: 'FL001' },
    { message: 'Add validation for FL002', expected: 'FL002' },
    { message: 'Quick fix FL999', expected: 'FL999' },
    
    // 브래킷 패턴
    { message: '[FL001] implement user login', expected: 'FL001' },
    { message: 'Add validation [FL002]', expected: 'FL002' },
    { message: '[FL003] - fix bug in authentication', expected: 'FL003' },
    
    // Conventional Commits
    { message: 'feat(FL001): implement JWT token generation', expected: 'FL001' },
    { message: 'fix(FL002): resolve token expiration bug', expected: 'FL002' },
    { message: 'docs(FL003): update API documentation', expected: 'FL003' },
    { message: 'style(FL004): format code according to guidelines', expected: 'FL004' },
    { message: 'refactor(FL005): simplify authentication logic', expected: 'FL005' },
    { message: 'test(FL006): add unit tests for auth service', expected: 'FL006' },
    { message: 'chore(FL007): update dependencies', expected: 'FL007' },
    
    // 해시태그 패턴
    { message: '#FL001 implement feature', expected: 'FL001' },
    { message: 'Update docs #FL002', expected: 'FL002' },
    { message: 'Bug fix #FL003 #FL004', expected: 'FL003' }, // 첫 번째만
    
    // 관련 패턴
    { message: 'relates to FL001', expected: 'FL001' },
    { message: 'This commit relates to FL002', expected: 'FL002' },
    { message: 'Related to FL003 and FL004', expected: 'FL003' },
    
    // 복합 케이스
    { message: 'feat(FL001): implement feature [FL002] #FL003', expected: 'FL001' }, // 첫 번째 우선
    { message: 'WIP: FL001 - work in progress', expected: 'FL001' },
    
    // 실패해야 하는 케이스
    { message: 'No feature ID in this commit', expected: null },
    { message: 'FL01 is too short', expected: null },
    { message: 'FL0001 is too long', expected: null },
    { message: 'fl001 lowercase should not match', expected: null },
    { message: 'XL001 wrong prefix', expected: null },
];

// 테스트 실행
function runTests() {
    console.log('AIWF Commit Message Parsing Test\n');
    console.log('Testing Feature ID extraction patterns...\n');
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
        const result = extractFeatureId(testCase.message);
        const success = result === testCase.expected;
        
        if (success) {
            passed++;
            console.log(`✓ Test ${index + 1}: "${testCase.message}"`);
            console.log(`  Expected: ${testCase.expected}, Got: ${result}\n`);
        } else {
            failed++;
            console.log(`✗ Test ${index + 1}: "${testCase.message}"`);
            console.log(`  Expected: ${testCase.expected}, Got: ${result}\n`);
        }
    });
    
    const total = passed + failed;
    const accuracy = (passed / total * 100).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log(`\nTest Results:`);
    console.log(`  Total tests: ${total}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Accuracy: ${accuracy}%`);
    
    if (accuracy >= 95) {
        console.log(`\n✓ Success! Parsing accuracy meets the 95% requirement.`);
    } else {
        console.log(`\n✗ Failed! Parsing accuracy (${accuracy}%) is below the 95% requirement.`);
        process.exit(1);
    }
}

// 추가 테스트: 실제 Git 로그에서 테스트
async function testWithGitLog() {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
        console.log('\n\n' + '='.repeat(50));
        console.log('\nTesting with recent Git commits...\n');
        
        const { stdout } = await execAsync('git log --oneline -20');
        const commits = stdout.trim().split('\n');
        
        let foundCount = 0;
        commits.forEach(commit => {
            const featureId = extractFeatureId(commit);
            if (featureId) {
                foundCount++;
                console.log(`✓ Found ${featureId} in: ${commit}`);
            }
        });
        
        console.log(`\nFound Feature IDs in ${foundCount} out of ${commits.length} recent commits`);
    } catch (error) {
        console.log('Could not test with Git log (not in a Git repository or no commits)');
    }
}

// 메인 실행
async function main() {
    runTests();
    await testWithGitLog();
}

if (require.main === module) {
    main();
}
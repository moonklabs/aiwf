import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const ROOT = path.resolve(process.cwd(), 'claude-code/aiwf/.aiwf');
const OUTPUT = path.join(ROOT, '10_STATE_OF_PROJECT', 'index.json');

// Directories to scan for milestone/sprint/task markdown files
const SCAN_DIRS = [
    '01_PROJECT_DOCS',
    '02_REQUIREMENTS',
    '03_SPRINTS',
    '04_GENERAL_TASKS'
].map(dir => path.join(ROOT, dir));

function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function buildIndex() {
    /** @type {{milestones: Record<string, any>, sprints: Record<string, any>, tasks: Record<string, any>}} */
    const index = { milestones: {}, sprints: {}, tasks: {} };

    const patterns = SCAN_DIRS.map(d => `${d}/**/*.md`);
    const files = fg.sync(patterns, { dot: false, unique: true });

    files.forEach(file => {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, 'utf-8');
        const { data } = matter(content);
        if (!data || !data.id || !data.type) return; // skip non-annotated files

        const base = {
            title: data.title || path.basename(file, '.md'),
            file: relPath,
            status: data.status || 'todo',
            ...(data.assignee ? { assignee: data.assignee } : {}),
            ...(data.tags ? { tags: data.tags } : {}),
            ...(data.lockedBy ? { lockedBy: data.lockedBy } : {})
        };

        if (data.type === 'milestone') {
            index.milestones[data.id] = {
                ...base,
                due: data.due || null,
                sprints: data.sprints || []
            };
        } else if (data.type === 'sprint') {
            index.sprints[data.id] = {
                ...base,
                milestone: data.milestone || null,
                tasks: data.tasks || []
            };
        } else if (data.type === 'task') {
            index.tasks[data.id] = {
                ...base,
                sprint: data.sprint || null,
                milestone: data.milestone || null
            };
        }
    });

    return index;
}

function main() {
    const index = buildIndex();
    ensureDirSync(path.dirname(OUTPUT));
    fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));
    console.log(`[aiwf] index.json generated with ${Object.keys(index.milestones).length} milestones, ${Object.keys(index.sprints).length} sprints, ${Object.keys(index.tasks).length} tasks.`);
}

if (require.main === module) {
    main();
} 
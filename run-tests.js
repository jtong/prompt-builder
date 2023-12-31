const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const excludedFolders = ['node_modules',
    'dist',
    'doc',
    'ai_helper',
    'test', // 因为当前文件夹也会执行，所以test自然会被执行，所以不需要再遍历test
    '.git',
    'related_files_finder',
    'build'
];
const testFiles = [];

function collectTestFiles(dir) {
    if (excludedFolders.includes(path.basename(dir))) {
        return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file === 'test' && fs.existsSync(path.join(fullPath, 'index.js'))) {
                testFiles.push(path.join(fullPath, 'index.js'));
            } else {
                collectTestFiles(fullPath);
            }
        }
    });
}

function runTests() {
    if (testFiles.length === 0) {
        console.log('No tests found.');
        return;
    }

    const mochaCommand = `mocha ${testFiles.join(' ')}`;
    console.log(`Executing: ${mochaCommand}`);
    execSync(mochaCommand, { stdio: 'inherit' });
}

collectTestFiles(__dirname);
runTests();

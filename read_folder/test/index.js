const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const expect = require('chai').expect;
const { describe, it } = require('mocha');

// 引入被测对象
const read_folder_tree = require('../index');

// 定义测试用例根目录
const casesRootDir = path.join(__dirname, 'cases');

// 递归遍历目录并获取所有测试用例文件
function getTestCases(dir) {
    const testCases = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            testCases.push(...getTestCases(filePath));
        } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            testCases.push({ filePath, dir });
        }
    }

    return testCases;
}

describe('read_folder_tree 函数测试', function() {
    const testCases = getTestCases(casesRootDir);

    testCases.forEach(({ filePath, dir }) => {
        const testCase = yaml.load(fs.readFileSync(filePath, 'utf8'));

        it(testCase.desc, function() {
            const project = {
                base_path: path.join(dir, testCase.given.project_dir),
                ...testCase.given
            };

            const jsonResult = {};
            const actualFolderTree = read_folder_tree(project, jsonResult);

            expect(actualFolderTree).to.equal(testCase.then.expected_folder_tree);
            expect(jsonResult).to.deep.equal(testCase.then.expected_json_result);
        });
    });
});
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const expect = require('chai').expect;
const { describe, it } = require('mocha');

// 引入被测对象
const { renderTemplate } = require('../prompt_render.js');

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
        } else if (file.endsWith('.yaml')) {
            testCases.push({ filePath, dir });
        }
    }

    return testCases;
}

describe('EJS模板渲染测试', function() {
    const testCases = getTestCases(casesRootDir);

    testCases.forEach(({ filePath, dir }) => {
        const testCase = yaml.load(fs.readFileSync(filePath, 'utf8'));

        it(testCase.desc, function() {
            const inputTemplateText = fs.readFileSync(path.join(dir, testCase.given.targetFile), 'utf8');
            let config_file = testCase.given.config_file || 'config.yml';
            let context_file = testCase.given.context_file || 'related_files.yml';

            const baseDir = path.resolve(__dirname, "../");
            const actualResult = renderTemplate(inputTemplateText, config_file, context_file, baseDir);
            console.log(actualResult)
            const expectedTemplateText = fs.readFileSync(path.join(dir, testCase.then.expectedResult), 'utf8');

            expect(actualResult).to.equal(expectedTemplateText);
        });
    });
});
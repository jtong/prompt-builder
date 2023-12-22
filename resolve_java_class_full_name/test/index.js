const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const assert = require('chai').assert;
const resolveClassName = require('../index.js'); // 导入被测试的函数

// 动态加载测试用例
function loadTestCases() {
    const testCasesPath = path.join(__dirname, 'cases');
    const testCases = [];

    fs.readdirSync(testCasesPath).forEach(file => {
        const filePath = path.join(testCasesPath, file);
        const stat = fs.statSync(filePath);

        // 检查是否为文件且扩展名为 .yml
        if (stat.isFile() && path.extname(filePath) === '.yml') {
            const testCase = yaml.load(fs.readFileSync(filePath, 'utf8'));
            testCases.push(testCase);
        }
    });

    return testCases;
}

// 执行测试
describe('resolveClassName Function Tests', function() {
    const testCases = loadTestCases();

    testCases.forEach(testCase => {
        it(testCase.desc, function() {
            const { className, imports, currentPackage, basePackage } = testCase.given.arg;
            sourceRoot = "./resolve_java_class_full_name/test/cases/project/src/main/java"
            const expectedResult = testCase.then.expectedResult;

            // 调用函数并断言
            const result = resolveClassName(className, imports, currentPackage, basePackage, sourceRoot);
            assert.equal(result, expectedResult);
        });
    });
});

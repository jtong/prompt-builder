const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const extractMethodDetails  = require('../index');
const { parse } = require('java-parser');


// const isDebugModel = false;
const isDebugModel = fs.readdirSync(path.join(__dirname, 'cases', 'debug')).filter(file => file.endsWith('.yaml') || file.endsWith('.yml')).length > 0;

describe('Method Details Extraction Tests', function() {
    // 读取 test/cases 目录下的所有 YAML 测试用例
    let casesFolder = fs.readdirSync(path.join(__dirname, 'cases'));
    if(isDebugModel){
        casesFolder = fs.readdirSync(path.join(__dirname, 'cases', 'debug'));
    }
    const testCases = casesFolder
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => {
            let filePath = path.join(__dirname, 'cases', file);
            if(isDebugModel){
                filePath = path.join(__dirname, 'cases', 'debug', file);
            }
            const testData = yaml.load(fs.readFileSync(filePath, 'utf8'));
            return testData;
        });

    // 为每个测试用例创建一个测试
    testCases.forEach(testCase => {
        it(testCase.desc, function() {
            // 读取目标文件内容

            let targetFilePath = path.join(__dirname, 'cases', testCase.given.targetFile);
            if(isDebugModel) {
                targetFilePath = path.join(__dirname, 'cases', 'debug',testCase.given.targetFile);
            }
            const targetFileContent = fs.readFileSync(targetFilePath, 'utf8');

            // 解析文件中的第一个代码块作为 Java 代码
            const javaCode = targetFileContent.match(/```java\n([\s\S]*?)\n```/)[1];

            // 使用 `java-parser` 解析 Java 代码
            const cst = parse(javaCode);

            // 提取方法详细信息并验证结果
            const result = extractMethodDetails(cst.children.ordinaryCompilationUnit[0].children.typeDeclaration[0]);
            expect(result).to.deep.equal(testCase.then.expectedResult);
        }, testCase.desc);
    });
});

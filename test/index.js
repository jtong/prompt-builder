const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const expect = require('chai').expect;
const { describe, it } = require('mocha');

// 引入被测对象
const  renderTemplate = require('../prompt_render.js');

// 定义测试用例目录
const casesDir = path.join(__dirname, 'cases');

describe('EJS模板渲染测试', function() {
    // 遍历cases目录下的所有.yaml文件
    fs.readdirSync(casesDir).filter(file => file.endsWith('.yaml')).forEach(file => {

        const filePath = path.join(casesDir, file);
        const testCase = yaml.load(fs.readFileSync(filePath, 'utf8'));

        it(testCase.desc, function() {
            // 从given中获取输入参数
            const inputTemplateText = fs.readFileSync(path.join(casesDir, testCase.given.targetFile), 'utf8');
            let config_file = 'config.yml';
            let context_file = 'related_files.yml';

            const baseDir = path.resolve(__dirname, "../");
            // 执行渲染函数
            const actualResult = renderTemplate(inputTemplateText, config_file, context_file, baseDir);
            console.log(actualResult)
            // 从then中获取期望的结果
            const expectedTemplateText = fs.readFileSync(path.join(casesDir, testCase.then.expectedResult), 'utf8');

            // 断言结果是否符合预期
            expect(actualResult).to.equal(expectedTemplateText);
        });
    });
});

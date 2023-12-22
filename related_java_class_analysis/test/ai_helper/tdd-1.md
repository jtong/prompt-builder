## 测试代码

```javascript
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const extractMethodDetails  = require('../index');
const { parse } = require('java-parser');

describe('Method Details Extraction Tests', function() {
    // 读取 test/cases 目录下的所有 YAML 测试用例
    const testCases = fs.readdirSync(path.join(__dirname, 'cases'))
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => {
            const filePath = path.join(__dirname, 'cases', file);
            const testData = yaml.load(fs.readFileSync(filePath, 'utf8'));
            return testData;
        });

    // 为每个测试用例创建一个测试
    testCases.forEach(testCase => {
        it(testCase.desc, function() {
            // 读取目标文件内容
            const targetFilePath = path.join(__dirname, 'cases',testCase.given.targetFile);
            const targetFileContent = fs.readFileSync(targetFilePath, 'utf8');

            // 解析文件中的第一个代码块作为 Java 代码
            const javaCode = targetFileContent.match(/```java\n([\s\S]*?)\n```/)[1];

            // 使用 `java-parser` 解析 Java 代码
            const cst = parse(javaCode);

            // 提取方法详细信息并验证结果
            const result = extractMethodDetails(cst.children.ordinaryCompilationUnit[0].children.typeDeclaration[0]);
            expect(result).to.deep.equal(testCase.then.expectedResult);
        });
    });
});
```

## 测试数据

### 1.yml

```yaml
desc: "测试简单的无参方法和静态方法"
given:
  targetFile: "1.md"
then:
  expectedResult:
      classes:
      - name: "OtherClass"
        methods:
          - methodCall
```

### 1.md

````markdown
```java
    public void exampleMethod() {
        OtherClass.methodCall();
    }
```
````

## 被测函数

```javascript
const {parse} = require('java-parser');

function traverseStatements(blockStatementNode, callback) {
    if (!blockStatementNode) return;

    blockStatementNode.forEach(statementNode => {
        // 根据不同类型的语句执行不同的操作
        if (statementNode.children.statement) { //表示是try、if等
            const statement = statementNode.children.statement[0];

            // 处理 try 语句
            if (statement.children.statementWithoutTrailingSubstatement && statement.children.statementWithoutTrailingSubstatement[0].children.tryStatement) {
                const tryStatement = statement.children.statementWithoutTrailingSubstatement[0].children.tryStatement[0];
                // 递归处理 try 语句中的 block
                if (tryStatement.children.block) {
                    traverseStatements(tryStatement.children.block[0].children.blockStatements[0].children.blockStatement, callback);
                }
            }

            // 处理 if 语句
            if (statement.children.ifStatement) {
                processIfStatement(statementNode.children.statement[0].children.ifStatement[0], callback);
            }

            // 处理其他类型的语句...
        }

        // 执行回调处理当前语句
        callback(statementNode);
    });
}

// 提取类和方法依赖
function extractDependencies(method) {
    const dependencies = {classes: []};


    const blockStatements = method.children.methodDeclaration[0].children.methodBody[0].children.block[0].children.blockStatements;

    if (blockStatements && blockStatements[0] && blockStatements[0].children.blockStatement) {
        traverseStatements(blockStatements[0].children.blockStatement, processStatement);
    }


    function processStatement(statementNode) {
        // 在这里处理每个语句节点
        // 例如，解析方法调用、类实例化等
        if (statementNode.children.localVariableDeclarationStatement) {
            const typeName = statementNode.children.localVariableDeclarationStatement[0].children.localVariableDeclaration[0].children.localVariableType[0].children.unannType[0].children.unannReferenceType[0].children.unannClassOrInterfaceType[0].children.unannClassType[0].children.Identifier[0].image;
            dependencies.classes.add(typeName)
        }
        console.log(statementNode);
    }

    return dependencies;
}

module.exports = extractDependencies;
```

## 任务

给被测函数添加新代码，通过上面的测试

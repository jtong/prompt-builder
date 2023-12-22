const fs = require('fs');
const yaml = require('js-yaml');
const javaParser = require('java-parser');

// 读取YAML文件
const yamlContent = fs.readFileSync('controller_sut_config.yml', 'utf8');
const config = yaml.load(yamlContent);

// 读取Java文件
const javaContent = fs.readFileSync("../"+config.path, 'utf8');

// 解析Java文件
const javaAST = javaParser.parse(javaContent);

// 提取package信息
const packageDeclarationNode = javaAST.children.ordinaryCompilationUnit[0].children.packageDeclaration;
const packageDeclaration = packageDeclarationNode ?
    packageDeclarationNode[0].children.Identifier.map(id => id.image).join('.') :
    '';

// 提取import声明
const importDeclarations = javaAST.children.ordinaryCompilationUnit[0].children.importDeclaration || [];
const imports = importDeclarations.map(imp =>
    imp.children.packageOrTypeName[0].children.Identifier.map(id => id.image).join('.'));

// 提取所有字段和方法
const classBodyDeclarations = javaAST.children.ordinaryCompilationUnit[0].children.typeDeclaration[0].children.classDeclaration[0].children.normalClassDeclaration[0].children.classBody[0].children.classBodyDeclaration;

const fields = classBodyDeclarations.filter(declaration => declaration.children.classMemberDeclaration[0].children.fieldDeclaration);
const methodsToKeep = new Set(config.methods);
const filteredMethods = classBodyDeclarations.filter(declaration => {
    if (declaration.children.classMemberDeclaration[0].children.methodDeclaration) {
        const methodName = declaration.children.classMemberDeclaration[0].children.methodDeclaration[0].children.methodHeader[0].children.methodDeclarator[0].children.Identifier[0].image;
        return methodsToKeep.has(methodName);
        // return methodsToKeep(declaration.children.classMemberDeclaration[0].children.methodDeclaration[0]);
    }
    return false;
});

const packageNamespace = "dev.jtong.training.demo.smart.domain" // 这个package name下的所有类看做是项目里的类


// ...

// 处理 if 语句
function processIfStatement(ifStatementNode, callback) {
    if (!ifStatementNode) return;

    // 处理条件表达式
    const condition = ifStatementNode.children.expression[0];
    // 在这里可以对条件表达式进行分析

    // 递归处理 then 块
    const thenStatement = ifStatementNode.children.statement[0];
    if (thenStatement.children.blockStatements) {
        traverseStatements(thenStatement.children.blockStatements[0].children.blockStatement, callback);
    } else {
        // 单条语句的处理
        callback(thenStatement);
    }

    // 如果存在 else 块，递归处理
    if (ifStatementNode.children.elseStatement) {
        const elseStatement = ifStatementNode.children.elseStatement[0];
        if (elseStatement.children.blockStatements) {
            traverseStatements(elseStatement.children.blockStatements[0].children.blockStatement, callback);
        } else {
            // 单条语句的处理
            callback(elseStatement);
        }
    }
}

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

// 示例回调函数
function processStatement(statementNode) {
    // 在这里处理每个语句节点
    // 例如，解析方法调用、类实例化等
    if(statementNode.children.localVariableDeclarationStatement){
        const typeName = statementNode.children.localVariableDeclarationStatement[0].children.localVariableDeclaration[0].children.localVariableType[0].children.unannType[0].children.unannReferenceType[0].children.unannClassOrInterfaceType[0].children.unannClassType[0].children.Identifier[0].image;
        if(isClassInProject(typeName, imports,packageNamespace)) {

        }
    }
    console.log(statementNode);
}


// 遍历方法的所有表达式
filteredMethods.forEach(method => {
    const blockStatements = method.children.classMemberDeclaration[0].children.methodDeclaration[0].children.methodBody[0].children.block[0].children.blockStatements;
    if (blockStatements && blockStatements[0] && blockStatements[0].children.blockStatement) {
        traverseStatements(blockStatements[0].children.blockStatement, processStatement);
    }
});

function isClassInPackage(className, packageNamespace) {
    return className.startsWith(packageNamespace + ".");
}

// 查找类的完整名称
function isClassInProject(className, imports, packageNamespace) {
    // 如果类名已经包含包路径
    if (className.includes('.')) {
        return isClassInPackage(className, packageNamespace) ? className : null;
    }

    // 检查每个导入声明
    for (const importDeclaration of imports) {
        if (importDeclaration.endsWith("."+className)) {
            const fullClassName = importDeclaration;
            if (isClassInPackage(fullClassName, packageNamespace)) {
                return fullClassName;
            }
        }
    }

    // 如果在导入声明中没有找到，并且类名不包含包路径，则假设它在当前包中
    return isClassInPackage(packageNamespace + "." + className, packageNamespace) ? packageNamespace + "." + className : null;
}

// 解析方法调用
// function parseMethodCall(node) {
//     if (!node || !node.children || !node.children.methodInvocation) return null;
//     const methodInvocation = node.children.methodInvocation[0];
//
//     // 解析方法调用的详细信息，例如方法名称和调用对象
//     const methodName = methodInvocation.children.methodName[0].children.Identifier[0].image;
//     const objectOrClass = methodInvocation.children.expression ? methodInvocation.children.expression[0].children.primary[0].children.Identifier[0].image : null;
//
//     return { methodName, objectOrClass };
// }
//
// // 解析类实例化
// function parseClassInstantiation(node) {
//     if (!node || !node.children || !node.children.statementExpression) return null;
//     const statementExpression = node.children.statementExpression[0];
//     if (!statementExpression.children.classInstanceCreationExpression) return null;
//     const classInstanceCreation = statementExpression.children.classInstanceCreationExpression[0];
//
//     // 获取类名
//     const className = classInstanceCreation.children.typeName[0].children.Identifier.map(id => id.image).join('.');
//     return className;
// }
//
//
// function analyzeDependencies(methods) {
//     const dependencies = {};
//
//     methods.forEach(method => {
//         const methodName = method.children.classMemberDeclaration[0].children.methodDeclaration[0].children.methodHeader[0].children.methodDeclarator[0].children.Identifier[0].image;
//         dependencies[methodName] = { classes: new Set(), methods: new Set() };
//
//         const methodBlock = method.children.classMemberDeclaration[0].children.methodDeclaration[0].children.methodBody[0].children.block;
//
//         methodBlock.forEach(statement => {
//             // 分析类实例化
//             const className = parseClassInstantiation(statement);
//             if (className && className.startsWith(packageNamespace)) {
//                 dependencies[methodName].classes.add(className);
//             }
//
//             // 分析方法调用
//             const methodCall = parseMethodCall(statement);
//             if (methodCall && methodCall.objectOrClass && methodCall.objectOrClass.startsWith(packageNamespace)) {
//                 dependencies[methodName].methods.add(`${methodCall.objectOrClass}.${methodCall.methodName}`);
//             }
//         });
//     });
//
//     return dependencies;
// }
//
// const methodDependencies = analyzeDependencies(filteredMethods);

// console.log(methodDependencies);





// 输出到控制台

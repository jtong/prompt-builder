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

function handle_static_call_expression(expression, dependencies) {
    if (expression.children.expression[0].children.ternaryExpression[0].children.binaryExpression[0].children.unaryExpression[0].children.primary) {
        const primary = expression.children.expression[0].children.ternaryExpression[0].children.binaryExpression[0].children.unaryExpression[0].children.primary[0];
        const methodName = primary.children.primaryPrefix[0].children.fqnOrRefType[0].children.fqnOrRefTypePartRest[0].children.fqnOrRefTypePartCommon[0].children.Identifier[0].image
        const className = primary.children.primaryPrefix[0].children.fqnOrRefType[0].children.fqnOrRefTypePartFirst[0].children.fqnOrRefTypePartCommon[0].children.Identifier[0].image;
        dependencies.classes.push({name: className, methods: [methodName]});
    }
}

// 提取类和方法依赖
function extractDependencies(method) {
    const dependencies = {classes: []};

    const blockStatements = method.children.methodDeclaration[0].children.methodBody[0].children.block[0].children.blockStatements;

    (function methodDefinitionDepend(){
        const methodDef = method.children.methodDeclaration[0].children.methodHeader[0];
        const resultDef = methodDef.children.result[0];
        if(!resultDef.children.Void){
            const resultClassName = resultDef.children.unannType[0].children.unannReferenceType[0].children.unannClassOrInterfaceType[0].children.unannClassType[0].children.Identifier[0].image;
            dependencies.classes.push({name:resultClassName});
        }
    })()


    if (blockStatements && blockStatements[0] && blockStatements[0].children.blockStatement) {
        traverseStatements(blockStatements[0].children.blockStatement, processStatement);
    }




    function processStatement(statementNode) {
        // 在这里处理每个语句节点
        // 例如，解析方法调用、类实例化等
        if (statementNode.children.localVariableDeclarationStatement) {
            // const typeName = statementNode.children.localVariableDeclarationStatement[0].children.localVariableDeclaration[0].children.localVariableType[0].children
            const typeName = statementNode.children.localVariableDeclarationStatement[0].children.localVariableDeclaration[0].children.localVariableType[0].children.unannType[0].children.unannReferenceType[0].children.unannClassOrInterfaceType[0].children.unannClassType[0].children.Identifier[0].image;
            dependencies.classes.push({name: typeName});
        }

        // static method call
        if (statementNode.children.statement) {
            // 单独调用
            if (statementNode.children.statement[0].children.statementWithoutTrailingSubstatement[0].children.expressionStatement) {
                const expression = statementNode.children.statement[0].children.statementWithoutTrailingSubstatement[0].children.expressionStatement[0].children.statementExpression[0];
                handle_static_call_expression(expression, dependencies);

            }
            //  return 后调用
            if (statementNode.children.statement[0].children.statementWithoutTrailingSubstatement[0].children.returnStatement) {
                const expression = statementNode.children.statement[0].children.statementWithoutTrailingSubstatement[0].children.returnStatement[0];
                handle_static_call_expression(expression, dependencies);
            }
        }
        // console.log(statementNode);
    }

    return dependencies;
}

module.exports = extractDependencies;
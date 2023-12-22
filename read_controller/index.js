const fs = require('fs');
const javaParser = require("java-parser");
const import_read = require("../import_read");

function read_controller(project_base, config) {
    const javaContent = fs.readFileSync(project_base + config.path, 'utf8');

// 解析Java文件
    const javaAST = javaParser.parse(javaContent);

// 提取package信息
    const packageDeclarationNode = javaAST.children.ordinaryCompilationUnit[0].children.packageDeclaration;
    const packageDeclaration = packageDeclarationNode ?
        packageDeclarationNode[0].children.Identifier.map(id => id.image).join('.') :
        '';

// 提取import声明
    const importDeclarations = javaAST.children.ordinaryCompilationUnit[0].children.importDeclaration || [];
// const imports = importDeclarations.map(imp =>
//     imp.children.packageOrTypeName[0].children.Identifier.map(id => id.image).join('.'));

    const imports = import_read(javaAST);
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

// 组合新的Java文件内容
    let newJavaContent = '';
    if (packageDeclaration) {
        newJavaContent += `package ${packageDeclaration};\n\n`;
    }
    if (imports.length > 0) {
        imports.forEach(importDepend => newJavaContent += `import ${importDepend};\n`);
        newJavaContent += '\n\n';
    }

    const typeDeclaration = javaAST.children.ordinaryCompilationUnit[0].children.typeDeclaration[0];
    const classDeclarationStartOffset = typeDeclaration.location.startOffset;
// let classDeclarationEndOffset = javaContent.indexOf('{', classDeclarationStartOffset) + 1; // 包含大括号
    let classDeclarationEndOffset = typeDeclaration.children.classDeclaration[0].children.normalClassDeclaration[0].children.classBody[0].children.LCurly[0].startOffset + 1; // 包含大括号
    const classDeclarationText = javaContent.substring(classDeclarationStartOffset, classDeclarationEndOffset);

    newJavaContent += classDeclarationText + "\n";

    fields.forEach(field => {
        const startOffset = field.location.startOffset;
        const endOffset = field.location.endOffset;
        const fieldText = javaContent.substring(startOffset, endOffset + 1);
        newJavaContent += '    ' + fieldText + '\n';
    });


    filteredMethods.forEach(method => {
        const methodNode = method.children.classMemberDeclaration[0].children.methodDeclaration[0];
        const startOffset = methodNode.location.startOffset;
        const endOffset = methodNode.location.endOffset;
        const methodText = javaContent.substring(startOffset, endOffset + 1);
        newJavaContent += '    ' + methodText + '\n';
    });

    newJavaContent += '}';
    return newJavaContent;
}

module.exports = read_controller;
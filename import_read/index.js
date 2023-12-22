module.exports = function (javaAST) {
    // 提取import声明
    const importDeclarations = javaAST.children.ordinaryCompilationUnit[0].children.importDeclaration || [];
    const imports = importDeclarations.map(imp => {
        let result = imp.children.packageOrTypeName[0].children.Identifier.map(id => id.image).join('.');
        if(imp.children.Star){
            result += ".*";
        }
        return result;
    });

    return imports;

}
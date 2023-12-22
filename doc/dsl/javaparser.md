packageDeclaration需要从javaAST.children.ordinaryCompilationUnit[0].packageDeclaration 中取。
imports需要从javaAST.children.ordinaryCompilationUnit[0].importDeclaration 中取。
fields 和 methods需要从javaAST.children.ordinaryCompilationUnit[0].children.typeDeclaration[0].children.classDeclaration[0].children.normalClassDeclaration[0].children.classBody[0].children.classBodyDeclaration中过滤。


代码表达式： 

## 代码行总体结构

所有的函数的一级子节点为：

node.children.blockStatements[0].children.blockStatement

其中blockStatement为一个数组

### try

```javascript
node.children.blockStatements[0].children.blockStatement[0].children.statement[0].children.statementWithoutTrailingSubstatement[0].children.tryStatement[0]
```

### if

```javascript
node.children.blockStatements[0].children.blockStatement[1].children.statement[0].children.ifStatement[0]
```


### declare

```javascript
node.children.blockStatements[0].children.blockStatement[2].children.localVariableDeclarationStatement[0].children.localVariableDeclaration[0].children
```
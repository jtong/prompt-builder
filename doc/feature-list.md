## [x] 读取源代码的imports

### issue

- [x] .*丢掉了*

## 类名和方法依赖识别

### scenario：

- [] localVariableDeclarationStatement
- [] ternaryExpression/binaryExpression
  - [] if expression
    - [] method call
    - [] variable
- [] statementWithoutTrailingSubstatement
- [] returnStatement
  - [] method call

- 记录类名
- 记录类的函数
    - 模型类不需要依赖函数

## [x] 根据类名判断在不在项目里，并取得类的全路径

这样才能进一步读取上下文

### scenario：

- 根据import 全名判断
- 根据import * 判断
- 读取当前文件夹的其他类
- 读取内部类


## 识别是模型类

- 根据domain model所在的文件夹
- 根据annotation
- 根据标记接口

## 读取模型类

- [x] 读取field
- 删掉setter、getter，用注释替代
  - [x] 删掉setter、getter，
- [x] 其他方法保留
- 读取constructor


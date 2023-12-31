## 技术上下文

我们开发的是一个基于nodejs的工具，其工程的文件夹树形结构如下：

```
<%-folder_tree()%>
```

## 相关文件

``yaml
manual_related_files:
- **/controller/UserController
- **/controller/presentation/*
  ``

## 输出格式

```yaml
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/UsersController.java
  reader: controller
  methods:
    - changePassword
```

这个 YAML 文件的结构是列表形式的，每个条目都定义了一个文件的路径、类型和（可选的）特定方法。列表的每一项包含了以下几个部分：

1. `path`: 这个键表示一个文件的相对路径。在这里，`path` 的值指的是相对于config 配置文件中 `base_path` 的相对路径。例如：
    - `src/main/java/dev/jtong/training/demo/smart/domain/controllers/UsersController.java`

2. `reader`: 这个键指明了对应文件的类型或用途。在这里，它可能表示用于读取或解析该文件的工具或方法。例如：
    - `controller`: 这表明第一个文件被视为控制器类。
    - `model`: 这表明第二个文件被视为模型类。

3. `methods`: 这个键是一个列表，指定了文件中特定的方法或函数。这个键是可选的，只在需要时出现。例如：
    - `changePassword`: 这是在 `UsersController.java` 文件中的一个特定方法。表示只读取这一个方法。

## 任务

找出符合“相关文件”章节中通配符描述的文件，按照上面要求的格式输出，并推演出所有的reader，其规则为：

- controllers文件夹下的所有Controller为名的java文件，reader都是controller
- controllers/representation文件夹下的所有文件，reader都是model

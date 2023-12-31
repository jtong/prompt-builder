## 使用方式

### 安装

```shell
npm install -g prompt-context-builder
```

### 使用

在项目根目录建立一个文件夹，比如prompt_builder，比如：

```
.
├── pom.xml
├── prompt_builder
│   ├── output
│   ├── prompt
│   │   ├── config.yml
│   │   └── 1.md 
│   └── README.md
└── src
    ├── main
    │   └── java
    └── test
```

在prompt_builder下准备配置文件比如config.yml、related_files.yml和模版文件，比如1.md。

执行prompt_builder得到编译后的文本，通过`>`输出到指定文件：

```shell
prompt_builder -t prompt/1.md -c prompt/config.yml -x prompt/related_files.yml > output/1.md
```

### prompt_builder 命令说明

其中 -x 为可选参数。相关参数含义可以直接执行 prompt_builder 获得：

```shell
Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -t, --template  Path to the template file                  [string] [required]
  -c, --config    Path to the YAML config file               [string] [required]
  -x, --context   Path to the YAML context file                         [string]
```

### config 配置文件说明

config.yaml的示例如下：

```yaml
project:
  base_path: ../
  ignore:
    path:
      - prompt-builder
      - .git
    file:
      - .DS_Store
```
其中：
1. `project`: 这是最顶层的键，表示以下配置都是关于项目文件夹的。

2. `base_path`: 这里指定了项目文件夹的根路径。`../` 表示项目根目录是相对于当前文件夹的上级目录。当前文件夹为执行 `prompt_builder` 的路径

3. `ignore`: 这个键下定义了生成文件树时需要忽略的路径和文件。

    - `path`: 这个列表包含了不需要分析的文件夹。这些路径是基于 `base_path` 的相对路径。只有当路径完全匹配时，相应的文件夹才会被忽略。例如，`prompt-builder`、`.git` 等目录在生成文件树时会被忽略。

    - `file`: 这个列表包含了需要在所有子文件夹中忽略的同名文件。例如，`.DS_Store` 文件在任何子文件夹中都会被忽略。

这个配置文件的作用是帮助定义项目信息，并规定哪些文件和目录应该被排除在项目的分析或处理之外，比如在构建文件树时。这样可以避免不必要的文件和目录增加上下文的token数。

### context 的配置文件说明

context 的配置文件 related_files.yml 的示例如下：

```yaml
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/UsersController.java
  reader: controller
  methods:
    - changePassword
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/representation/UserVO.java
  reader: model
```

### 模版文件说明

模版使用的是ejs模版，在文本中支持相关的函数，在对应的位置打印出相关的上下文。

#### folder_tree 函数

```ejs
<%-folder_tree()%>
```

使用folder_tree函数可以打印出config下base_path指定路径下的文件树，以文本形式打印出来。类似：

```
.
├── pom.xml
└── src
    ├── main
    │   └── java
    └── test
```


#### related_files 函数

```ejs
<%-related_files()%>
```

使用 related_files 函数时必须提供 context 的配置文件，该函数会采用特定的reader读取相关文件生成相关文件的内容。类似：

```markdown

### src/main/java/dev/jtong/training/demo/smart/domain/controllers/representation/UserVO.java

\```
package dev.jtong.training.demo.smart.domain.controllers.representation;

import dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis.User;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class UserVO {
    private String id;
    private String name;
    private int age;
    private String password;
}
\```

```


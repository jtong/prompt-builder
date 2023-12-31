
# 使用方式 (Usage Instructions)

## 安装 (Installation)

首先安装 `prompt-context-builder` 工具：

```shell
npm install -g prompt-context-builder
```

## 使用 (Usage)

### 项目结构设置 (Setting up the Project Structure)

在您的项目根目录中创建一个名为 `prompt_builder` 的文件夹。例如，您的项目结构应如下所示：

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

在 `prompt_builder` 文件夹下，您需要准备配置文件（如 `config.yml` 和 `related_files.yml`）以及模板文件（如 `1.md`）。

### 生成文本 (Generating Text)

执行以下命令以使用 `prompt_builder` 生成编译后的文本，并将输出重定向到指定文件：

```shell
prompt_builder -t prompt/1.md -c prompt/config.yml -x prompt/related_files.yml > output/1.md
```

## prompt_builder 命令说明 (Command Description)

- `-x`: 此参数为可选项。
- 若要了解更多参数含义，可直接执行 `prompt_builder` 命令。

```shell
Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -t, --template  Path to the template file                  [string] [required]
  -c, --config    Path to the YAML config file               [string] [required]
  -x, --context   Path to the YAML context file                         [string]
```

## config 配置文件说明 (Config File Description)

`config.yaml` 文件的示例如下：

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

解释：
1. `project`: 项目的顶层配置键。
2. `base_path`: 指定项目文件夹的根路径。`../` 表示当前文件夹的上级目录。
3. `ignore`: 定义生成文件树时忽略的路径和文件。

   - `path`: 忽略的文件夹列表。基于 `base_path` 的相对路径。
   - `file`: 忽略的文件列表。适用于所有子文件夹。

## context 配置文件说明 (Context Config File Description)

`related_files.yml` 文件的示例如下：

```yaml
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/UsersController.java
  reader: controller
  methods:
    - changePassword
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/representation/UserVO.java
  reader: model
```

## 模版文件说明 (Template File Description)

模版文件使用 `ejs` 模版语法，允许在文本中插入相关函数。

### folder_tree 函数 (folder_tree Function)

```ejs
<%-folder_tree()%>
```

使用 `folder_tree` 函数可以显示 `config` 下 `base_path` 指定路径的文件树。

### related_files 函数 (related_files Function)

```ejs
<%-related_files()%>
```

使用 `related_files` 函数时，需要提供 `context` 配置文件。此函数会读取相关文件并生成内容。



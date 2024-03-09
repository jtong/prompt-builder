
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


## 打包整个项目作为上下文

```bash
context_packer -c <config_file> -o <output_zip>
```

- `-c, --config <config_file>`: YAML 配置文件路径
- `-o, --output <output_zip>`: 输出的 zip 文件路径

`context_packer` 命令读取 `config.yml` 文件,根据配置文件中指定的过滤规则过滤文件,并将过滤后的文件按原始目录结构压缩到 zip 文件中,以便将整个项目打包作为上下文。该命令主要服务于Claude3等长上下文LLM。


## IDE 插件支持

目前提供了vscode插件，项目地址为： https://github.com/jtong/prompt_builder_vscode_plugin

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

这个 YAML 文件的结构是列表形式的，每个条目都定义了一个文件的路径、类型和（可选的）特定方法。列表的每一项包含了以下几个部分：

1. `path`: 这个键表示一个文件的相对路径。在这里，`path` 的值指的是相对于config 配置文件中 `base_path` 的相对路径。例如：
   - `src/main/java/dev/jtong/training/demo/smart/domain/controllers/UsersController.java`

2. `reader`: 这个键指明了对应文件的类型或用途。在这里，它可能表示用于读取或解析该文件的工具或方法。例如：
   - `controller`: 这表明第一个文件被视为控制器类。
   - `model`: 这表明第二个文件被视为模型类。

3. `methods`: 这个键是一个列表，指定了文件中特定的方法或函数。这个键是可选的，只在需要时出现。例如：
   - `changePassword`: 这是在 `UsersController.java` 文件中的一个特定方法。表示只读取这一个方法。


## 模版文件说明 (Template File Description)

模版文件使用 `handlebars` 模版语法，允许在文本中插入相关函数。

### folder_tree 函数 (folder_tree Function)

```handlebars
{{folder_tree}}
```

使用 `folder_tree` 函数可以显示 `config` 下 `base_path` 指定路径的文件树。

### related_files 函数 (related_files Function)

```handlebars
{{related_files}}
```

使用 `related_files` 函数时，需要提供 `context` 配置文件。此函数会读取相关文件并生成内容。


### related_files_from 函数 (related_files_from Function)

```handlebars
{{#related_files_from}}
\```yaml
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/UsersController.java
  reader: controller
  methods:
    - changePassword
- path: src/main/java/dev/jtong/training/demo/smart/domain/controllers/representation/UserVO.java
  reader: model
\```
{{/related_files_from}}
```

使用 `related_files_from` 函数可以作为类似标签的使用方式，通过将开闭标签之间的内容作为related_files.yml中的内容使用，从而将相关文件内容内联到模版中使用。
注：上述演示中为了转义，在开闭标签中的 code block 标记之前加了\，因为不是所有的网页markdown渲染工具都支持转义语法，可能会显示出来，如果想看正确的用法可以直接查看 test/cases/3.input.md 。


### partial 函数 (partial Function)

```handlebars
{{#partial }}
\```yaml
path: /path/to/file
reader: all
\```
{{/partial }}
```

`partial` 函数允许你直接在模板中嵌入指定文件的内容。你需要在 `{{#partial}}...{{/partial}}` 标签中提供一个 YAML 配置，指定想要读取的文件路径 (`path`) 和使用的读取器 (`reader`)。目前，`reader` 的值固定为 `all`，表示将文件的全部内容读取并嵌入到模板中。

- `path`: 指定想要读取内容的文件相对路径或绝对路径。路径是相对于在配置文件中定义的 `base_path` 的路径。
- `reader`: 指定读取文件内容的方法。当前仅支持 `all` 作为值，意味着读取整个文件的内容。

注：上述演示中为了转义，在开闭标签中的 code block 标记之前加了\，因为不是所有的网页markdown渲染工具都支持转义语法，可能会显示出来，如果想看正确的用法可以直接查看 test/cases/5.input.md 。

当然,我来为`all_files_markdown`助手写一个说明,你可以将其添加到项目的`README.md`文件中。


## all_files_markdown 函数 (all_files_markdown Function)

`all_files_markdown`用于遍历项目中的所有文件,并以Markdown格式输出它们的内容。这个助手根据`config.yml`的过滤规则来选择要输出的文件，保证输出的文件与folder_tree的文件相同。

### 用法

在模板文件中,使用以下语法来调用`all_files_markdown`助手:

```handlebars
{{ all_files_markdown }}
```

## 支持的reader

### controller reader

用于读取Java代码中的controller，会保留所有的field，可以针对性的要求读取某个函数，会保留函数的所有注解

### model reader

用于读取Java代码中的 model，会保留所有的field，删除掉所有的setter和getter代码。

### all reader

读取文件所有内容，不做任何静态分析和预处理。


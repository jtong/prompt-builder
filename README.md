
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
  filter_in:
    path:
      - "src/**/*.js"
      - "!src/ignored/**"
      - "*.md"
```

解释：
1. `project`: 项目的顶层配置键。
2. `base_path`: 指定项目文件夹的根路径。`../` 表示当前文件夹的上级目录。
3. `ignore`: 定义生成文件树时忽略的路径和文件。
   - `path`: 忽略的文件夹列表。基于 `base_path` 的相对路径，支持glob表达式。
4. `filter_in`: 定义生成文件树时需要包含的路径。
   - `path`: 需要包含的路径模式列表。支持通配符。

### 路径模式

`path` 中的每一个元素都是一个路径模式字符串,支持使用以下通配符:

- `*` 匹配任意字符序列,不包括路径分隔符 `/`
- `**` 匹配任意字符序列,包括路径分隔符 `/`
- `?` 匹配任意单个字符,不包括路径分隔符 `/`
- `[seq]` 匹配序列 `seq` 中的任意一个字符
- `[!seq]` 匹配任何不在序列 `seq` 中的字符

此外,还支持使用 `!` 等前缀来排除匹配的路径模式。

### 工作流程

1. 首先,根据 `ignore` 规则过滤掉不需要的文件和文件夹,生成初始的文件树 JSON 对象。
2. 然后,基于初始的文件树 JSON 对象,遍历每一个节点,判断其相对于项目根目录的路径是否匹配 `filter_in.path` 中的任何一个路径模式。
   - 对于文件夹节点,如果该文件夹本身或其子节点中有匹配 `filter_in` 规则的,则将该文件夹及其匹配的子节点保留在最终结果中。
   - 对于文件节点,如果匹配 `filter_in` 规则,则将该文件保留在最终结果中。
3. 最终,根据过滤后的文件树 JSON 对象,生成文本形式的树状结构输出。

## filters 属性的结构

`filters` 属性是1.2版加入的一个新功能，`filters`是一个数组,每个元素代表一个过滤规则。每个过滤规则可以是以下两种类型之一:

1. 忽略规则 (`ignore`)
2. 包含规则 (`filter_in`)

### 示例配置

```yaml
project:
  filters:
    - ignore:
        - "**/*.js"
    - filter_in:
        - "**/*.md"
        - "**/*.txt"
```

在这个示例中,我们首先忽略所有的 .js 文件,然后只包含 .md 和 .txt 文件。

## 工作原理

1. 初始树构建: 首先,程序会构建一个包含项目中所有文件和目录的完整树结构。

2. 顺序应用过滤规则: 然后,程序会按照 `filters` 数组中定义的顺序,依次应用每个过滤规则。

3. 规则应用:
   - 对于 `ignore` 规则,匹配的文件和目录会从树中移除。
   - 对于 `filter_in` 规则,只有匹配的文件和目录会被保留在树中。

4. 最终树生成: 在应用完所有规则后,剩下的树结构就是最终的结果。

## 新增功能的优势

1. 更精细的控制: 通过组合 `ignore` 和 `filter_in` 规则,用户可以实现非常精细的文件过滤控制。

2. 顺序应用: 规则的应用顺序很重要,允许用户创建复杂的过滤逻辑。

3. 灵活性: 可以轻松添加或修改过滤规则,而不需要修改代码。

4. 向后兼容: 新的 `filters` 属性与原有的 `ignore` 和 `filter_in` 属性并存,保证了对旧配置的支持。

## 注意事项

- 如果 `filters` 属性存在,它将优先于同级的 `ignore` 和 `filter_in` 属性。
- 每个过滤规则都是基于前一个规则的结果进行操作的,所以规则的顺序很重要。
- 使用通配符模式时要小心,确保不会意外地排除或包含不需要的文件。


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
render: false
\```
{{/partial }}
```

`partial` 函数允许你直接在模板中嵌入指定文件的全部内容。你需要在 `{{#partial}}...{{/partial}}` 标签中提供一个 YAML 配置，指定想要读取的文件路径 (`path`) 和是否需要渲染 (render)。

- `path`: 指定想要读取内容的文件相对路径或绝对路径。路径是相对于在配置文件中定义的 `base_path` 的路径。
- `render`: 指定是否需要将文件内容作为 prompt-context-builder 的模版进行渲染。默认为 true ，表示需要渲染。如果设置为 false ，则直接返回文件内容而不进行渲染。

注：上述演示中为了转义，在开闭标签中的 code block 标记之前加了\，因为不是所有的网页markdown渲染工具都支持转义语法，可能会显示出来，如果想看正确的用法可以直接查看 test/cases/5.input.md 。


### all_files_markdown 函数 (all_files_markdown Function)

`all_files_markdown`用于遍历项目中的所有文件,并以Markdown格式输出它们的内容。这个助手根据`config.yml`的过滤规则来选择要输出的文件，保证输出的文件与folder_tree的文件相同。

#### 用法

在模板文件中,使用以下语法来调用`all_files_markdown`助手:

```handlebars
{{ all_files_markdown }}
```

### all_files_xml 函数(all_files_xml Function)

`all_files_xml`用于遍历项目中的所有文件,并以XML格式输出它们的相对路径和内容。这个助手根据`config.yml`的过滤规则来选择要输出的文件,保证输出的文件与`folder_tree`的文件相同。

#### 用法

在模板文件中,使用以下语法来调用`all_files_xml`助手:

```handlebars
{{ all_files_xml }}
```

#### 输出格式

`all_files_xml`助手将为每个文件生成以下XML格式的内容:

```xml
<file path="{文件的相对路径}">
{文件的内容}
</file>
```

其中:

- `{文件的相对路径}` 表示文件相对于工程根目录的路径。
- `{文件的内容}` 表示文件的实际内容,并被包裹在 `<![CDATA[...]]>` 部分中,以确保内容中的任何XML特殊字符不会被解析为XML标记。

这样,`all_files_xml`助手函数的文档就被添加到了`README.md`文件中。您可以根据需要对文档进行进一步调整和完善。

## 支持的reader

### controller reader

用于读取Java代码中的controller，会保留所有的field，可以针对性的要求读取某个函数，会保留函数的所有注解

### model reader

用于读取Java代码中的 model，会保留所有的field，删除掉所有的setter和getter代码。

### all reader

读取文件所有内容，不做任何静态分析和预处理。


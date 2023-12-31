## yaml数据

我们的文件夹结构如下所示

```
.
├── index.js
└── test
    ├── cases
    │   └── 1.yaml
    └── index.js

```

test/cases下是所有的测试数据，比如1.yaml 存储了一个测试的所有描述信息。
1.yaml 的数据结构为：

```yaml
desc: "测试用例描述"
given:
  targetFile: "输入参数"
then:
  expectedResult: "期望返回值"
```

其中desc用于打印测试用例名时使用，
given里是输入的测试数据，比如输入的目标文件，输出的参数等。
then里面是输出的测试数据，比如返回值

{我们这个需求的代码是从targetFile的指向的一个md文件，里面有一个code block。}

index.js 是被测对象，是一个函数，大概实现如下（代码在../index.js中的，不用在代码里重写一遍）

函数签名为：
```

```

基于上面的要求给我一个数据驱动的测试代码，基于mocha，要遍历这些yaml文件，一个 yaml 里只有一个test case。

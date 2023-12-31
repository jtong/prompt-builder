## yaml数据


我们的文件夹结构如下所示

```
.
├── index.js
└── test
    ├── cases
    │   └── 1.json
    └── index.js

```


test/cases下是所有的测试数据，比如1.json 存储了一个测试的所有描述信息。
1.json 的数据结构为：

```json
{
    "desc": "测试用例描述",
    "given": {
        "arg": "输入参数"
    }, 
    "then": {
        "expectedResult": "期望返回值"
    }
}
```
其中desc用于打印测试用例名时使用，
given里是输入的测试数据，比如输入的目标文件，输出的参数等。
then里面是输出的测试数据，比如返回值

index.js 是被测对象，是一个函数，大概实现如下（代码在../index.js中的，不用在代码里重写一遍）

基于上面的要求给我一个数据驱动的测试代码，基于mocha，一个json里只有一个test case，测试上面的extractMethodDetails函数
const fs = require('fs');
const yaml = require('js-yaml');
const javaParser = require('java-parser');
const import_read = require("./import_read")
const read_controller = require("./read_controller")


function main() {
// 读取YAML文件
    const yamlContent = fs.readFileSync('controller_sut_config.yml', 'utf8');
    const config = yaml.load(yamlContent);

// 读取Java文件
    let project_base = "../";

    let newJavaContent = read_controller(project_base, config);

// 输出到控制台
    console.log(newJavaContent);
}

main();

const fs = require('fs');
const yaml = require('js-yaml');
const read_folder_tree = require("./read_folder")


function main() {
// 读取YAML文件并解析
    const yamlContent = fs.readFileSync('config.yml', 'utf8');
    const config = yaml.load(yamlContent);

// 获取根目录和忽略列表
    let project = config.project;

    console.log(read_folder_tree(project));
}

main();

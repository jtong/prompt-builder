const ejs = require('ejs');
const yaml = require("js-yaml");
const fs = require('fs');
const read_folder_tree = require("./read_folder");
const path = require('path');
const read_related_files = require("./related_files.js");

// 读取YAML文件并解析
const yamlContent = fs.readFileSync('config.yml', 'utf8');
const config = yaml.load(yamlContent);

let project = config.project;
project.base_path = path.join(__dirname, project.base_path);


// 定义一个内部context，用于模板渲染
const internalContext = {
    data: { /* 这里填写你的数据 */ },

    folder_tree: function() {

        return read_folder_tree(project);
    },
    related_files: function() {
        const yamlContent = fs.readFileSync('related_files.yml', 'utf8');
        const related_files = yaml.load(yamlContent);

        return read_related_files(project.base_path, related_files)
    }
    // 可以添加更多的数据和函数
};

/**
 * 基于内部context解析EJS模板的函数
 * @param {string} templateText - EJS模板文本
 * @return {string} 解析后的HTML文本
 */
function renderTemplate(templateText) {
    return ejs.render(templateText, internalContext);
}

module.exports = renderTemplate;

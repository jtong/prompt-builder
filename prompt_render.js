const ejs = require('ejs');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const read_folder_tree = require('./read_folder');
const read_related_files = require('./related_files.js');

/**
 * 解析并渲染模板
 * @param {string} templateText - 模板文本
 * @param {string} configPath - 配置文件路径
 * @param {string} contextPath - 上下文文件路径
 * @return {string} 渲染后的内容
 */
function renderTemplate(templateText, configPath, contextPath, baseDir) {
    // 解析路径（如果传入的是相对路径）
    const resolvedConfigPath = path.resolve(baseDir, configPath);
    // 读取并解析配置文件

    const configContent = fs.readFileSync(resolvedConfigPath, 'utf8');
    const config = yaml.load(configContent);
    let project = config.project;

    project.base_path = path.resolve(baseDir, project.base_path);

    // console.log(project.base_path)

    // 定义内部上下文
    const internalContext = {
        data: {}, // 使用解析的上下文数据

        folder_tree: function() {
            return read_folder_tree(project);
        },
        related_files: function() {
            // 读取并解析上下文文件
            const resolvedContextPath = path.resolve(baseDir, contextPath);
            const contextContent = fs.readFileSync(resolvedContextPath, 'utf8');
            const contextData = yaml.load(contextContent);
            return read_related_files(project.base_path, contextData)
        }
        // 可以添加更多的数据和函数
    };

    // 渲染模板
    return ejs.render(templateText, internalContext);
}

module.exports = renderTemplate;

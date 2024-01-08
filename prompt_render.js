const Handlebars = require('handlebars');
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
    // 注册 Handlebars 助手
    Handlebars.registerHelper('folder_tree', function() {
        return new Handlebars.SafeString(read_folder_tree(project));
    });

    Handlebars.registerHelper('related_files', function() {
        const resolvedContextPath = path.resolve(baseDir, contextPath);
        const contextContent = fs.readFileSync(resolvedContextPath, 'utf8');
        const contextData = yaml.load(contextContent);
        return new Handlebars.SafeString(read_related_files(project.base_path, contextData));
    });

    Handlebars.registerHelper('related_files_from', function(options) {
        const templateString = options.fn(this);
        let trimmedString = templateString.trim();
        if (trimmedString.startsWith("```")) {
            const firstNewLineIndex = trimmedString.indexOf('\n') + 1;
            const lastNewLineIndex = trimmedString.lastIndexOf('\n');
            trimmedString = trimmedString.substring(firstNewLineIndex, lastNewLineIndex);
        }
        const contextData = yaml.load(trimmedString);
        if (contextData === undefined){
            return new Handlebars.SafeString("");
        }
        return new Handlebars.SafeString(read_related_files(project.base_path, contextData));
    });

    // 使用 Handlebars 编译和渲染模板
    const template = Handlebars.compile(templateText);
    return template({ data: {} });
}

module.exports = renderTemplate;

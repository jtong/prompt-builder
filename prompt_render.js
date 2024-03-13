const Handlebars = require('handlebars');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const read_folder_tree = require('./read_folder');
const read_related_files = require('./related_files.js');
const partialReader = require('./partial');


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

    return renderTemplate_ConfigObject(templateText, config, contextPath, baseDir);

}

function read_all(project_base, config) {
    const filePath = path.join(project_base, config.path);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error reading file: ${filePath}`, error);
        return "Error reading file";
    }
}

function renderTemplate_ConfigObject(templateText, config, contextPath, baseDir) {
    const project = config.project;

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

    Handlebars.registerHelper('partial', function(options) {
        // 从 options 中解析 YAML 字符串
        let trimmedString = options.fn(this).trim();
        if (trimmedString.startsWith("```")) {
            const firstNewLineIndex = trimmedString.indexOf('\n') + 1;
            const lastNewLineIndex = trimmedString.lastIndexOf('\n');
            trimmedString = trimmedString.substring(firstNewLineIndex, lastNewLineIndex);
        }
        const yamlData = yaml.load(trimmedString);
        const filePath = yamlData.path;
        const baseDir = project.base_path; // 确保你的模板上下文中包含了 baseDir
    
        // 使用 partial.js 读取文件内容
        const fileContent = partialReader.readPartial(baseDir, filePath);
    
        // 返回文件内容，包裹在代码块中
        return new Handlebars.SafeString(fileContent);
    });

    Handlebars.registerHelper('all_files_markdown', function() {
        const jsonResult = {};
        read_folder_tree(project, jsonResult);

        const allFiles = [];

        function traverseJson(jsonObj) {
            if (jsonObj.isDirectory) {
                if (jsonObj.children) {
                    jsonObj.children.forEach(child => traverseJson(child));
                }
            } else {
                allFiles.push({
                    path: jsonObj.path,
                    reader: 'all'
                });
            }
        }

        traverseJson(jsonResult);

        return new Handlebars.SafeString(read_related_files(project.base_path, allFiles));
    });

    Handlebars.registerHelper('all_files_xml', function() {
        const jsonResult = {};
        read_folder_tree(project, jsonResult);

        const allFiles = [];

        function traverseJson(jsonObj) {
            if (jsonObj.isDirectory) {
                if (jsonObj.children) {
                    jsonObj.children.forEach(child => traverseJson(child));
                }
            } else {
                allFiles.push({
                    path: jsonObj.path,
                    reader: 'all'
                });
            }
        }

        traverseJson(jsonResult);

        let xmlContent = '';
        for (const file of allFiles) {
            const fileContent = read_all(project.base_path, file);
            xmlContent += `<file>
    <path>${file.path}</path>
    <content>
<![CDATA[
${fileContent}
]]>
    </content>
</file>
`;
        }

        return new Handlebars.SafeString(xmlContent);
    });

    // 使用 Handlebars 编译和渲染模板
    const template = Handlebars.compile(templateText);
    return template({ data: {} });
}

module.exports = {
    renderTemplate,
    renderTemplate_ConfigObject
};

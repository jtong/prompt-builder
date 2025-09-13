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
        // return new Handlebars.SafeString(fileContent);

        const shouldRender = yamlData.render !== false; // 默认为 true
        if (shouldRender) {
            // 如果需要渲染,调用 renderTemplate_ConfigObject 处理文件内容
            return new Handlebars.SafeString(renderTemplate_ConfigObject(fileContent, config, contextPath, baseDir));
        } else {
            // 否则直接返回文件内容
            return new Handlebars.SafeString(fileContent);
        }
    });

    Handlebars.registerHelper('all_files_markdown', function() {
        const jsonResult = {};
        read_folder_tree(project, jsonResult);

        // Use content filtered tree if available, otherwise use regular tree
        const treeToUse = jsonResult._contentFilteredTree || jsonResult;
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

        traverseJson(treeToUse);

        return new Handlebars.SafeString(read_related_files(project.base_path, allFiles));
    });

    Handlebars.registerHelper('all_files_xml', function() {
        const jsonResult = {};
        read_folder_tree(project, jsonResult);

        // Use content filtered tree if available, otherwise use regular tree
        const treeToUse = jsonResult._contentFilteredTree || jsonResult;
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

        traverseJson(treeToUse);

        let xmlContent = '';
        for (const file of allFiles) {
            const fileContent = read_all(project.base_path, file);
            xmlContent += `<file path="${file.path}">
${fileContent}
</file>
`;
        }

        return new Handlebars.SafeString(xmlContent);
    });

    // 新增 read_only_references helper
    Handlebars.registerHelper('read_only_references', function() {
        if (!config.read_only_references || !Array.isArray(config.read_only_references)) {
            return new Handlebars.SafeString('');
        }

        let output = '';
        
        for (const reference of config.read_only_references) {
            if (reference.folder) {
                const folderConfig = reference.folder;
                
                // 解析 base_path
                const resolvedBasePath = path.resolve(baseDir, folderConfig.base_path);
                
                // 创建用于 read_folder_tree 的项目配置
                const referenceProject = {
                    base_path: resolvedBasePath,
                    filters: folderConfig.filters,
                    show_content_filters: folderConfig.show_content_filters
                };
                
                // 获取描述，如果没有设置则使用文件夹名
                const desc = folderConfig.desc || path.basename(resolvedBasePath);
                
                // 生成文件树
                const jsonResult = {};
                const folderTree = read_folder_tree(referenceProject, jsonResult);
                
                // 确定要使用的树结构（内容过滤后的树或常规树）
                const treeToUse = jsonResult._contentFilteredTree || jsonResult;
                
                // 收集所有文件
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
                traverseJson(treeToUse);
                
                // 生成文件内容的 XML
                let filesXml = '';
                for (const file of allFiles) {
                    try {
                        const fileContent = read_all(resolvedBasePath, file);
                        filesXml += `<file path="${file.path}">
${fileContent}
</file>
`;
                    } catch (error) {
                        console.error(`Error reading reference file: ${file.path}`, error);
                    }
                }
                
                // 构建输出
                output += `<ReadOnlyReference desc="${desc}" path="${folderConfig.base_path}">
<folder>
${folderTree}
</folder>
<files>
${filesXml}
</files>
</ReadOnlyReference>

`;
            }
        }
        
        return new Handlebars.SafeString(output);
    });

    // 使用 Handlebars 编译和渲染模板
    const template = Handlebars.compile(templateText);
    return template({ data: {} });
}

module.exports = {
    renderTemplate,
    renderTemplate_ConfigObject
};
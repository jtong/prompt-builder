const fs = require('fs');
const path = require('path');
const {minimatch} = require('minimatch');

function read_folder_tree(project, jsonResult = {}) {
    const basePath = path.resolve(project.base_path);
    const ignorePaths = project.ignore.path;
    const ignoreFiles = new Set(project.ignore.file);
    let result = "";

    // 检查是否应该忽略路径
    function shouldIgnore(filePath) {
        if (ignoreFiles.has(path.basename(filePath))) {
            return true;
        }
        const relPath = path.relative(basePath, filePath).replace(/\\/g, '/');
        for (let ignorePath of ignorePaths) {
            if (minimatch(relPath, ignorePath)) {
                return true;
            }
        }
        return false;
    }

    // 递归遍历目录
    function walkDir(dir, prefix = '', lastItem = true, isRoot = true, parentJson = jsonResult) {
        if (shouldIgnore(dir)) return;

        const files = fs.readdirSync(dir).filter(file => !shouldIgnore(path.join(dir, file)));
        files.forEach((file, index) => {
            const filePath = path.join(dir, file);
            const relPath = path.relative(basePath, filePath);
            const stats = fs.statSync(filePath);
            const isLast = index === files.length - 1;

            // 根目录下文件和文件夹没有缩进，但显示相应的符号
            const linePrefix = isRoot ? '' : prefix;
            const connector = isLast ? '└── ' : '├── ';
            result +=`${linePrefix}${connector}${file}\n`;

            // 构建 JSON 对象
            const jsonEntry = {
                name: file,
                path: relPath,
                isDirectory: stats.isDirectory()
            };

            if (stats.isDirectory()) {
                jsonEntry.children = [];
                parentJson.children = parentJson.children || [];
                parentJson.children.push(jsonEntry);
                walkDir(filePath, `${prefix}${isLast ? '    ' : '│   '}`, isLast, false, jsonEntry);
            } else {
                parentJson.children = parentJson.children || [];
                parentJson.children.push(jsonEntry);
            }
        });
    }

    // 开始遍历
    result += `.\n`;
    jsonResult.name = ".";
    jsonResult.path = "./";
    jsonResult.isDirectory = true;
    walkDir(basePath, '', true, true, jsonResult);

    return result;
}

module.exports = read_folder_tree;
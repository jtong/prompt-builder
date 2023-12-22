const fs = require('fs');
const path = require('path');

function read_folder_tree(project) {
    const basePath = path.resolve(project.base_path);
    const ignorePaths = new Set(project.ignore.path.map(p => path.resolve(basePath, p)));
    const ignoreFiles = new Set(project.ignore.file);
    let result = ""
// 检查是否应该忽略路径
    function shouldIgnore(filePath) {
        if (ignoreFiles.has(path.basename(filePath))) {
            return true;
        }
        for (let ignorePath of ignorePaths) {
            if (filePath.startsWith(ignorePath)) {
                return true;
            }
        }
        return false;
    }

// 递归遍历目录
    function walkDir(dir, prefix = '', lastItem = true, isRoot = true) {
        if (shouldIgnore(dir)) return;

        const files = fs.readdirSync(dir).filter(file => !shouldIgnore(path.join(dir, file)));
        files.forEach((file, index) => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            const isLast = index === files.length - 1;

            // 根目录下文件和文件夹没有缩进，但显示相应的符号
            const linePrefix = isRoot ? '' : prefix;
            const connector = isLast ? '└── ' : '├── ';
            // console.log(`${linePrefix}${connector}${file}`);
            result +=`${linePrefix}${connector}${file}\n`;

            if (stats.isDirectory()) {
                walkDir(filePath, `${prefix}${isLast ? '    ' : '│   '}`, isLast, false);
            }
        });
    }

// 开始遍历
//     console.log('.');
    result += `.\n`;
    walkDir(basePath, '', true, true);
    return result;
}

module.exports = read_folder_tree;
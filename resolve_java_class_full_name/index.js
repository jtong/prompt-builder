const fs = require('fs');
const path = require('path');

// 检查文件是否存在
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        console.error(err);
        return false;
    }
}

// 解析类的完整名称
function resolveClassName(className, imports, currentPackage, basePackage, sourceRoot) {
    // 检查直接声明的全路径
    let fullClassName = imports.find(imp => imp.endsWith('.' + className));
    if (fullClassName && fileExists(path.join(sourceRoot, fullClassName.replace(/\./g, '/') + '.java'))) {
        return fullClassName;
    }

    // 处理通配符
    for (const wildcardImport of imports.filter(imp => imp.endsWith('.*'))) {
        if (wildcardImport.startsWith(basePackage)) {
            const potentialClassName = wildcardImport.replace('.*', '') + '.' + className;
            const potentialPath = path.join(sourceRoot, potentialClassName.replace(/\./g, '/') + '.java');
            if (fileExists(potentialPath)) {
                return potentialClassName;
            }
        }
    }

    // 尝试同包内的其他类
    const potentialClassName = currentPackage + '.' + className;
    const potentialPath = path.join(sourceRoot, potentialClassName.replace(/\./g, '/') + '.java');
    if (fileExists(potentialPath)) {
        return potentialClassName;
    }

    return null; // 没有找到类，返回 null
}

module.exports = resolveClassName;
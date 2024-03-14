const fs = require('fs');
const path = require('path');
const {minimatch} = require('minimatch');

function read_folder_tree(project, jsonResult = {}) {
    const basePath = path.resolve(project.base_path);
    const ignorePaths = project.ignore.path || [];
    const ignoreFiles = new Set(project.ignore.file || []);
    const filterInPaths = project.filter_in ? project.filter_in.path : [];

    // 第一部分: 按照 ignore 规则过滤,生成初始的 jsonResult
    const initialJsonResult = buildJsonTree(basePath, ignorePaths, ignoreFiles, '.');

    // 第二部分: 基于初始的 jsonResult,进行 filter_in 规则的过滤,生成最终的 jsonResult
    const finalJsonResult = filterInPaths.length === 0
        ? initialJsonResult
        : filterJsonTree(initialJsonResult, filterInPaths, '.');
    jsonResult.children= finalJsonResult.children;
    jsonResult.name = ".";
    jsonResult.path = "./";
    jsonResult.isDirectory = finalJsonResult.isDirectory;
    // 第三部分: 根据最终的 jsonResult 生成文本形式的树状结构
    return buildFolderTree(finalJsonResult);
}

// 按照 ignore 规则构建初始的 JSON 树
function buildJsonTree(dir, ignorePaths, ignoreFiles, relativePath) {
    const result = {
        name: path.basename(dir),
        path: relativePath,
        isDirectory: true,
        children: []
    };

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const relPath = path.join(relativePath, file).replace(/\\/g, '/');

        if (ignoreFiles.has(file) || ignorePaths.some(pattern => minimatch(relPath, pattern))) {
            continue;
        }

        if (stats.isDirectory()) {
            const childTree = buildJsonTree(filePath, ignorePaths, ignoreFiles, path.join(relativePath, file));
            result.children.push(childTree);
        } else {
            result.children.push({
                name: file,
                path: path.join(relativePath, file),
                isDirectory: false
            });
        }
    }

    return result;
}

// 基于初始的 jsonResult 和 filter_in 规则,生成最终的 jsonResult
function filterJsonTree(jsonTree, filterInPaths, relativePath) {
    const result = {
        name: jsonTree.name,
        path: relativePath,
        isDirectory: jsonTree.isDirectory,
        children: []
    };

    for (const child of jsonTree.children) {
        const shouldInclude = filterInPaths.some(pattern => minimatch(child.path, pattern));

        if (child.isDirectory) {
            const filteredChild = filterJsonTree(child, filterInPaths, child.path);
            if (shouldInclude || filteredChild.children.length > 0) {
                result.children.push(filteredChild);
            }
        } else if (shouldInclude) {
            result.children.push(child);
        }
    }

    return result;
}

// 基于最终的 jsonResult 生成文本形式的树状结构
function buildFolderTree(jsonTree, prefix = '', isLast = true, isRoot = true) {
    let result = '';
    const connector = isLast ? '└── ' : '├── ';
    let childPrefix = isLast ? '    ' : '│   ';

    if (isRoot) {
        result += `.\n`;
        childPrefix= '';
    } else {
        result += `${prefix}${connector}${jsonTree.name}\n`;
    }

    if (jsonTree.isDirectory) {
        for (let i = 0; i < jsonTree.children.length; i++) {
            const child = jsonTree.children[i];
            const isLastChild = i === jsonTree.children.length - 1;
            result += buildFolderTree(child, `${prefix}${childPrefix}`, isLastChild, false);
        }
    }

    return result;
}

module.exports = read_folder_tree;
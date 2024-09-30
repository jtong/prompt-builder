const fs = require('fs');
const path = require('path');
const { minimatch } = require('minimatch');

const options = {
    dot: true  // 允许匹配以点开头的文件和目录
};

function read_folder_tree(project, jsonResult = {}) {
    const basePath = path.resolve(project.base_path);

    // Check if filters exist and use them, otherwise fall back to existing ignore and filter_in
    const filters = project.filters || [
        { ignore: project.ignore.path || [] },
        project.filter_in ? { filter_in: project.filter_in.path } : {}
    ].filter(Boolean);

    // Start with full tree
    let currentTree = buildFullTree(basePath, '.');

    // Apply filters sequentially
    for (const filter of filters) {
        if (filter.ignore) {
            currentTree = applyIgnoreFilter(currentTree, filter.ignore || []);
        } else if (filter.filter_in) {
            currentTree = applyFilterIn(currentTree, filter.filter_in);
        }
    }

    // Assign the final result to jsonResult
    Object.assign(jsonResult, currentTree);
    jsonResult.name = ".";
    jsonResult.path = "./";
    // Generate the folder tree text
    return buildFolderTree(currentTree);
}

function buildFullTree(dir, relativePath) {
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

        if (stats.isDirectory()) {
            result.children.push(buildFullTree(filePath, relPath));
        } else {
            result.children.push({
                name: file,
                path: relPath,
                isDirectory: false
            });
        }
    }

    return result;
}

function applyIgnoreFilter(tree, ignorePaths) {
    if (!tree.isDirectory) {
        return ignorePaths.some(pattern => minimatch(tree.path, pattern, options)) ? null : tree;
    }
    // Check if the current directory should be ignored
    if (ignorePaths.some(pattern => minimatch(tree.path, pattern, options))) {
        return null; // Ignore the entire directory and its contents
    }
    const filteredChildren = tree.children
        .map(child => applyIgnoreFilter(child, ignorePaths))
        .filter(Boolean);

    if (filteredChildren.length === 0 && ignorePaths.some(pattern => minimatch(tree.path, pattern, options))) {
        return null;
    }

    return { ...tree, children: filteredChildren };
}

function applyFilterIn(tree, filterInPaths) {
    if (!tree.isDirectory) {
        return filterInPaths.some(pattern => minimatch(tree.path, pattern, options)) ? tree : null;
    }

    const filteredChildren = tree.children
        .map(child => applyFilterIn(child, filterInPaths))
        .filter(Boolean);

    return filteredChildren.length > 0 ? { ...tree, children: filteredChildren } : null;
}

// 基于最终的 jsonResult 生成文本形式的树状结构
function buildFolderTree(jsonTree, prefix = '', isLast = true, isRoot = true) {
    let result = '';
    const connector = isLast ? '└── ' : '├── ';
    let childPrefix = isLast ? '    ' : '│   ';

    if (isRoot) {
        result += `.\n`;
        childPrefix = '';
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
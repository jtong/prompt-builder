const fs = require('fs');
const path = require('path');
const {minimatch} = require('minimatch');
const archiver = require('archiver');

function zipFilteredFiles(project, outputZipPath) {
    const basePath = path.resolve(project.base_path);
    const ignorePaths = project.ignore.path;
    const ignoreFiles = new Set(project.ignore.file);
    
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', function() {
        console.log(`${archive.pointer()} total bytes`);
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);

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

    function addToArchive(dir, prefix = '') {
        if (shouldIgnore(dir)) return;

        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (!shouldIgnore(filePath)) {
                const relPath = path.relative(basePath, filePath);
                const zipPath = path.join(prefix, file);
                const stats = fs.statSync(filePath);

                if (stats.isDirectory()) {
                    archive.directory(filePath, zipPath);
                    addToArchive(filePath, zipPath);
                } else {
                    archive.file(filePath, { name: zipPath });
                }
            }
        });
    }

    addToArchive(basePath);
    archive.finalize();
}

module.exports = zipFilteredFiles;
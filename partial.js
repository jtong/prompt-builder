const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

function readPartial(project_base, filePath) {
    const fullPath = path.resolve(project_base, filePath);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error reading file: ${fullPath}`, error);
        return "Error reading file";
    }
}

module.exports = {
    readPartial,
};
const fs = require('fs');
const yaml = require('js-yaml');
const read_controller = require("./read_controller")
const read_model = require("./read_model")


const reader = {
    controller: read_controller,
    model: read_model
}
function main(project_base, related_files) {

    let result = "";
    related_files.forEach(related_file => {
        const current_file_reader = reader[related_file.reader];
        result += `### ${related_file.path}

\`\`\`
${current_file_reader(project_base, related_file)}
\`\`\`            
`;

    });

// 输出到控制台
    return result;
}


module.exports = main;

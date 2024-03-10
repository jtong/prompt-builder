#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { renderTemplate } = require('./prompt_render');


// 解析命令行参数
const argv = yargs(hideBin(process.argv))
    .option('template', {
        alias: 't',
        describe: 'Path to the template file',
        type: 'string',
        demandOption: true
    })
    .option('config', {
        alias: 'c',
        describe: 'Path to the YAML config file',
        type: 'string',
        demandOption: true
    })
    .option('context', {
        alias: 'x',
        describe: 'Path to the YAML context file',
        type: 'string',
        demandOption: false
    })
    .argv;

// 读取并解析 YAML 文件
// function readYamlFile(filePath) {
//     try {
//         const fileContents = fs.readFileSync(filePath, 'utf8');
//         return yaml.load(fileContents);
//     } catch (e) {
//         console.error(`Error reading YAML file: ${filePath}`, e);
//         process.exit(1);
//     }
// }


// 主逻辑
function main() {
    const templatePath = argv.template;
    const configPath = argv.config;
    const contextPath = argv.context;

    // 读取模板文件内容
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    // 读取并解析配置和上下文文件
    // const config = readYamlFile(configPath);
    // const context = readYamlFile(contextPath);

    const baseDir = process.cwd();

    // 处理模板
    const renderedContent = renderTemplate(templateContent, configPath, contextPath, baseDir);

    console.log(renderedContent);
}

main();

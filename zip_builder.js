#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const zipFilteredFiles = require('./zip_filtered_files');

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
    .option('config', {
        alias: 'c',
        describe: 'Path to the YAML config file',
        type: 'string',
        demandOption: true
    })
    .option('output', {
        alias: 'o',
        describe: 'Path to the output zip file',
        type: 'string',
        demandOption: true
    })
    .argv;

// 主逻辑
function main() {
    const configPath = argv.config;
    const outputZipPath = argv.output;

    const baseDir = process.cwd();
    const resolvedConfigPath = path.resolve(baseDir, configPath);

    const config = yaml.load(fs.readFileSync(resolvedConfigPath, 'utf8'));
    const project = config.project;
    project.base_path = path.resolve(baseDir, project.base_path);

    zipFilteredFiles(project, outputZipPath);
}

main();
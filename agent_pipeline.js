const { Pipe, Pipeline } = require('./pipelines');
const OpenAIProcessor = require('./openai_agent');
const fs = require('fs').promises;
const yaml = require('js-yaml');
var {parseStringPromise} = require('xml2js');
const path = require("path");
const ejs = require('ejs');
const renderTemplate = require("./prompt_render");


function build_render_ejs_template_pipe(ejsTemplatePath) {
    return new Pipe(async (input) => {
        const rendered = await ejs.renderFile(ejsTemplatePath, input);
        return rendered;
    });
}

const renderExistingTemplate_pipe = new Pipe(async (input) => {
    // 这里是现有的模板渲染逻辑
    return renderTemplate(input, 'config.yml', undefined, __dirname);
});

// OpenAI交互Pipe
const openai_key = process.env.OPENAI_API_KEY
const openAIProcessor = new OpenAIProcessor(openai_key, 'gpt-3.5-turbo-16k');
const interactWithOpenAI_pipe = new Pipe(async (input) => {
    // 这里是与OpenAI交互的逻辑
    return await openAIProcessor.processPrompt(input);
});

async function data_element_post_process(response) {
    const match = response.match(/<data>[\s\S]*?<\/data>/);
    const xmlContent = match ? match[0] : '';
    console.log(xmlContent)

    // 解析XML并提取text content
    const result = await parseStringPromise(xmlContent);
    console.log(result);
    return result.data;
}

// XML解析Pipe
const post_data_xml_element_pipe = new Pipe(async (input) => {
    // 这里是XML解析的逻辑
    // 截取<data>和</data>之间的内容（包含data标签）
    return await data_element_post_process(input);
});

/**
 * 创建子Pipeline
 * @param {string} ejsTemplatePath - EJS模板的路径
 * @return {Pipeline} 配置好的Pipeline实例
 */
function create_openai_llm_sub_Pipeline(ejsTemplatePath) {
    const subPipeline = new Pipeline();

    // ejs模板渲染Pipe
    const renderEjsTemplate = build_render_ejs_template_pipe(ejsTemplatePath);

    subPipeline.add(renderEjsTemplate)
        .add(renderExistingTemplate_pipe)
        .add(interactWithOpenAI_pipe)
        .add(post_data_xml_element_pipe);

    return subPipeline;
}


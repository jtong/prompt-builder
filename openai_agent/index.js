// openai_processor.js
const fs = require('fs').promises;
const OpenAI = require('openai');
const renderTemplate = require('../prompt_render');
const {HttpsProxyAgent} = require('https-proxy-agent');
const {parseStringPromise} = require("xml2js");

async function data_element_post_process(response) {
    const match = response.match(/<data>[\s\S]*?<\/data>/);
    const xmlContent = match ? match[0] : '';
    console.log(xmlContent)

    // 解析XML并提取text content
    const result = await parseStringPromise(xmlContent);
    return result.data;
}
class OpenAIProcessor {
    constructor(apiKey, model) {
        let config = {
            apiKey: apiKey,
        };
        if(process.env.https_proxy){
            config.httpAgent = new HttpsProxyAgent(process.env.https_proxy);
        }
        this.openai = new OpenAI(config);
        this.model = model;
    }

    // 静态属性：存储预处理函数
    static pre_builder = {
        withTemplate: (configPath, contextPath, baseDir) => (prompt) =>{
            return renderTemplate(prompt, configPath, contextPath, baseDir);
        },
    };

    // 静态属性：存储后处理函数
    static post_builder = {
        unwrap_data_element: () => data_element_post_process,

    };

    async processPrompt(prompt) {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.model,
            });

            let responseText = chatCompletion.choices[0]?.message?.content;

            return responseText.trim();
        } catch (error) {
            console.error('An error occurred:', error);
            throw error;
        }
    }

    async processPromptFromFile(filePath, preprocessFn = (input) => input, postprocessFn = (input) => input) {
        try {
            let prompt = await fs.readFile(filePath, 'utf8');
            prompt = preprocessFn(prompt.trim());

            const chatCompletion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.model,
            });

            let responseText = chatCompletion.choices[0]?.message?.content;
            responseText = postprocessFn(responseText.trim());

            return responseText;
        } catch (error) {
            console.error('An error occurred:', error);
            throw error;
        }
    }
}

module.exports = OpenAIProcessor;

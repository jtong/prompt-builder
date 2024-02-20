
// 使用函数创建不同的子pipeline
const {Pipeline, Pipe} = require("../pipelines");
const subPipeline1 = create_openai_llm_sub_Pipeline('llm_templates/development/step_1_xml-new-feature_detect_from_folder_tree.md');
const subPipeline2 = create_openai_llm_sub_Pipeline('llm_templates/development/step_2_xml-new-feature_valdate_related_file_contont.md');


// // 运行Pipeline并处理结果
(async () => {
    const target_task = "我希望 实现可以用 pipeline 实现一个 访问openai llm 的agent，可以分步进行一系列的推理，每一步使用不同的template生成不同的prompt。\n"
    const mainPipeline = new Pipeline();
    mainPipeline.add(subPipeline1)
        .add(new Pipe(async (input) => {
            return {
                target_task: target_task,
                related_files: input,
                gen_history:{
                    related_files:[
                        input
                    ]
                }
            }
        }))
        .add(subPipeline2);
    try {
        // 假设我们没有特定的输入，所以传递null或者一个空对象
        const result = await mainPipeline.run({
            target_task
        });
        console.log('Pipeline result:', result);
    } catch (error) {
        console.error('Pipeline error:', error);
    }
})();


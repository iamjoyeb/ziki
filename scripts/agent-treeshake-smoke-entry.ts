import { Agent } from "@iamjoyeb/ziki-agent-core";
import { createModels } from "@iamjoyeb/ziki-ai";
import { deepseekProvider } from "@iamjoyeb/ziki-ai/providers/deepseek";

const models = createModels();
models.setProvider(deepseekProvider());
const model = models.getModel("deepseek", "deepseek-chat");
if (!model) throw new Error("DeepSeek smoke-test model not found");

export const agent = new Agent({
	initialState: { model },
	streamFn: models.streamSimple.bind(models),
});

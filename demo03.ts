import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import 'dotenv/config'
import { AIMessageChunk } from "@langchain/core/messages";

// model
const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0
});

// schema
const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("実行する操作の種類。"),
  number1: z.number().describe("操作する最初の数値。"),
  number2: z.number().describe("操作する2番目の数値。"),
});

// tools
const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description: "Can perform mathematical operations.",
  schema: calculatorSchema,
  func: async ({ operation, number1, number2 }) => {
    // Functions must return strings
    if (operation === "add") {
      return `${number1 + number2}`;
    } else if (operation === "subtract") {
      return `${number1 - number2}`;
    } else if (operation === "multiply") {
      return `${number1 * number2}`;
    } else if (operation === "divide") {
      return `${number1 / number2}`;
    } else {
      throw new Error("無効な操作。");
    }
  },
});

const llmWithTools = llm.bindTools([calculatorTool]);

const stream1 = await llmWithTools.stream("308 / 29 は？");
for await (const chunk of stream1) {
  console.log(chunk.tool_call_chunks);
  // console.log(chunk.invalid_tool_calls);
  // console.log(chunk.tool_calls);
  console.log("--------------------")
}

const stream2 = await llmWithTools.stream("308 / 29 は？");
let final : AIMessageChunk | undefined = undefined;
for await (const chunk of stream2) {
  if (!final) {
    final = chunk;
  } else {
    final = final.concat(chunk);
  }
}
if (final) {
  console.log(final.tool_calls);
  final.tool_calls?.map(async (tool_call) => {
    const res2 = await calculatorTool.invoke(tool_call.args)
    console.log(res2);
  });
}




import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import 'dotenv/config'

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
  description: "計算機として足し算、引き算、掛け算、割り算を行います。",
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

const res = await llmWithTools.invoke("3 * 12 は？");

console.log(res);
console.log(res.tool_calls);


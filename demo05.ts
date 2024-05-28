import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import "dotenv/config";

// model
const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
});

// schema
const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("実行する操作の種類。"),
  number1: z.number().describe("操作する最初の数値。"),
  number2: z.number().describe("操作する2番目の数値。"),
});

const llmWithTools = llm.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "calculator",
        description: "Can perform mathematical operations.",
        parameters: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              description: "The type of operation to execute.",
              enum: ["add", "subtract", "multiply", "divide"],
            },
            number1: { type: "number", description: "First integer" },
            number2: { type: "number", description: "Second integer" },
          },
          required: ["number1", "number2"],
        },
      },
    },
  ],
});
const res = await llmWithTools.invoke("3 * 12 は？");

console.log(res);
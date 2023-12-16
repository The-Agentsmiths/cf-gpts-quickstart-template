import { Context } from "hono";
import OpenAI from "openai";

export const createAssistant = async (c: Context) => {
  const { OPENAI_API_KEY } = c.env.valid("json");
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export const createCompletion = async (
  c: Context,
  messages: Message[],
  model: string
) => {
  const { OPENAI_API_KEY } = c.env;
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    messages,
    model,
  });

  console.log(completion.choices[0]);
  return completion.choices[0];
};

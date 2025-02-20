import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API,
});

export const getEmbedding = async (inputText: string) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputText,
        encoding_format: "float",
    });
    return embedding.data[0].embedding;
}

export const getCompletion = async (messages: ChatCompletionMessageParam[], temperature: number = 1) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        // store: true,
        messages,
        temperature,
    });
    return completion.choices[0].message.content;
}

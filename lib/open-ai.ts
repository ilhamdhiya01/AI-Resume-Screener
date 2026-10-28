import OpenAI from 'openai';

let client: OpenAI | null = null;

/**
 * @description Returns the shared OpenAI-compatible client, created on first
 * use. Not built at import time: `next build` evaluates route modules, and
 * the constructor throws without `AI_API_KEY` — images are built without
 * secrets.
 */
export const getOpenAI = (): OpenAI => {
  client ??= new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL,
  });
  return client;
};

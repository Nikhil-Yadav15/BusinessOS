import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { buildAITools } from './tools.js';
import { db } from '../../db/index.js';
import { aiMemories } from '../../db/schema/ai.js';
import { eq, and } from 'drizzle-orm';
import { SystemMessage } from '@langchain/core/messages';

export const buildCoPilot = async (executionContext) => {
  // 1. Initialize OpenRouter Model using Environment Variables
  const llm = new ChatOpenAI({
    model: process.env.OPENROUTER_MODEL_NAME || 'meta-llama/llama-3-8b-instruct:free',
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key_',
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Atlas BusinessOS',
      }
    }
  });

  // 2. Hydrate Zero-Trust Tools bound directly to the user's execution context
  const tools = buildAITools(executionContext);

  // 3. Construct the Pre-Fetch Memory Injector (State Modifier)
  const stateModifier = async (state) => {
    // Pre-fetch long-term stored facts/preferences from Postgres
    const memories = await db.select().from(aiMemories).where(and(
      eq(aiMemories.businessId, executionContext.businessId),
      eq(aiMemories.userId, executionContext.userId)
    ));

    let memoryContext = '';
    if (memories.length > 0) {
      memoryContext = '\n\n**STORED FACTS & PREFERENCES:**\nYou MUST obey these rules saved in your memory:\n' +
        memories.map(m => `- [${m.namespace}] ${m.memoryKey}: ${JSON.stringify(m.data.value)}`).join('\n');
    }

    const systemPrompt = new SystemMessage(
      `You are Atlas, the intelligent Business Operating System Co-Pilot.
You are actively serving the authenticated user for Business ID: ${executionContext.businessId}.

STRICT RULES:
1. Respond concisely and professionally without filler pleasantries (e.g., skip "I'd be happy to help!").
2. NEVER guess inventory or financials. ALWAYS trigger your tools to read the database.
3. If requested to draft an action (like adding a product, customer, or adjusting inventory), trigger your staging tools confidently.
4. Format output data as clean Markdown tables whenever possible.
5. If the user asks to create an automation/workflow but doesn't give you enough details, polite ask them first.
6. CRITICAL SECURITY RULE: If ANY tool returns a JSON object containing {"_type": "ACTION_CONFIRMATION"}, you MUST reply with ONLY that exact JSON string wrapped in a \`\`\`json block. DO NOT add any conversational text before or after it. The frontend UI will parse this JSON to render a secure Confirmation Card for the user.${memoryContext}`
    );

    return [systemPrompt, ...state.messages];
  };

  // 4. Return the Autonomous Graph Agent mapped securely
  return createReactAgent({ llm, tools, stateModifier });
};

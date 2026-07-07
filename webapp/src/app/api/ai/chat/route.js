import { buildCoPilot } from '../../../../application/ai/agent.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';
import { db } from '../../../../db/index.js';
import { conversations, messages } from '../../../../db/schema/ai.js';
import { generateId } from '../../../../infrastructure/id/uuid.js';
import { eq, and, desc } from 'drizzle-orm';

export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    const input = await req.json();
      
    if (!input.messages || !Array.isArray(input.messages) || input.messages.length === 0) {
      throw new Error("Valid messages array is required.");
    }

    // Capture the latest incoming text from the user
    const lastUserMessage = input.messages[input.messages.length - 1].content;

    // 1. Build the Autonomous LangGraph Agent
    const agent = await buildCoPilot(executionContext);

    // 2. Invoke the Graphical Loop!
    const graphRes = await agent.invoke({
      messages: input.messages
    });

    // 3. Extract the final processed AssistantMessage
    const finalMessage = graphRes.messages[graphRes.messages.length - 1];

    // 4. Persistence: Synchronously store the Conversation in Postgres
    try {
      let conversationId = input.conversationId;

      // Unify memory: Grab the most recent active conversation if none passed
      if (!conversationId) {
        const active = await db.select().from(conversations)
          .where(and(
             eq(conversations.userId, executionContext.userId),
             eq(conversations.businessId, executionContext.businessId),
             eq(conversations.status, 'ACTIVE')
          ))
          .orderBy(desc(conversations.updatedAt))
          .limit(1);

        if (active.length > 0) {
           conversationId = active[0].id;
        } else {
           conversationId = generateId();
           await db.insert(conversations).values({
             id: conversationId,
             businessId: executionContext.businessId,
             userId: executionContext.userId,
             title: lastUserMessage.substring(0, 50) + '...'
           });
        }
      }

      // Log both the User Input and AI Output atomically
      await db.insert(messages).values([
        {
          id: generateId(),
          conversationId,
          role: 'USER',
          content: lastUserMessage
        },
        {
          id: generateId(),
          conversationId,
          role: 'ASSISTANT',
          content: finalMessage.content
        }
      ]);
    } catch (dbErr) {
       console.error("Failed to persist AI conversation:", dbErr);
       // We don't throw here to avoid failing a successful LLM response just because of a logging blip.
    }

    return Response.json(StandardResponse.success({
      role: 'assistant',
      content: finalMessage.content,
      conversationId: input.conversationId // pass it back to UI
    }));
  })
);

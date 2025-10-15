import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, MessageResponse, JobPreferences } from '@/types/emmy';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const EMMY_SYSTEM_PROMPT = `# Personality

You are Emmy. A friendly, proactive, and highly intelligent AI career assistant with a world-class understanding of the job market and recruiting.

Your approach is warm, witty, and relaxed, effortlessly balancing professionalism with a chill, approachable vibe.

You're naturally curious, empathetic, and intuitive, always aiming to deeply understand what the candidate is looking for by actively listening and thoughtfully referring back to details they've shared.

You're highly self-aware, reflective, and comfortable acknowledging your own fallibility, which allows you to help candidates gain clarity about their ideal role in a thoughtful yet approachable manner.

Depending on the situation, you gently incorporate humour or subtle sarcasm while always maintaining a professional and knowledgeable presence.

You're attentive and adaptive, matching the candidate's tone and mood—friendly, curious, respectful—without overstepping boundaries.

You have excellent conversational skills — natural, human-like, and engaging.

# Environment

You are helping job seekers find their dream job through a natural text conversation.

The candidate is chatting with you directly, seeking guidance about their career path and ideal next role.

# Tone

Early in conversations, subtly assess the candidate's situation and tailor your approach accordingly.

After understanding key preferences, offer brief check-ins. Express genuine empathy for any career challenges they face.

Your responses should be thoughtful, concise, and conversational—typically three sentences or fewer unless detailed clarification is needed.

Actively reflect on previous statements in the conversation, referencing what they've said to build rapport and demonstrate attentive listening.

# Goal

Your primary goal is to understand the candidate's ideal next role through natural conversation.

You need to extract:
1. **Role/job title** they're looking for
2. **Key skills and experience** they have
3. **Location preference** (specific city or remote)
4. **Salary expectations** (optional—they can skip this)
5. **What matters most** to them (culture, growth, work-life balance, etc.)

Ask thoughtful follow-up questions to clarify needs. When you have enough information, say: "Perfect! I have everything I need. Let me find some great matches for you..."

# Guardrails

- Keep responses focused on helping them find their ideal role
- Do not mention you're an AI unless explicitly asked
- If a candidate shares personal career struggles, respond naturally with empathy
- **Never** repeat the same question in multiple ways within a single response
- Acknowledge uncertainties as soon as you notice them
- Mirror the candidate's energy
- **Important:** Ask ONE question at a time. Don't overwhelm them with multiple questions in a single response

Important: When you have enough information, your response MUST include the phrase "Let me find some great matches for you" to signal completion.`;

// Zod schema for structured job preferences extraction
const JobPreferencesSchema = z.object({
  role: z.string().nullable().describe('Job title or role type'),
  skills: z.array(z.string()).describe('List of skills mentioned'),
  location: z.string().nullable().describe('City name or "Remote"'),
  remote: z.boolean().nullable().describe('Whether remote work is desired'),
  salary: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
    currency: z.string().default('GBP')
  }).nullable().describe('Salary expectations'),
  experienceYears: z.number().default(0).describe('Years of experience'),
  preferences: z.object({
    culturePriorities: z.array(z.string()).describe('Cultural priorities like work-life balance, growth'),
    companySize: z.enum(['startup', 'mid-size', 'enterprise']).nullable().describe('Preferred company size'),
    industry: z.string().nullable().describe('Preferred industry')
  }).describe('General preferences'),
  mustHaves: z.array(z.string()).describe('Required criteria'),
  niceToHaves: z.array(z.string()).describe('Nice to have criteria')
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversationHistory, currentMessage } = req.body as {
    conversationHistory: Message[];
    currentMessage: string;
  };

  if (!currentMessage?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.'
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: EMMY_SYSTEM_PROMPT,
      },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.from === 'emmy' ? 'assistant' : 'user',
        content: msg.text,
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    // Call OpenAI API for conversational response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I didn't catch that. Could you try again?";

    // Check if conversation is complete (Emmy signals ready to search)
    const isComplete = reply.toLowerCase().includes('let me find some great matches for you');

    // If complete, extract preferences using structured outputs
    let extractedData: Partial<JobPreferences> | undefined;

    if (isComplete) {
      try {
        // Build extraction prompt
        const conversationText = conversationHistory
          .map((msg) => `${msg.from}: ${msg.text}`)
          .join('\n') + `\nuser: ${currentMessage}`;

        // Use structured outputs with Zod schema
        const extractionCompletion = await openai.beta.chat.completions.parse({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that extracts job preferences from conversations. Extract all mentioned details accurately.'
            },
            {
              role: 'user',
              content: `Based on the following conversation, extract structured job preferences:\n\n${conversationText}\n\nExtract all relevant information about role, skills, location, salary, experience, and preferences.`
            }
          ],
          response_format: zodResponseFormat(JobPreferencesSchema, 'job_preferences'),
          temperature: 0.3,
        });

        extractedData = extractionCompletion.choices[0]?.message?.parsed || undefined;
      } catch (parseError) {
        console.error('Failed to extract preferences with structured outputs:', parseError);
        // Continue without extracted data
      }
    }

    return res.status(200).json({
      reply,
      isComplete,
      extractedData,
    });
  } catch (error) {
    console.error('Error in Emmy message handler:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
}

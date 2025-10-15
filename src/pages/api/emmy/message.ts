import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, MessageResponse, JobPreferences } from '@/types/emmy';

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

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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

    // Build OpenAI messages array
    const messages: ConversationMessage[] = [
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

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const reply = openaiData.choices[0]?.message?.content || "I'm sorry, I didn't catch that. Could you try again?";

    // Check if conversation is complete (Emmy signals ready to search)
    const isComplete = reply.toLowerCase().includes('let me find some great matches for you');

    // If complete, extract preferences from conversation
    let extractedData: Partial<JobPreferences> | undefined;

    if (isComplete) {
      // Build extraction prompt
      const extractionPrompt = `Based on the following conversation, extract structured job preferences in JSON format.

Conversation:
${conversationHistory.map((msg) => `${msg.from}: ${msg.text}`).join('\n')}
user: ${currentMessage}

Extract the following if mentioned (use null if not mentioned):
{
  "role": "job title or role type",
  "skills": ["skill1", "skill2"],
  "location": "city name or 'Remote'",
  "remote": true/false,
  "salary": { "min": number, "max": number, "currency": "GBP" } or null,
  "experienceYears": number or 0,
  "preferences": {
    "culturePriorities": ["work-life balance", "growth", etc],
    "companySize": "startup/mid-size/enterprise" or null,
    "industry": "tech/finance/etc" or null
  },
  "mustHaves": ["requirement1", "requirement2"],
  "niceToHaves": ["preference1", "preference2"]
}

Return only valid JSON, no additional text.`;

      const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: extractionPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (extractionResponse.ok) {
        const extractionData = await extractionResponse.json();
        const extractedText = extractionData.choices[0]?.message?.content;

        try {
          // Parse JSON from the response
          const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.error('Failed to parse extracted preferences:', parseError);
        }
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

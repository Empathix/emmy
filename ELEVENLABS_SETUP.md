# ElevenLabs Agent Setup for Emmy

## Current Configuration

The Emmy voice interface is currently using ElevenLabs agent ID: `agent_1701k76s0z7dfnkb2pjzj16sykqm`

## Recommended Improvements

### 1. Auto-End Call with Tool Calls

To automatically end the call and collect the email after Emmy has all the information:

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Find your Emmy agent
3. Go to **Tools** or **Functions** section
4. Add a custom tool called `end_conversation_and_collect_email`

**Tool Configuration:**
```json
{
  "name": "end_conversation_and_collect_email",
  "description": "Call this function when you have gathered all necessary information (role, skills, location, preferences) and are ready to end the conversation and collect the candidate's email",
  "parameters": {
    "type": "object",
    "properties": {
      "ready_to_search": {
        "type": "boolean",
        "description": "Set to true when ready to search for jobs"
      }
    },
    "required": ["ready_to_search"]
  }
}
```

5. Update the agent's system prompt to include:
```
When you have gathered enough information about the candidate's:
- Desired role/job title
- Key skills and experience
- Location preference
- Salary expectations (optional)
- What matters most to them

Say: "Perfect! I have everything I need to find great matches for you. Let me get your email so I can send you the results."

Then IMMEDIATELY call the end_conversation_and_collect_email tool with ready_to_search: true.

Do not continue the conversation after calling this tool.
```

### 2. Update Frontend to Handle Tool Calls

The frontend (voice.tsx) should listen for the tool call event and automatically:
- End the ElevenLabs session
- Show the email collection form

**Code to add in voice.tsx:**
```typescript
onToolCall: (toolCall) => {
  if (toolCall.name === 'end_conversation_and_collect_email') {
    // Auto-end conversation and show email form
    handleEndConversation();
  }
}
```

## Benefits

✅ **Better UX**: Conversation ends naturally when Emmy has enough info
✅ **No manual "End Call" needed**: Emmy controls the flow
✅ **Clearer transition**: From voice → email collection
✅ **Professional feel**: Like talking to a real recruiter

## Current Workaround

Until tool calls are configured:
- Users must manually click "End Conversation" button
- Emmy will still say the completion phrase
- Form appears after manual end

## Questions?

Check ElevenLabs docs: https://elevenlabs.io/docs/conversational-ai/customization/client-tools

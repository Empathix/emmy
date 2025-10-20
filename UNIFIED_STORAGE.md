# Emmy Unified JSON Storage - Documentation

## Overview

All Emmy submissions (user email, LinkedIn, and conversation transcripts) are now stored in **ONE unified JSON file** instead of creating separate files for each user.

---

## Changes Made

### Problem Before:
- ❌ Each submission created a new file: `emmy_<timestamp>_<random>.json`
- ❌ Conversation transcripts weren't saved
- ❌ Hard to query all users or match conversations to users

### Solution Now:
- ✅ **Single unified file**: `emmy-submissions.json`
- ✅ **Transcripts saved** with each user
- ✅ **Easy querying** by email or submission ID
- ✅ **Complete conversation history** for ElevenLabs integration

---

## Unified JSON Structure

### File: `emmy-submissions.json`

```json
{
  "submissions": [
    {
      "submissionId": "emmy_1729485674_abc123",
      "email": "user@example.com",
      "linkedinUrl": "https://linkedin.com/in/username",
      "transcript": [
        {
          "speaker": "emmy",
          "text": "Hi! I'm Emmy. Tell me about your dream job..."
        },
        {
          "speaker": "user",
          "text": "I'm looking for a software engineering role in Auckland..."
        },
        {
          "speaker": "emmy",
          "text": "Great! What tech stack do you prefer?"
        }
        // ... full conversation
      ],
      "timestamp": "2025-10-20T18:30:00.000Z",
      "status": "pending"
    },
    {
      "submissionId": "emmy_1729485980_xyz789",
      "email": "another@example.com",
      "linkedinUrl": "https://linkedin.com/in/another",
      "transcript": [
        // ... their conversation
      ],
      "timestamp": "2025-10-20T18:35:00.000Z",
      "status": "pending"
    }
  ],
  "lastUpdated": "2025-10-20T18:35:00.000Z",
  "totalSubmissions": 2
}
```

---

## API Endpoints

### 1. Submit Conversation (POST)

**Endpoint**: `/api/emmy/submit`

**Purpose**: Save a new user submission with their conversation transcript

**Request Body**:
```json
{
  "email": "user@example.com",
  "linkedinUrl": "https://linkedin.com/in/username",
  "transcript": [
    {
      "speaker": "emmy",
      "text": "Hi! I'm Emmy..."
    },
    {
      "speaker": "user",
      "text": "I'm looking for..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Submission received! Emmy will send you jobs within 24 hours.",
  "submissionId": "emmy_1729485674_abc123"
}
```

**What it does**:
1. Creates a unique submission ID
2. Fetches existing `emmy-submissions.json`
3. Adds new submission to the array
4. Saves updated file with ALL submissions
5. Sends Slack notification (if configured)

---

### 2. Get Submissions (GET)

**Endpoint**: `/api/emmy/submissions`

**Purpose**: Retrieve submissions (all, by email, or by ID)

#### Get ALL submissions:
```
GET /api/emmy/submissions
```

**Response**:
```json
{
  "success": true,
  "submissions": [ /* array of all submissions */ ],
  "totalSubmissions": 42
}
```

#### Get submissions by EMAIL:
```
GET /api/emmy/submissions?email=user@example.com
```

**Response**:
```json
{
  "success": true,
  "submissions": [
    {
      "submissionId": "emmy_1729485674_abc123",
      "email": "user@example.com",
      "linkedinUrl": "https://linkedin.com/in/username",
      "transcript": [ /* full conversation */ ],
      "timestamp": "2025-10-20T18:30:00.000Z",
      "status": "pending"
    }
  ],
  "totalSubmissions": 1
}
```

#### Get specific submission by ID:
```
GET /api/emmy/submissions?submissionId=emmy_1729485674_abc123
```

**Response**:
```json
{
  "success": true,
  "submission": {
    "submissionId": "emmy_1729485674_abc123",
    "email": "user@example.com",
    "linkedinUrl": "https://linkedin.com/in/username",
    "transcript": [ /* full conversation */ ],
    "timestamp": "2025-10-20T18:30:00.000Z",
    "status": "pending"
  }
}
```

---

## How It Works

### 1. Voice Conversation Flow

```
User starts voice chat (ElevenLabs)
         ↓
Emmy asks questions via voice
         ↓
Conversation stored in state (transcript array)
         ↓
User ends conversation
         ↓
Email form appears
         ↓
User submits email + LinkedIn
         ↓
POST /api/emmy/submit with transcript
         ↓
Saved to unified emmy-submissions.json
```

### 2. Data Flow Diagram

```
┌─────────────────┐
│ User Voice Chat │
│  (ElevenLabs)   │
└────────┬────────┘
         │
         v
┌─────────────────────┐
│  Transcript Array   │
│  [{speaker, text}]  │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│  Email Form Submit  │
│  (email, LinkedIn)  │
└────────┬────────────┘
         │
         v
┌──────────────────────────┐
│  /api/emmy/submit (POST) │
│                          │
│  1. Fetch existing file  │
│  2. Add new submission   │
│  3. Save unified JSON    │
│  4. Send Slack alert     │
└────────┬─────────────────┘
         │
         v
┌───────────────────────────┐
│  emmy-submissions.json    │
│  (Vercel Blob Storage)    │
│                           │
│  All users in ONE file    │
└───────────────────────────┘
```

---

## Conversation Transcript + ElevenLabs Integration

### Why transcripts are important:

The transcript captures the **full voice conversation** between the user and Emmy (via ElevenLabs). This allows you to:

1. **Review what users said** - See their exact career preferences
2. **Match jobs accurately** - Use conversation context for better matching
3. **Improve Emmy** - Analyze conversations to improve prompts
4. **Follow-up emails** - Reference what they discussed with Emmy

### Transcript Structure:

Each message in the transcript has:
```typescript
{
  speaker: 'emmy' | 'user',  // Who said it
  text: string                // What they said
}
```

### ElevenLabs Integration:

The voice chat uses ElevenLabs' Conversational AI API:
- **Agent ID**: `agent_1701k76s0z7dfnkb2pjzj16sykqm`
- **Connection**: WebRTC for real-time voice
- **Messages**: Captured via `onMessage` callback
- **Types**:
  - `user_transcript` - User spoke
  - `agent_response` - Emmy responded
  - `audio` - Audio playback
  - `agent_response_end` - Emmy finished speaking

---

## Example Usage

### Retrieve a user's conversation:

```javascript
// Get all submissions for a user
const response = await fetch('/api/emmy/submissions?email=user@example.com');
const data = await response.json();

if (data.success && data.submissions.length > 0) {
  const userConversation = data.submissions[0].transcript;

  // Display conversation
  userConversation.forEach(msg => {
    console.log(`${msg.speaker}: ${msg.text}`);
  });
}
```

### Example Output:
```
emmy: Hi! I'm Emmy. Tell me about your dream job and what matters most to you in your career.
user: I'm looking for a software engineering role, ideally in Auckland or remote
emmy: That's great! What type of software engineering are you most interested in?
user: I love full-stack development, especially with React and Node.js
emmy: Wonderful! And what's most important to you in your next role - company culture, salary, work-life balance?
user: Definitely work-life balance and growth opportunities
emmy: Perfect! I have everything I need. Let me find some great matches for you...
```

---

## Slack Notifications

When a new submission is saved, Slack gets notified with:

```
🎉 New Emmy Submission

Email: user@example.com
LinkedIn: View Profile
Submission ID: emmy_1729485674_abc123
Timestamp: 10/20/2025, 6:30:00 PM
Conversation: 12 messages
Total Submissions: 42

View All Submissions in Blob Storage
```

---

## Benefits

### Before (Separate Files):
```
❌ emmy_1729485674_abc123.json
❌ emmy_1729485980_xyz789.json
❌ emmy_1729486120_def456.json
... hundreds of files

Problem:
- Hard to find all users
- Can't query by email
- Transcripts not saved
- Messy blob storage
```

### After (Unified File):
```
✅ emmy-submissions.json

{
  "submissions": [
    { user 1 with full transcript },
    { user 2 with full transcript },
    { user 3 with full transcript },
    ...
  ],
  "totalSubmissions": 100
}

Benefits:
- ONE file for everything
- Easy to query by email
- Full conversation history
- Clean blob storage
- Easy to export/analyze
```

---

## Migration Notes

### If you have existing separate JSON files:

You can manually merge them into the unified file structure:

```javascript
// Example migration script (run once)
const oldSubmissions = [
  // ... your existing JSON files
];

const unified = {
  submissions: oldSubmissions.map(sub => ({
    ...sub,
    transcript: [] // Add empty transcript if missing
  })),
  lastUpdated: new Date().toISOString(),
  totalSubmissions: oldSubmissions.length
};

// Upload to emmy-submissions.json
```

---

## Testing

### Test the submission flow:

1. Go to `/emmy/voice`
2. Start voice conversation
3. Talk to Emmy about your job preferences
4. End conversation
5. Submit email + LinkedIn
6. Check Slack for notification
7. Verify in Vercel Blob Storage: `emmy-submissions.json`

### Test the retrieval API:

```bash
# Get all submissions
curl https://your-app.vercel.app/api/emmy/submissions

# Get by email
curl https://your-app.vercel.app/api/emmy/submissions?email=test@example.com

# Get by ID
curl https://your-app.vercel.app/api/emmy/submissions?submissionId=emmy_xxx
```

---

## Files Modified

1. **`/src/pages/api/emmy/submit.ts`** - Updated to save to unified file with transcripts
2. **`/src/pages/api/emmy/submissions.ts`** - NEW - Retrieve submissions by email/ID
3. **`/src/pages/emmy/voice.tsx`** - Already sends transcript (no changes needed)

---

## Summary

✅ **Single JSON file** (`emmy-submissions.json`) for all users
✅ **Full conversation transcripts** saved with each submission
✅ **Query by email or ID** via new API endpoint
✅ **ElevenLabs integration** captures voice conversations
✅ **Slack notifications** with conversation stats
✅ **Easy to analyze** all user data in one place

**Status**: ✅ Ready to use!

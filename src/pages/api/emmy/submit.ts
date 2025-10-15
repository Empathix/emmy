import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

interface SubmissionRequest {
  email: string;
  linkedinUrl: string;
  transcript?: Array<{ speaker: string; text: string }>; // Optional, not saved
}

interface SubmissionResponse {
  success: boolean;
  message?: string;
  submissionId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmissionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, linkedinUrl } = req.body as SubmissionRequest;

  if (!email || !linkedinUrl) {
    return res.status(400).json({
      success: false,
      message: 'Email and LinkedIn URL are required'
    });
  }

  try {
    // Create a unique submission ID
    const submissionId = `emmy_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = new Date().toISOString();

    // Prepare the submission data
    const submissionData = {
      submissionId,
      email,
      linkedinUrl,
      timestamp,
      status: 'pending', // pending, processed, emailed
    };

    // Save to Vercel Blob Storage
    const blob = await put(
      `emmy-submissions/${submissionId}.json`,
      JSON.stringify(submissionData, null, 2),
      {
        access: 'public',
        addRandomSuffix: false,
      }
    );

    console.log('Submission saved to Blob Storage:', blob.url);

    // Send Slack notification
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

      if (slackWebhookUrl) {
        const slackMessage = {
          text: '🎉 New Emmy Submission!',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🎉 New Emmy Submission',
                emoji: true
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Email:*\n${email}`
                },
                {
                  type: 'mrkdwn',
                  text: `*LinkedIn:*\n<${linkedinUrl}|View Profile>`
                },
                {
                  type: 'mrkdwn',
                  text: `*Submission ID:*\n${submissionId}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Timestamp:*\n${new Date(timestamp).toLocaleString()}`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `<${blob.url}|View in Blob Storage>`
              }
            }
          ]
        };

        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage),
        });

        console.log('Slack notification sent successfully');
      } else {
        console.log('No SLACK_WEBHOOK_URL configured - skipping Slack notification');
      }

      // Also log to console as backup
      console.log('=== NEW EMMY SUBMISSION ===');
      console.log(`Email: ${email}`);
      console.log(`LinkedIn: ${linkedinUrl}`);
      console.log(`Submission ID: ${submissionId}`);
      console.log(`Blob Storage: ${blob.url}`);
      console.log('===========================');

    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return res.status(200).json({
      success: true,
      message: 'Submission received! Emmy will send you jobs within 24 hours.',
      submissionId,
    });
  } catch (error) {
    console.error('Error saving submission:', error);

    // Fallback: Log to console for manual collection
    console.log('FALLBACK - Emmy Submission:', {
      email,
      linkedinUrl,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to save submission. Please try again.'
    });
  }
}

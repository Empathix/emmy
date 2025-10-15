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

    // Log the submission details for monitoring
    try {
      const emailBody = `
New Emmy Submission!

Submission ID: ${submissionId}
Email: ${email}
LinkedIn: ${linkedinUrl}
Timestamp: ${timestamp}

View in Blob Storage: ${blob.url}
      `.trim();

      console.log('=== NEW EMMY SUBMISSION ===');
      console.log(emailBody);
      console.log('===========================');

      // TODO: Integrate with your email service (SendGrid, Resend, etc.)
      // to send notification to olivia@empathix.com

    } catch (emailError) {
      console.error('Failed to log submission:', emailError);
      // Don't fail the request if logging fails
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

import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

interface SubmissionRequest {
  email: string;
  transcript: Array<{ speaker: string; text: string }>;
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

  const { email, transcript } = req.body as SubmissionRequest;

  if (!email || !transcript) {
    return res.status(400).json({
      success: false,
      message: 'Email and transcript are required'
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
      transcript,
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
      transcriptLength: transcript.length,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to save submission. Please try again.'
    });
  }
}

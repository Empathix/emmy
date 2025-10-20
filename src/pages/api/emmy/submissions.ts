import type { NextApiRequest, NextApiResponse } from 'next';
import { head } from '@vercel/blob';

interface SubmissionData {
  submissionId: string;
  email: string;
  linkedinUrl: string;
  transcript: Array<{ speaker: string; text: string }>;
  timestamp: string;
  status: string;
}

interface SubmissionsResponse {
  success: boolean;
  submissions?: SubmissionData[];
  submission?: SubmissionData;
  error?: string;
  totalSubmissions?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmissionsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, submissionId } = req.query;

  try {
    // Fetch the unified submissions file
    const unifiedFilePath = 'emmy-submissions.json';
    const existingBlob = await head(unifiedFilePath);

    if (!existingBlob) {
      return res.status(404).json({
        success: false,
        error: 'No submissions found',
      });
    }

    // Download submissions
    const response = await fetch(existingBlob.url);
    const data = await response.json();
    const allSubmissions: SubmissionData[] = data.submissions || [];

    // If email query parameter provided, filter by email
    if (email) {
      const userSubmissions = allSubmissions.filter(
        (sub) => sub.email.toLowerCase() === (email as string).toLowerCase()
      );

      if (userSubmissions.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No submissions found for email: ${email}`,
        });
      }

      return res.status(200).json({
        success: true,
        submissions: userSubmissions,
        totalSubmissions: userSubmissions.length,
      });
    }

    // If submissionId query parameter provided, find specific submission
    if (submissionId) {
      const submission = allSubmissions.find(
        (sub) => sub.submissionId === submissionId
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: `Submission not found: ${submissionId}`,
        });
      }

      return res.status(200).json({
        success: true,
        submission,
      });
    }

    // Return all submissions if no filters
    return res.status(200).json({
      success: true,
      submissions: allSubmissions,
      totalSubmissions: allSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions',
    });
  }
}

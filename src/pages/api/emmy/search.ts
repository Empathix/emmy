import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchRequest, SearchResponse, Job, JobPreferences } from '@/types/emmy';
import { jobs } from '@/constants/jobs';

// Calculate relevance score based on preferences
function calculateRelevance(job: Job, preferences: Partial<JobPreferences>): number {
  let score = 50; // Base score

  // Role match
  if (preferences.role && job.title.toLowerCase().includes(preferences.role.toLowerCase())) {
    score += 15;
  }

  // Skills match
  if (preferences.skills && preferences.skills.length > 0) {
    preferences.skills.forEach((skill) => {
      if (job.description.toLowerCase().includes(skill.toLowerCase())) {
        score += 8;
      }
    });
  }

  // Location match
  if (preferences.location) {
    if (preferences.remote && job.remote) {
      score += 10;
    } else if (job.location.toLowerCase().includes(preferences.location.toLowerCase())) {
      score += 10;
    }
  }

  // Salary match
  if (preferences.salary && job.salary) {
    if (job.salary.min >= preferences.salary.min) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

// Generate match reason based on preferences
function generateMatchReason(job: Job, preferences: Partial<JobPreferences>): string {
  const reasons: string[] = [];

  // Skills mentioned
  if (preferences.skills && preferences.skills.length > 0) {
    const matchedSkills = preferences.skills.filter((skill) =>
      job.description.toLowerCase().includes(skill.toLowerCase())
    );
    if (matchedSkills.length > 0) {
      reasons.push(`uses ${matchedSkills.join(', ')}`);
    }
  }

  // Remote preference
  if (preferences.remote && job.remote) {
    reasons.push('offers remote work');
  }

  // Culture priorities
  if (preferences.preferences?.culturePriorities) {
    const priorities = preferences.preferences.culturePriorities;
    if (priorities.includes('work-life balance')) {
      reasons.push('excellent work-life balance');
    }
    if (priorities.includes('growth')) {
      reasons.push('strong growth opportunities');
    }
  }

  if (reasons.length === 0) {
    return 'Strong match for your profile and experience';
  }

  return `You mentioned ${reasons.slice(0, 2).join(' and ')} which this role offers`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { preferences, page = 1, limit = 10 } = req.body as SearchRequest;

  if (!preferences) {
    return res.status(400).json({ error: 'Preferences are required' });
  }

  try {
    // Use static NZ jobs data for MVP (simple and complete)
    const transformedJobs: Job[] = jobs.map((job: any) => {
      // Extract location from description if available
      const description = job.POSITION_FULL_DESCRIPTION || '';
      const hasAuckland = description.toLowerCase().includes('auckland');
      const hasWellington = description.toLowerCase().includes('wellington');
      const hasChristchurch = description.toLowerCase().includes('christchurch');

      let location = 'New Zealand';
      if (hasAuckland) location = 'Auckland, NZ';
      else if (hasWellington) location = 'Wellington, NZ';
      else if (hasChristchurch) location = 'Christchurch, NZ';

      return {
        id: job.id,
        title: job.POSITION_TITLE || 'No title',
        company: job.COMPANY_NAME || 'Unknown company',
        location: location,
        remote: description.toLowerCase().includes('remote') || description.toLowerCase().includes('work from home'),
        description: job.POSITION_FULL_DESCRIPTION || job.POSITION_SHORT_DESCRIPTION || '',
        applyUrl: '#', // Placeholder for MVP - can add company URLs later
        postedDate: new Date(),
        source: 'NZ Jobs',
      };
    });

    // Filter and rank jobs based on preferences
    const jobsWithRelevance = transformedJobs.map((job) => ({
      ...job,
      relevanceScore: calculateRelevance(job, preferences),
      matchReason: generateMatchReason(job, preferences),
    }));

    // Sort by relevance and limit results
    const sortedJobs = jobsWithRelevance
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);

    // Build query string for reference
    const queryParts: string[] = [];
    if (preferences.role) queryParts.push(preferences.role);
    if (preferences.location) queryParts.push(preferences.location);
    const query = queryParts.join(' in ');

    return res.status(200).json({
      jobs: sortedJobs,
      total: sortedJobs.length,
      query,
      page,
    });
  } catch (error) {
    console.error('Error in Emmy search handler:', error);
    return res.status(500).json({ error: 'Failed to search jobs' });
  }
}

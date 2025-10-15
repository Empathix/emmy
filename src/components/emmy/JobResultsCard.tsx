import React from 'react';
import { ExternalLink, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';
import { Job } from '@/types/emmy';
import { formatSalary, formatDate } from '@/utils/emmy-formatting';

interface JobResultsCardProps {
  job: Job;
  index: number;
}

export const JobResultsCard: React.FC<JobResultsCardProps> = ({ job, index }) => {

  return (
    <FadeIn delay={index * 100}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-base text-gray-600">{job.company}</p>
          </div>
          {job.relevanceScore && job.relevanceScore > 70 && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Top Match
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.remote ? 'Remote' : job.location}</span>
          </div>
          {formatSalary(job.salary) && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{formatSalary(job.salary)}</span>
            </div>
          )}
          <div className="text-gray-500">
            Posted {formatDate(job.postedDate)}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{job.description}</p>

        {/* Match Reason */}
        {job.matchReason && (
          <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-900">
                <span className="font-medium">Why this matches:</span> {job.matchReason}
              </p>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Apply on {job.source}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </FadeIn>
  );
};

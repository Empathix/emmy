import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';
import { EmmyHeader } from '@/components/emmy/EmmyHeader';
import { VoiceWave } from '@/components/emmy/VoiceWave';
import { JobResultsCard } from '@/components/emmy/JobResultsCard';
import { Job } from '@/types/emmy';
import Head from 'next/head';
import Link from 'next/link';

export default function EmmyDemo() {
  const [showResults, setShowResults] = useState(false);

  // Mock job data for demo
  const mockJobs: Job[] = [
    {
      id: 'demo-1',
      title: 'Senior Software Engineer',
      company: 'Stripe',
      location: 'London',
      remote: true,
      salary: { min: 80000, max: 120000, currency: 'GBP' },
      description: 'Build scalable payment infrastructure that powers millions of businesses worldwide. Work with React, Node.js, and TypeScript on challenging technical problems.',
      applyUrl: 'https://linkedin.com',
      postedDate: new Date(),
      source: 'LinkedIn',
      relevanceScore: 95,
      matchReason: 'You mentioned React and TypeScript - this role uses both extensively with full remote options and excellent work-life balance.',
    },
    {
      id: 'demo-2',
      title: 'Full Stack Developer',
      company: 'Monzo',
      location: 'London',
      remote: false,
      salary: { min: 70000, max: 90000, currency: 'GBP' },
      description: 'Join our engineering team building the bank of the future. Work with Go, React, and AWS to create delightful banking experiences for millions of customers.',
      applyUrl: 'https://indeed.com',
      postedDate: new Date(),
      source: 'Indeed',
      relevanceScore: 88,
      matchReason: 'Strong growth opportunities and excellent work-life balance culture that you\'re looking for.',
    },
    {
      id: 'demo-3',
      title: 'Frontend Engineer',
      company: 'Deliveroo',
      location: 'London',
      remote: true,
      salary: { min: 65000, max: 85000, currency: 'GBP' },
      description: 'Build beautiful, performant web applications that millions use every day. Work with React, Next.js, and modern frontend tools in a collaborative environment.',
      applyUrl: 'https://linkedin.com',
      postedDate: new Date(),
      source: 'LinkedIn',
      relevanceScore: 85,
      matchReason: 'Remote work with excellent work-life balance in a fast-growing company.',
    },
  ];

  return (
    <>
      <Head>
        <title>Emmy Voice Demo | Empathix</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        <EmmyHeader
          variant="app"
          showBackButton={true}
          title="Emmy"
          subtitle="Voice Career Assistant"
        />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-5xl w-full">
            <FadeIn>
              {!showResults ? (
                /* Voice Interface Mockup */
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* Top Bar */}
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Emmy is listening...</p>
                          <p className="text-white/80 text-sm">Tell me about your dream job</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-white/90 text-sm">Live</span>
                      </div>
                    </div>
                  </div>

                {/* Voice Wave Visualization */}
                <div className="bg-gradient-to-b from-gray-50 to-white px-8 py-12">
                  <VoiceWave barCount={40} animated={false} height="h-32" />
                </div>

                {/* Conversation Preview */}
                <div className="px-8 py-8 bg-white">
                  <h3 className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wide">
                    Live Transcript
                  </h3>

                  <div className="space-y-4">
                    {/* Emmy message */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                        <img src="/empathix-icon-white.png" className="w-5 h-5" alt="Emmy" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                        <p className="text-gray-900">
                          Hi! I'm Emmy. What kind of role are you looking for?
                        </p>
                      </div>
                    </div>

                    {/* User message */}
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl px-4 py-3 max-w-[80%]">
                        <p className="text-white">
                          I'm looking for a software engineering role with React
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">You</span>
                      </div>
                    </div>

                    {/* Emmy response */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                        <img src="/empathix-icon-white.png" className="w-5 h-5" alt="Emmy" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                        <p className="text-gray-900">
                          Great! How many years of experience do you have with React?
                        </p>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">You</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Bottom action */}
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      After the conversation, Emmy finds your perfect matches
                    </p>
                    <button
                      onClick={() => setShowResults(true)}
                      className="px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                    >
                      See Job Results →
                    </button>
                  </div>
                </div>
              ) : (
                /* Job Results View */
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-8 py-6 text-center">
                    <p className="text-2xl font-bold text-green-900 mb-2">
                      🎉 I found {mockJobs.length} perfect matches for you!
                    </p>
                    <p className="text-sm text-green-700">
                      Based on: React Developer • Remote • £80-100k • Work-life balance
                    </p>
                  </div>

                  {/* Job Cards using JobResultsCard component */}
                  {mockJobs.map((job, idx) => (
                    <JobResultsCard key={job.id} job={job} index={idx} />
                  ))}

                  {/* Back Button */}
                  <div className="bg-white border border-gray-200 rounded-xl px-8 py-6 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Want to see how Emmy collected this information?
                    </p>
                    <button
                      onClick={() => setShowResults(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      ← Back to Conversation
                    </button>
                  </div>
                </div>
              )}

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <Mic className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Natural Voice</h3>
                  <p className="text-sm text-gray-600">
                    Just talk naturally - no forms or typing required
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Matching</h3>
                  <p className="text-sm text-gray-600">
                    AI understands context and finds the best fits
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Results</h3>
                  <p className="text-sm text-gray-600">
                    Get personalized job matches in minutes
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}

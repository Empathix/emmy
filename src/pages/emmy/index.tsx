import React from 'react';
import { Phone, Sparkles, Mic, Search, Briefcase } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';
import { EmmyHeader } from '@/components/emmy/EmmyHeader';
import { EmmyFooter } from '@/components/emmy/EmmyFooter';
import Head from 'next/head';
import Link from 'next/link';

export default function EmmyLanding() {

  return (
    <>
      <Head>
        <title>Emmy - AI Career Assistant | Empathix</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        <EmmyHeader variant="landing" />

        <main className="flex-1 px-8 py-16">
          <FadeIn>
            {/* Hero Section */}
            <div className="max-w-5xl mx-auto text-center mb-32">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 mb-8 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  AI-Powered Job Matching
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Every job worth seeing—found by talking, not typing.
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                One 5-minute conversation with Emmy. She searches all major job boards and our network of companies actively hiring. You see everything worth your time and approve every introduction.
              </p>

              <div className="flex items-center justify-center">
                <Link
                  href="/emmy/voice"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-2xl hover:shadow-2xl transition-all text-xl font-bold shadow-xl transform hover:scale-105"
                >
                  <Phone className="w-6 h-6" />
                  Start your conversation
                </Link>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-6xl mx-auto text-center px-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 mb-16">
                Find your perfect role in three simple steps
              </p>

              <div className="grid md:grid-cols-3 gap-12 text-left justify-items-center">
                <div className="relative max-w-sm w-full">
                  <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-4">
                    <span className="text-sm font-semibold text-purple-700">Step 1</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Tell Emmy What You Want
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Have a natural conversation about your ideal role, skills, location, and what matters most to you.
                  </p>
                </div>

                <div className="relative max-w-sm w-full">
                  <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-4">
                    <span className="text-sm font-semibold text-purple-700">Step 2</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Emmy Finds Perfect Matches
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our AI searches thousands of jobs across multiple platforms to find roles that truly fit your preferences.
                  </p>
                </div>

                <div className="relative max-w-sm w-full">
                  <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-4">
                    <span className="text-sm font-semibold text-purple-700">Step 3</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Apply to Your Top Picks
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Review personalized matches with clear explanations of why each role fits, then apply with one click.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </main>

        <EmmyFooter />
      </div>
    </>
  );
}

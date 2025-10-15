import React, { useState, useCallback } from 'react';
import { Phone, Volume2 } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';
import { EmmyHeader } from '@/components/emmy/EmmyHeader';
import { VoiceWave } from '@/components/emmy/VoiceWave';
import { TranscriptDisplay } from '@/components/emmy/TranscriptDisplay';
import Head from 'next/head';
import { useConversation } from '@elevenlabs/react';

export default function EmmyVoice() {
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [jobCount, setJobCount] = useState(400); // Current jobs in NZ/Australia
  const [isFiltering, setIsFiltering] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setError(null);
      // Add initial Emmy greeting to transcript
      setTranscript([
        {
          speaker: 'emmy',
          text: "Hi! I'm Emmy. Tell me about your dream job and what matters most to you in your career.",
        },
      ]);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
    },
    onMessage: (message) => {
      console.log('Message:', message);

      // Handle different message types
      const msg = message as any; // Type cast to handle ElevenLabs message structure
      if (msg.type === 'user_transcript') {
        // User spoke
        setTranscript((prev) => [
          ...prev,
          {
            speaker: 'user',
            text: msg.message || message.message,
          },
        ]);
      } else if (msg.type === 'agent_response') {
        // Emmy responded
        setTranscript((prev) => [
          ...prev,
          {
            speaker: 'emmy',
            text: message.message,
          },
        ]);

        // Simulate job filtering as Emmy learns more
        // Reduce job count based on conversation progress
        const responseText = message.message.toLowerCase();

        // Filter jobs as Emmy gathers specific criteria
        if (responseText.includes('role') || responseText.includes('position') || responseText.includes('job')) {
          setIsFiltering(true);
          setTimeout(() => {
            setJobCount((prev) => Math.max(10, Math.floor(prev * 0.6))); // Reduce by 40%
            setIsFiltering(false);
          }, 800);
        } else if (responseText.includes('location') || responseText.includes('remote')) {
          setIsFiltering(true);
          setTimeout(() => {
            setJobCount((prev) => Math.max(10, Math.floor(prev * 0.7))); // Reduce by 30%
            setIsFiltering(false);
          }, 800);
        } else if (responseText.includes('salary') || responseText.includes('experience')) {
          setIsFiltering(true);
          setTimeout(() => {
            setJobCount((prev) => Math.max(10, Math.floor(prev * 0.8))); // Reduce by 20%
            setIsFiltering(false);
          }, 800);
        } else if (transcript.length > 4) {
          // General reduction for ongoing conversation
          setIsFiltering(true);
          setTimeout(() => {
            setJobCount((prev) => Math.max(10, Math.floor(prev * 0.9))); // Reduce by 10%
            setIsFiltering(false);
          }, 800);
        }
      }

      // Track if Emmy is speaking
      if (msg.type === 'audio') {
        setIsSpeaking(true);
      } else if (msg.type === 'agent_response_end') {
        setIsSpeaking(false);
      }
    },
    onError: (error: any) => {
      console.error('ElevenLabs error:', error);
      setError(typeof error === 'string' ? error : (error?.message || 'Connection error occurred'));
    },
  });

  const handleEndConversation = useCallback(async () => {
    // End the conversation
    await conversation.endSession();
    setIsSpeaking(false);

    // Show email form instead of searching immediately
    setShowEmailForm(true);
  }, [conversation]);

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      setShowEmailForm(false);
      setIsConfirmed(false);

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'agent_1701k76s0z7dfnkb2pjzj16sykqm',
        connectionType: 'webrtc',
      });
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      setError(
        err.message || 'Failed to start voice conversation. Make sure your microphone is enabled.'
      );
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await handleEndConversation();
  }, [handleEndConversation]);

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Send email, LinkedIn + transcript to Vercel Blob Storage
      const response = await fetch('/api/emmy/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          linkedinUrl,
          transcript,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit');
      }

      console.log('Submission successful:', data.submissionId);
      setIsConfirmed(true);
    } catch (err) {
      console.error('Error submitting email:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, linkedinUrl, transcript]);

  const isListening = conversation.status === 'connected';

  return (
    <>
      <Head>
        <title>Emmy Voice | Empathix</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        <EmmyHeader
          variant="app"
          showBackButton={true}
          title="Emmy Voice"
          subtitle="Your Career Partner"
        />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-3xl w-full">
            <FadeIn>
              {/* Thank You / Confirmation Page */}
              {isConfirmed && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-12">
                  <div className="flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      All set! 🎉
                    </h2>

                    {/* Description */}
                    <p className="text-lg text-gray-600 mb-6 max-w-md">
                      Emmy is searching for your perfect matches right now. You'll receive up to 5 personalized job recommendations within 24 hours.
                    </p>

                    {/* Email Display */}
                    <div className="bg-purple-50 rounded-xl px-6 py-4 mb-8">
                      <p className="text-sm text-gray-600 mb-1">We'll send them to:</p>
                      <p className="text-lg font-semibold text-purple-600">{email}</p>
                    </div>

                    {/* What's Next */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md w-full text-left">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens next?</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">✓</span>
                          <span>Emmy searches across major job boards and our network</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">✓</span>
                          <span>Each match includes why it's a good fit for you</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">✓</span>
                          <span>Apply directly from your email with one click</span>
                        </li>
                      </ul>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={startConversation}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Start New Search
                      </button>
                      <a
                        href="/emmy"
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        Back to Home
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Form */}
              {showEmailForm && !isConfirmed && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Thanks for chatting!
                    </h2>
                    <p className="text-lg text-gray-600">
                      Where should Emmy send your personalized job matches?
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {isSubmitting ? 'Submitting...' : 'Send me up to 5 jobs in 24hr'}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      We'll only use your info to send you job matches. No spam, promise!
                    </p>
                  </form>
                </div>
              )}

              {/* Voice Interface */}
              {!showEmailForm && !isConfirmed && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-12">
                {/* Voice Control */}
                <div className="flex flex-col items-center mb-12">
                  {/* Main Call Button */}
                  <button
                    onClick={isListening ? stopConversation : startConversation}
                    className="relative mb-6 group"
                    disabled={conversation.status === 'connecting'}
                  >
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                        isListening
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse'
                          : conversation.status === 'connecting'
                          ? 'bg-gradient-to-br from-gray-400 to-gray-500 animate-pulse'
                          : 'bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                      }`}
                    >
                      {isListening ? (
                        <Phone className="w-12 h-12 text-white" />
                      ) : (
                        <Phone className="w-12 h-12 text-white" />
                      )}
                    </div>

                    {/* Ripple effect when listening */}
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-purple-400 opacity-40 animate-ping" />
                        <div
                          className="absolute inset-0 rounded-full bg-purple-300 opacity-30 animate-ping"
                          style={{ animationDelay: '0.5s' }}
                        />
                      </>
                    )}
                  </button>

                  {/* Status Text */}
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900 mb-1">
                      {conversation.status === 'connecting'
                        ? 'Connecting...'
                        : isListening
                        ? 'Emmy is listening...'
                        : 'Click to start'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isListening
                        ? 'Speak naturally about your ideal job'
                        : conversation.status === 'connecting'
                        ? 'Setting up your conversation...'
                        : 'Start a voice conversation with Emmy'}
                    </p>
                  </div>

                  {/* Speaking Indicator */}
                  {isSpeaking && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                      <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                      <span className="text-sm text-purple-900 font-medium">Emmy is speaking...</span>
                    </div>
                  )}


                  {/* Manual End Button */}
                  {isListening && (
                    <button
                      onClick={stopConversation}
                      className="mt-6 px-6 py-2 bg-white border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                    >
                      End & Find Matches
                    </button>
                  )}
                </div>

                {/* Voice Wave Visualization */}
                {isListening && (
                  <div className="mb-8">
                    <VoiceWave barCount={30} animated={true} />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-900">
                      <span className="font-semibold">Error:</span> {error}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Make sure you have microphone permissions enabled and ELEVENLABS_API_KEY is
                      configured.
                    </p>
                  </div>
                )}

                {/* Live Job Counter - replaces transcript */}
                {isListening && transcript.length > 0 ? (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200 max-w-2xl mx-auto">
                      <div className="text-center mb-6">
                        <div className="inline-block bg-white rounded-full px-4 py-1 mb-4">
                          <span className="text-sm font-medium text-gray-600">
                            {isFiltering ? '🔍 Filtering matches...' : '📊 Current matches'}
                          </span>
                        </div>
                        <div className={`text-6xl font-bold mb-2 ${isFiltering ? 'text-purple-600 animate-pulse' : 'text-purple-600'}`}>
                          {jobCount.toLocaleString()}
                        </div>
                        <p className="text-lg text-gray-600">jobs found in NZ & Australia</p>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.max(5, ((400 - jobCount) / 390) * 100)}%` }}
                        />
                      </div>

                      <p className="text-sm text-gray-600 text-center">
                        Emmy is narrowing down the best options for you as you talk
                      </p>
                    </div>
                  </div>
                ) : (
                  <TranscriptDisplay transcript={transcript} variant="default" />
                )}

                {/* Instructions */}
                {!isListening && transcript.length === 0 && (
                  <div className="text-center text-gray-600">
                    <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
                    <ol className="text-sm space-y-2 text-left max-w-md mx-auto">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">1.</span>
                        <span>Click the call button to start talking with Emmy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">2.</span>
                        <span>Tell Emmy about your ideal role, skills, and what matters to you</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">3.</span>
                        <span>When you're ready, click "Find My Matches" to see personalized jobs</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
              )}

            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}

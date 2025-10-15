import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';
import { StreamingText } from '@/components/sourced';
import { AutoExpandingTextArea } from '@/components/sourced';
import { ThinkingLoader } from '@/components/sourced';
import { EmmyHeader } from '@/components/emmy/EmmyHeader';
import Head from 'next/head';
import { Message, ConversationState } from '@/types/emmy';
import { JobResultsCard } from '@/components/emmy/JobResultsCard';

export default function EmmyChat() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<ConversationState>({
    messages: [],
    isComplete: false,
  });
  const [loading, setLoading] = useState(false);
  const [searchingJobs, setSearchingJobs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  // Send initial greeting when component mounts
  useEffect(() => {
    const initialMessage: Message = {
      from: 'emmy',
      text: "Hi! I'm Emmy, your AI career assistant. I'm here to help you find your dream job through a simple conversation.\n\nLet's start with the basics - what kind of role are you looking for?",
      timestamp: new Date(),
      isStreaming: true,
    };
    setConversation({
      messages: [initialMessage],
      isComplete: false,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    // Add user message
    const newUserMessage: Message = {
      from: 'user',
      text: userMessage,
      timestamp: new Date(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
    }));

    setInput('');
    setLoading(true);

    try {
      // Call conversation API
      const response = await fetch('/api/emmy/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversation.messages,
          currentMessage: userMessage,
        }),
      });

      const data = await response.json();

      // Add Emmy's response
      const emmyMessage: Message = {
        from: 'emmy',
        text: data.reply,
        timestamp: new Date(),
        isStreaming: true,
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, emmyMessage],
        isComplete: data.isComplete,
        extractedPreferences: data.extractedData || prev.extractedPreferences,
      }));

      // If conversation is complete, trigger job search
      if (data.isComplete && data.extractedData) {
        setSearchingJobs(true);

        const searchResponse = await fetch('/api/emmy/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: data.extractedData,
          }),
        });

        const searchData = await searchResponse.json();

        setConversation((prev) => ({
          ...prev,
          jobs: searchData.jobs,
        }));

        setSearchingJobs(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        from: 'emmy',
        text: "I'm sorry, I'm having trouble connecting right now. Could you try that again?",
        timestamp: new Date(),
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRefineSearch = () => {
    const refineMessage: Message = {
      from: 'emmy',
      text: "Sure! What would you like to change? You can tell me about different preferences, or we can start fresh if you'd like.",
      timestamp: new Date(),
      isStreaming: true,
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, refineMessage],
      isComplete: false,
      jobs: undefined,
    }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <>
      <Head>
        <title>Chat with Emmy | Empathix</title>
      </Head>

      <div className="h-screen flex flex-col bg-white">
        <div className="sticky top-0 z-10">
          <EmmyHeader
            variant="app"
            showBackButton={true}
            title="Emmy"
            subtitle="Your AI career assistant"
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            {conversation.messages.map((msg, idx) => (
              <FadeIn key={idx} delay={100}>
                <div
                  className={`flex ${
                    msg.from === 'user' ? 'justify-end' : 'justify-start'
                  } items-end gap-3`}
                >
                  {msg.from === 'emmy' && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <img src="/empathix-icon-black.png" className="w-5 h-5" alt="Emmy" />
                    </div>
                  )}
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] ${
                      msg.from === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-base whitespace-pre-wrap">
                      {msg.from === 'emmy' && msg.isStreaming ? (
                        <StreamingText text={msg.text} isStreaming={msg.isStreaming} baseDelay={20} />
                      ) : (
                        msg.text
                      )}
                    </p>
                  </div>
                  {msg.from === 'user' && (
                    <div className="rounded-full min-w-[32px] min-h-[32px] bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <p className="text-base font-semibold">You</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-start items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <img src="/empathix-icon-black.png" className="w-5 h-5" alt="Emmy" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <ThinkingLoader />
                </div>
              </div>
            )}

            {/* Searching Jobs State */}
            {searchingJobs && (
              <div className="flex justify-start items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <img src="/empathix-icon-black.png" className="w-5 h-5" alt="Emmy" />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <p className="text-sm text-purple-900">Searching for perfect matches...</p>
                </div>
              </div>
            )}

            {/* Job Results */}
            {conversation.jobs && conversation.jobs.length > 0 && (
              <div className="space-y-4 pt-8">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-900 font-medium">
                    🎉 I found {conversation.jobs.length} great matches for you!
                  </p>
                </div>

                {conversation.jobs.map((job, idx) => (
                  <JobResultsCard key={job.id} job={job} index={idx} />
                ))}

                {/* Refinement Options */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Not quite what you're looking for?
                  </p>
                  <button
                    onClick={handleRefineSearch}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Refine my search
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        {!searchingJobs && (
          <div className="sticky bottom-0 max-w-3xl w-full mx-auto px-6 py-6 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm">
                <AutoExpandingTextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  maxLength={500}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 text-base bg-transparent border-none focus:outline-none resize-none placeholder:text-gray-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl text-white transition-colors ${
                    loading || !input.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  disabled={loading || !input.trim()}
                >
                  {loading ? <ThinkingLoader /> : <ArrowUp className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

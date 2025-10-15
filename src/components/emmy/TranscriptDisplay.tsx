import React from 'react';

interface TranscriptLine {
  speaker: string;
  text: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptLine[];
  variant?: 'default' | 'compact';
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  variant = 'default'
}) => {
  if (transcript.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6 max-h-96 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
        {variant === 'compact' ? 'Live Transcript' : 'Conversation'}
      </h3>
      <div className="space-y-4">
        {transcript.map((line, idx) => (
          <div
            key={idx}
            className={`flex ${
              line.speaker === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {line.speaker === 'emmy' && variant === 'default' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center mr-3">
                <img src="/empathix-icon-white.png" className="w-5 h-5" alt="Emmy" />
              </div>
            )}
            <div
              className={`inline-block px-4 py-${variant === 'compact' ? '2' : '3'} rounded-2xl max-w-[85%] ${
                line.speaker === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  : variant === 'compact'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className={`text-${variant === 'compact' ? 'sm' : 'base'}`}>{line.text}</p>
            </div>
            {line.speaker === 'user' && variant === 'default' && (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center ml-3">
                <span className="text-purple-600 font-semibold text-sm">You</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';

interface VoiceWaveProps {
  barCount?: number;
  animated?: boolean;
  height?: string;
}

export const VoiceWave: React.FC<VoiceWaveProps> = ({
  barCount = 30,
  animated = true,
  height = 'h-24'
}) => {
  return (
    <div className={`flex items-center justify-center gap-1 ${height}`}>
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-200"
          style={{
            height: animated
              ? `${20 + Math.sin(Date.now() / 200 + i * 0.5) * 40}%`
              : `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%`,
            opacity: 0.6 + Math.random() * 0.4,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
};

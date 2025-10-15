import { useState, useEffect } from 'react';

// Streaming text component for Emmy's replies - 1-5 words at a time with random delays
export const StreamingText = ({ text, isStreaming = true, baseDelay = 100 }: { text: string; isStreaming?: boolean; baseDelay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    const words = text.split(' ');
    setDisplayedText('');
    setCurrentWordIndex(0);
    setIsComplete(false);

    let timeoutId: NodeJS.Timeout;

    const streamNextChunk = (wordIndex: number) => {
      if (wordIndex >= words.length) {
        setIsComplete(true);
        return;
      }

      // Randomly choose 1-5 words for this chunk
      const chunkSize = Math.floor(Math.random() * 5) + 1;
      const endIndex = Math.min(wordIndex + chunkSize, words.length);

      const wordsToShow = words.slice(0, endIndex);
      setDisplayedText(wordsToShow.join(' '));
      setCurrentWordIndex(endIndex);

      // Check if any word in this chunk has punctuation for longer pause
      const currentChunk = words.slice(wordIndex, endIndex);
      const hasPunctuation = currentChunk.some(word => /[.!?;,]/.test(word));

      // Faster base delay with less randomness, longer pause for punctuation
      const randomDelay = baseDelay + Math.random() * 15 + (hasPunctuation ? 100 : 0);

      timeoutId = setTimeout(() => {
        streamNextChunk(endIndex);
      }, randomDelay);
    };

    // Start streaming immediately
    timeoutId = setTimeout(() => {
      streamNextChunk(0);
    }, 5);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text, isStreaming, baseDelay]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
    </span>
  );
};

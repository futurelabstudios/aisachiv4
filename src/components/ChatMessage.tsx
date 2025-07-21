import { Message, Language } from '@/types';
import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

export const formatMessageContent = (content: string): string => {
  // Enhanced formatting for better readability
  return content
    .replace(/\n\n+/g, '\n\n') // Normalize multiple line breaks
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-emerald-700">$1</strong>'
    ) // Bold text
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>') // Italic text
    .replace(
      /(\d+\.\s)/g,
      '<br/><span class="font-medium text-emerald-600">$1</span>'
    ) // Numbered lists
    .replace(
      /([•·]\s)/g,
      '<br/><span class="text-emerald-600 font-bold">$1</span>'
    ) // Bullet points
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    ) // Links
    .replace(/(\n)/g, '<br/>') // Line breaks
    .replace(/^<br\/>/, ''); // Remove leading line break
};

interface ChatMessageProps {
  message: Message;
  language: Language;
}

export default function ChatMessage({ message, language }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioRef.current || !message.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  if (message.content.length > 0) {
    return (
      <div
        className={`flex ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        } mb-2 sm:mb-4 px-2 animate-fade-in`}
      >
        <div
          className={`${
            message.role === 'user'
              ? 'bg-sachiv-primary text-white rounded-2xl rounded-tr-none'
              : 'bg-white text-sachiv-dark rounded-2xl rounded-tl-none shadow-sm border border-gray-100'
          } max-w-[85%] text-sm sm:text-base p-3 sm:p-4 transition-all duration-200 hover:shadow-md`}
        >
          <div
            className="whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{
              __html: formatMessageContent(message.content),
            }}
          />

          {message.role === 'assistant' &&
            message.audioUrl &&
            message.audioUrl !== 'browser-tts' && (
              <div className="mt-2 flex items-center">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors duration-200 shadow-sm"
                  aria-label={
                    isPlaying
                      ? language === 'hindi'
                        ? 'रोकें'
                        : 'Ruko'
                      : language === 'hindi'
                      ? 'चलाएं'
                      : 'Chalao'
                  }
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <audio
                  ref={audioRef}
                  src={message.audioUrl}
                  onEnded={handleAudioEnded}
                  className="hidden"
                  autoPlay={false}
                />
                <span className="ml-2 text-xs sm:text-sm text-emerald-600 font-medium">
                  🎵 Suniye
                </span>
              </div>
            )}
        </div>
      </div>
    );
  }
  return <></>;
}

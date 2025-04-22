
import { Message, Language } from "@/types";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

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

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={message.role === 'user' ? 'user-message' : 'bot-message'}>
        <p>{message.content}</p>
        
        {message.role === 'assistant' && message.audioUrl && (
          <div className="mt-2 flex items-center">
            <button 
              onClick={handlePlayPause}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-sachiv-primary/10 text-sachiv-primary hover:bg-sachiv-primary/20"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <audio 
              ref={audioRef} 
              src={message.audioUrl} 
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <span className="ml-2 text-sm text-sachiv-gray">
              {language === 'english' ? 'Listen' : 'सुनें'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

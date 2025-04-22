
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
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2 sm:mb-4 px-2`}>
      <div className={`${message.role === 'user' ? 'user-message' : 'bot-message'} max-w-[85%] text-sm sm:text-base`}>
        <p>{message.content}</p>
        
        {message.role === 'assistant' && message.audioUrl && (
          <div className="mt-2 flex items-center">
            <button 
              onClick={handlePlayPause}
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-sachiv-primary/10 text-sachiv-primary hover:bg-sachiv-primary/20"
              aria-label={isPlaying ? 
                language === 'english' ? 'Pause' : language === 'hindi' ? 'रोकें' : 'Ruko' : 
                language === 'english' ? 'Play' : language === 'hindi' ? 'चलाएं' : 'Chalao'
              }
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <audio 
              ref={audioRef} 
              src={message.audioUrl} 
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <span className="ml-2 text-xs sm:text-sm text-sachiv-gray">
              {language === 'english' ? 'Listen' : language === 'hindi' ? 'सुनें' : 'Suno'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

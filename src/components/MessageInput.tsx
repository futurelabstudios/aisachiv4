import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Language } from '@/types';
import { ArrowRight, Mic, MicOff } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  transcript?: string;
}

export default function MessageInput({
  onSendMessage,
  isLoading,
  language,
  isListening = false,
  onStartListening,
  onStopListening,
  transcript = '',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use transcript if available, otherwise use typed message
  const currentMessage = transcript || message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && !isLoading) {
      onSendMessage(currentMessage);
      setMessage('');
      // Stop listening if currently recording
      if (isListening) {
        onStopListening?.();
      }
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      onStopListening?.();
    } else {
      onStartListening?.();
    }
  };

  const getPlaceholder = () => {
    if (isListening) {
      return language === 'hindi' ? 'सुन रहा हूं...' : 'Sun raha hun...';
    }
    return language === 'hindi'
      ? 'अपना संदेश लिखें या बोलने के लिए माइक दबाएं...'
      : 'Apna message likhe ya bolne ke liye mic dabaye...';
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-2 sm:p-4 bg-white border-t border-gray-200"
    >
      <Input
        ref={inputRef}
        type="text"
        value={currentMessage}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={getPlaceholder()}
        className={`flex-1 py-3 sm:py-6 text-base sm:text-lg rounded-xl border-gray-300 focus:border-sachiv-primary focus:ring-1 focus:ring-sachiv-primary transition-colors duration-200 ${
          isListening ? 'bg-blue-50 border-blue-300' : ''
        }`}
        disabled={isLoading || isListening}
        aria-label={language === 'hindi' ? 'संदेश इनपुट' : 'Message input'}
      />

      {/* Voice Button */}
      {/* {onStartListening && onStopListening && (
        <Button
          type="button"
          onClick={handleVoiceToggle}
          className={`h-12 sm:h-14 aspect-square rounded-xl transition-all duration-300 ${
            isListening 
              ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-300 ring-opacity-50 shadow-lg' 
              : 'bg-blue-500 hover:bg-blue-600 shadow-md'
          }`}
          aria-label={isListening ? 
            (language === 'hindi' ? 'रिकॉर्डिंग बंद करें' : 'Recording band kare') :
            (language === 'hindi' ? 'आवाज रिकॉर्डिंग शुरू करें' : 'Voice recording shuru kare')
          }
        >
          <Mic className={`h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-200 ${
            isListening ? 'scale-110' : 'scale-100'
          }`} />
        </Button>
      )} */}

      {/* Send Button */}
      <Button
        type="submit"
        disabled={!currentMessage.trim() || isLoading}
        className={`btn-primary h-12 sm:h-14 aspect-square rounded-xl transition-all duration-200 ${
          !currentMessage.trim() || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105'
        }`}
        aria-label={language === 'hindi' ? 'संदेश भेजें' : 'Message bheje'}
      >
        <ArrowRight
          className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 ${
            isLoading ? 'animate-pulse' : ''
          }`}
        />
      </Button>
    </form>
  );
}

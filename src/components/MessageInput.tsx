import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Language } from "@/types";
import { ArrowRight } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
}

export default function MessageInput({ onSendMessage, isLoading, language }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 sm:p-4 bg-white border-t border-gray-200">
      <Input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={language === 'english' ? 'Type your message...' : language === 'hindi' ? 'अपना संदेश लिखें...' : 'Apna message likhe...'}
        className="flex-1 py-3 sm:py-6 text-base sm:text-lg rounded-xl border-gray-300 focus:border-sachiv-primary focus:ring-1 focus:ring-sachiv-primary transition-colors duration-200"
        disabled={isLoading}
        aria-label={language === 'english' ? 'Message input' : language === 'hindi' ? 'संदेश इनपुट' : 'Message input'}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading}
        className={`btn-primary h-12 sm:h-14 aspect-square rounded-xl transition-all duration-200 ${
          !message.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
        }`}
        aria-label={language === 'english' ? 'Send message' : language === 'hindi' ? 'संदेश भेजें' : 'Message bheje'}
      >
        <ArrowRight className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 ${
          isLoading ? 'animate-pulse' : ''
        }`} />
      </Button>
    </form>
  );
}

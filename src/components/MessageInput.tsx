
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={language === 'english' ? 'Type your message...' : 'अपना संदेश लिखें...'}
        className="flex-1 py-6 text-lg rounded-xl border-gray-300 focus:border-sachiv-primary focus:ring-1 focus:ring-sachiv-primary"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading}
        className="btn-primary h-full aspect-square"
        aria-label="Send message"
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
    </form>
  );
}

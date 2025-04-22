
import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  language: string;
}

export default function VoiceButton({ 
  isListening, 
  onStartListening, 
  onStopListening,
  language
}: VoiceButtonProps) {
  return (
    <button
      className={`btn-voice ${isListening ? 'animate-pulse ring-4 ring-sachiv-primary/50' : ''}`}
      onTouchStart={onStartListening}
      onMouseDown={onStartListening}
      onTouchEnd={onStopListening}
      onMouseUp={onStopListening}
      onTouchCancel={onStopListening}
      onMouseLeave={isListening ? onStopListening : undefined}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      {isListening ? (
        <MicOff className="h-10 w-10" />
      ) : (
        <Mic className="h-10 w-10" />
      )}
    </button>
  );
}

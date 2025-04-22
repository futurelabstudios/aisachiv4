
interface SpeechRecognitionOptions {
  language: string;
  onResult: (transcript: string) => void;
  onEnd: () => void;
  onError: (error: any) => void;
}

export function useSpeechRecognition() {
  let recognition: any = null;
  
  if ('webkitSpeechRecognition' in window) {
    // @ts-ignore - WebkitSpeechRecognition is not in the TypeScript types
    recognition = new webkitSpeechRecognition();
  } else if ('SpeechRecognition' in window) {
    // @ts-ignore - SpeechRecognition is not properly typed
    recognition = new (window as any).SpeechRecognition();
  }
  
  const start = ({ language, onResult, onEnd, onError }: SpeechRecognitionOptions) => {
    if (!recognition) {
      onError('Speech recognition is not supported in this browser');
      return false;
    }
    
    recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      onResult(transcript);
    };
    
    recognition.onerror = (event) => {
      onError(event.error);
    };
    
    recognition.onend = () => {
      onEnd();
    };
    
    try {
      recognition.start();
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  };
  
  const stop = () => {
    if (recognition) {
      recognition.stop();
    }
  };
  
  return { start, stop, isSupported: !!recognition };
}

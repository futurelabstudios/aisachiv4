
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import VoiceButton from "@/components/VoiceButton";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/utils/speechRecognition";
import { Volume, VolumeX } from "lucide-react";

export default function VoiceAgentPage() {
  const [language, setLanguage] = useState<Language>('english');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const speechRecognition = useSpeechRecognition();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const handleStartListening = () => {
    setTranscript("");
    setIsListening(true);
    
    const started = speechRecognition.start({
      language: language,
      onResult: (text) => {
        setTranscript(text);
      },
      onEnd: () => {
        setIsListening(false);
        if (transcript.trim()) {
          processVoiceInput(transcript.trim());
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    });
    
    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    speechRecognition.stop();
    setIsListening(false);
    if (transcript.trim()) {
      processVoiceInput(transcript.trim());
    }
  };

  const processVoiceInput = async (input: string) => {
    setIsProcessing(true);
    
    try {
      // This would be an API call to your backend
      // For now, we'll mock a response after a delay
      setTimeout(() => {
        const mockResponse = language === 'english' 
          ? "I've processed your voice input. This is a sample response that would normally come from GPT-4 API. In a production app, this would be converted to speech using ElevenLabs API."
          : "मैंने आपका आवाज इनपुट प्रोसेस किया है। यह एक सैंपल रिस्पांस है जो आम तौर पर GPT-4 API से आएगा। एक प्रोडक्शन ऐप में, इसे ElevenLabs API का उपयोग करके वाणी में परिवर्तित किया जाएगा।";
          
        setResponse(mockResponse);
        setIsProcessing(false);
        
        // Simulate audio playback
        setIsPlaying(true);
        setTimeout(() => {
          setIsPlaying(false);
        }, 5000); // Simulate 5 seconds of audio playback
      }, 1500);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-16 max-w-sm">
          <h2 className="text-2xl font-semibold mb-4 text-sachiv-dark">
            {language === 'english' 
              ? 'Voice Agent Mode' 
              : 'वॉइस एजेंट मोड'}
          </h2>
          <p className="text-sachiv-gray">
            {language === 'english' 
              ? 'Press and hold the button to speak with your AI Sachiv assistant.' 
              : 'अपने एआई सचिव सहायक से बात करने के लिए बटन को दबाकर रखें।'}
          </p>
        </div>
        
        {isListening && (
          <div className="animate-pulse mb-8 text-center">
            <div className="text-xl font-medium text-sachiv-primary mb-2">
              {language === 'english' ? 'Listening...' : 'सुन रहा हूँ...'}
            </div>
            {transcript && (
              <p className="max-w-sm mx-auto text-sachiv-dark">{transcript}</p>
            )}
          </div>
        )}
        
        {isProcessing && (
          <div className="animate-pulse mb-8 text-center">
            <div className="text-xl font-medium text-sachiv-primary">
              {language === 'english' ? 'Processing...' : 'प्रोसेसिंग...'}
            </div>
          </div>
        )}
        
        {isPlaying && (
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sachiv-primary/10 text-sachiv-primary mb-4">
              <Volume className="h-8 w-8 animate-pulse" />
            </div>
            <div className="max-w-sm mx-auto text-sachiv-dark">
              <p>{response}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <VoiceButton 
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            language={language}
          />
          <p className="mt-4 text-sachiv-gray">
            {language === 'english' 
              ? 'Tap and hold to speak' 
              : 'बोलने के लिए टैप करें और दबाकर रखें'}
          </p>
        </div>
      </main>
      
      <footer className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-center text-sachiv-gray">
            {language === 'english' 
              ? 'AI Sachiv - Your Gram Panchayat Assistant' 
              : 'एआई सचिव - आपका ग्राम पंचायत सहायक'}
          </p>
        </div>
      </footer>
    </div>
  );
}

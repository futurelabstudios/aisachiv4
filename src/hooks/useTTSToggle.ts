import { useState, useEffect } from 'react';

export const useTTSToggle = () => {
  const [isTTSEnabled, setIsTTSEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load TTS preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('aiSachiv-tts-enabled');
    if (savedPreference !== null) {
      setIsTTSEnabled(JSON.parse(savedPreference));
    }
  }, []);

  // Save TTS preference to localStorage whenever it changes
  const toggleTTS = () => {
    const newState = !isTTSEnabled;
    setIsTTSEnabled(newState);
    localStorage.setItem('aiSachiv-tts-enabled', JSON.stringify(newState));
    
    // Provide user feedback
    console.log(`🎵 TTS ${newState ? 'enabled' : 'disabled'}`);
  };

  return {
    isTTSEnabled,
    toggleTTS,
    isLoading,
    setIsLoading
  };
}; 
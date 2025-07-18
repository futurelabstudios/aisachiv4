interface SpeechRecognitionOptions {
  language: string;
  onResult: (transcript: string) => void;
  onEnd: () => void;
  onError: (error: any) => void;
}

class SpeechRecognitionService {
  private recognition: any = null;
  private isBrowserSupported: boolean = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      this.recognition = new webkitSpeechRecognition();
      this.isBrowserSupported = true;
    } else if ('SpeechRecognition' in window) {
      // @ts-ignore
      this.recognition = new (window as any).SpeechRecognition();
      this.isBrowserSupported = true;
    }
  }

  public start(options: SpeechRecognitionOptions): boolean {
    if (!this.isBrowserSupported || !this.recognition) {
      options.onError('Speech recognition is not supported in this browser');
      return false;
    }

    this.recognition.lang = options.language === 'hindi' ? 'hi-IN' : 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      options.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      options.onError(event.error);
    };

    this.recognition.onend = () => {
      options.onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      options.onError(error);
      return false;
    }
  }

  public stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public get isSupported(): boolean {
    return this.isBrowserSupported;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();

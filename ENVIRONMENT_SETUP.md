# AI Sachiv Environment Setup Guide

## Overview
AI Sachiv is a comprehensive government assistance platform with three main document analysis features:

1. **📄 Document Upload & Analysis** - Upload files (PDF, Word, Images) for AI analysis
2. **📸 Camera Capture** - Take photos of documents to analyze 
3. **🎨 AI Image Generation** - Generate images using DALL-E based on text prompts

## Required API Keys

### OpenAI API Key (Required)
For document analysis, chat, and image generation features.

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)

### ElevenLabs API Key (Optional)
For enhanced text-to-speech with Indian accent.

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Create an account
3. Navigate to your profile settings
4. Copy your API key

## Environment Configuration

### Method 1: Environment Variables (Recommended)
Create a `.env` file in the project root:

```bash
# Required for full functionality
VITE_OPENAI_API_KEY=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


# Optional for enhanced TTS
VITE_ELEVENLABS_API_KEY=sk_d6a0904bc5e605b5686c0f5fe47eb4d327029d9038a5ca2b
VITE_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB

# App Settings
VITE_APP_NAME=AI Sachiv
VITE_APP_VERSION=1.0.0
NODE_ENV=development
```

### Method 2: Direct Browser Configuration
If you can't use .env files, you can set them directly in the browser console:

```javascript
// Set OpenAI API key
localStorage.setItem('openai_api_key', 'your_openai_api_key_here');

// Set ElevenLabs API key (optional)
localStorage.setItem('elevenlabs_api_key', 'your_elevenlabs_api_key_here');
```

## Feature Status Without API Keys

| Feature | Without API Key | With API Key |
|---------|----------------|--------------|
| **Document Analysis** | ✅ Basic file info, fallback analysis | ✅ Full AI analysis, summaries, translations |
| **Camera Capture** | ✅ Photo capture, basic info | ✅ OCR and intelligent analysis |
| **Image Generation** | ✅ Placeholder images with prompt | ✅ DALL-E generated images |
| **Chat** | ❌ Requires API key | ✅ Full conversational AI |
| **Text-to-Speech** | ✅ Browser TTS | ✅ Enhanced Indian accent TTS |

## Troubleshooting

### Document Analysis Issues
1. **"No text extracted"** - Try converting to PDF or taking a photo
2. **"Network error"** - Check internet connection and API key
3. **"File too large"** - Reduce file size under 50MB

### Camera Issues
1. **"Permission denied"** - Click camera icon in URL bar to allow access
2. **"Camera not found"** - Check if camera is connected and not used by other apps
3. **"Browser not supported"** - Use Chrome, Firefox, or Safari

### Image Generation Issues
1. **"API key invalid"** - Verify your OpenAI API key is correct
2. **"Inappropriate content"** - Ensure prompts are suitable for government work
3. **"Placeholder image shown"** - Add OpenAI API key for DALL-E access

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Browser Requirements

- **Chrome 60+** (Recommended)
- **Firefox 55+**
- **Safari 11+**
- **Edge 79+**

## Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for production deployment
3. **Rotate API keys** regularly
4. **Monitor API usage** to avoid unexpected charges

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API keys are valid and have sufficient credits
3. Ensure your browser supports modern web APIs
4. Try refreshing the page or using incognito mode

For technical support, please check the project documentation or contact the development team.

---

**Built by Futurelab Ikigai and Piramal Foundation © 2025** 
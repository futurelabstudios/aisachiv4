# Environment Setup for AI Sachiv

This application requires environment variables to function properly. Follow these steps to set up your environment:

## 1. Environment Variables

Create a `.env` file in the root directory of your project with the following variables:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
VITE_APP_NAME="AI Sachiv"
VITE_APP_VERSION="1.0.0"
```

## 2. OpenAI API Key

To get your OpenAI API key:

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Generate a new API key
5. Copy the key and replace `your_openai_api_key_here` in your `.env` file

## 3. Security Best Practices

- **Never commit your `.env` file to version control**
- Add `.env` to your `.gitignore` file
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor your API usage to detect any unauthorized access

## 4. Fallback Configuration

If no environment variables are provided, the application will use a fallback configuration in `src/config/env.ts`. However, for production use, always provide your own API key.

## 5. Local Development

For local development:
1. Copy `.env.example` to `.env` (if available)
2. Fill in your actual API key
3. Restart your development server

## 6. Production Deployment

For production deployment:
- Set environment variables through your hosting platform's dashboard
- Never hardcode API keys in your source code
- Use secure methods to inject environment variables during build time

## Troubleshooting

If you encounter issues:
1. Verify your API key is correctly set
2. Check that your OpenAI account has sufficient credits
3. Ensure the API key has the necessary permissions
4. Check the browser console for any error messages

## Model Configuration

The application is configured to use GPT-4o by default. You can modify the model in `src/config/env.ts` if needed. 
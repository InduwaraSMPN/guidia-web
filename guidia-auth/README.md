# Guidia Auth Service

This is the authentication and backend service for the Guidia web application.

## Features

- User authentication and authorization
- Profile management
- Job posting and application management
- Meeting scheduling
- Chat messaging
- AI assistant (Guidia AI)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file to add your API keys and configuration.

3. Start the development server:
```bash
npm run dev
```

## AI Assistant Configuration

The Guidia AI assistant supports multiple AI providers:

### SambaNova (Default)

The default AI provider is SambaNova, which uses the Meta-Llama-3.1-405B-Instruct model.

To configure SambaNova:
1. Get an API key from SambaNova
2. Add it to your `.env` file:
```
SAMBANOVA_API_KEY=your_sambanova_api_key
```

### DeepSeek

The service also supports DeepSeek as an alternative AI provider.

To configure DeepSeek:
1. Get an API key from DeepSeek
2. Add it to your `.env` file:
```
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Using Multiple Providers

The service can automatically fall back to an alternative provider if the primary one fails. To use this feature:
1. Configure both SambaNova and DeepSeek API keys in your `.env` file
2. The service will automatically select the available provider (SambaNova is prioritized if both are available)
3. To explicitly set the provider, use the `setProvider` method:

```javascript
const aiService = new OpenAIService();
aiService.setProvider('deepseek'); // Switch to DeepSeek
```

### Example Usage

```javascript
const OpenAIService = require('./services/openaiService');

async function example() {
  const aiService = new OpenAIService();

  // Use default provider (SambaNova)
  const response1 = await aiService.sendMessage('Hello, how can you help me?');

  // Switch to DeepSeek
  aiService.setProvider('deepseek');
  const response2 = await aiService.sendMessage('Tell me about career guidance');

  // Use a specific provider for a single request
  const response3 = await aiService.sendMessage('What are some interview tips?', [], false, 'sambanova');
}
```

See the `examples/deepseek-example.js` file for a complete example.

## API Endpoints

### AI Assistant

- `POST /api/openai/chat` - Send a message to the AI assistant
- `POST /api/openai/stream` - Stream a message to the AI assistant

## License

This project is proprietary and confidential.

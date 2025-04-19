/**
 * Example of using the DeepSeek provider with the OpenAIService
 */
const OpenAIService = require('../services/openaiService');

async function testDeepSeek() {
  try {
    // Create a new instance of the OpenAIService
    const aiService = new OpenAIService();
    
    // Set the provider to DeepSeek
    aiService.setProvider('deepseek');
    
    // Send a test message
    console.log('Sending test message to DeepSeek...');
    const response = await aiService.sendMessage('Tell me about career guidance for university students');
    
    console.log('Response from DeepSeek:');
    console.log(response);
    
    // Try with SambaNova as well
    console.log('\nSwitching to SambaNova provider...');
    aiService.setProvider('sambanova');
    
    console.log('Sending test message to SambaNova...');
    const sambanovaResponse = await aiService.sendMessage('What are some tips for writing a good resume?');
    
    console.log('Response from SambaNova:');
    console.log(sambanovaResponse);
    
  } catch (error) {
    console.error('Error testing AI providers:', error);
  }
}

// Run the test
testDeepSeek();

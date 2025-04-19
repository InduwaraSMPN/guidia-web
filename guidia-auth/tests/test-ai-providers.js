/**
 * Test script for AI providers
 *
 * This script tests both SambaNova and DeepSeek providers
 *
 * Usage:
 * node tests/test-ai-providers.js
 */

const OpenAIService = require('../services/openaiService');

async function testProviders() {
  console.log('Testing AI providers...');
  console.log('======================');

  // Track test results
  const testResults = {
    sambanova: { success: false, response: null, error: null },
    deepseek: { success: false, response: null, error: null },
    fallback: { success: false, response: null, error: null }
  };

  try {
    // Create a new instance of the OpenAIService
    const aiService = new OpenAIService();

    // Test SambaNova provider
    console.log('\n1. Testing SambaNova provider:');
    console.log('----------------------------');
    try {
      const sambanovaResponse = await aiService.sendMessage(
        'What are the key components of a good resume?',
        [],
        false,
        'sambanova'
      );
      console.log('SambaNova response:');
      console.log(sambanovaResponse);
      console.log('\nSambaNova test completed successfully.');
      testResults.sambanova.success = true;
      testResults.sambanova.response = sambanovaResponse;
    } catch (error) {
      console.error('SambaNova test failed:', error.message);
      testResults.sambanova.success = false;
      testResults.sambanova.error = error.message;
    }

    // Test DeepSeek provider
    console.log('\n2. Testing DeepSeek provider:');
    console.log('--------------------------');
    try {
      // Set the provider to DeepSeek
      aiService.setProvider('deepseek');

      const deepseekResponse = await aiService.sendMessage(
        'What are some effective interview techniques?'
      );
      console.log('DeepSeek response:');
      console.log(deepseekResponse);
      console.log('\nDeepSeek test completed successfully.');
      testResults.deepseek.success = true;
      testResults.deepseek.response = deepseekResponse;
    } catch (error) {
      console.error('DeepSeek test failed:', error.message);
      testResults.deepseek.success = false;
      testResults.deepseek.error = error.message;
    }

    // Test fallback mechanism
    console.log('\n3. Testing provider fallback:');
    console.log('---------------------------');
    try {
      // Create a new service with a fake SambaNova API key to force fallback
      const fallbackService = new OpenAIService();
      fallbackService.sambanovaApiKey = 'invalid-key';

      const fallbackResponse = await fallbackService.sendMessage(
        'Tell me about career guidance for university students'
      );
      console.log('Fallback response:');
      console.log(fallbackResponse);
      console.log('\nFallback test completed.');
      testResults.fallback.success = true;
      testResults.fallback.response = fallbackResponse;
    } catch (error) {
      console.error('Fallback test failed:', error.message);
      testResults.fallback.success = false;
      testResults.fallback.error = error.message;
    }

    console.log('\nAll tests completed.');

    // Generate and display test summary
    generateTestSummary(testResults);
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

/**
 * Generate a summary of the test results
 * @param {Object} results - The test results object
 */
function generateTestSummary(results) {
  console.log('\n======================');
  console.log('    TEST SUMMARY    ');
  console.log('======================');

  // Count successful tests
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;

  console.log(`\nOverall Status: ${successCount}/${totalTests} tests passed`);

  // Display individual test results
  console.log('\nDetailed Results:');
  console.log('----------------');

  // SambaNova test
  console.log(`1. SambaNova: ${results.sambanova.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.sambanova.success && results.sambanova.error) {
    console.log(`   Error: ${results.sambanova.error}`);
  }

  // DeepSeek test
  console.log(`2. DeepSeek: ${results.deepseek.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.deepseek.success && results.deepseek.error) {
    console.log(`   Error: ${results.deepseek.error}`);
  }

  // Fallback test
  console.log(`3. Fallback: ${results.fallback.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.fallback.success && results.fallback.error) {
    console.log(`   Error: ${results.fallback.error}`);
  }

  // Check if any provider is working
  const anyProviderWorking = results.sambanova.success || results.deepseek.success;
  const fallbackWorking = results.fallback.success;

  console.log('\nConclusion:');
  console.log('-----------');
  if (anyProviderWorking) {
    console.log('✅ At least one AI provider is working correctly.');
  } else {
    console.log('❌ No AI providers are working. Check API keys and connectivity.');
  }

  if (fallbackWorking) {
    console.log('✅ Fallback mechanism is working correctly.');
  } else {
    console.log('❌ Fallback mechanism is not working. Check implementation.');
  }

  console.log('\nRecommendations:');
  if (!results.sambanova.success && !results.deepseek.success) {
    console.log('- Verify that API keys are correctly set in the .env file');
    console.log('- Check network connectivity to the AI provider services');
    console.log('- Ensure the OpenAI SDK is properly installed and configured');
  } else if (!results.sambanova.success) {
    console.log('- Check the SambaNova API key in the .env file');
    console.log('- Verify connectivity to the SambaNova service');
  } else if (!results.deepseek.success) {
    console.log('- Check the DeepSeek API key in the .env file');
    console.log('- Verify connectivity to the DeepSeek service');
  }

  if (!results.fallback.success) {
    console.log('- Review the fallback implementation in the OpenAIService class');
  }

  console.log('\n======================');
}

// Run the tests
testProviders();

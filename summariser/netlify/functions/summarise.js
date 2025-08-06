// netlify/functions/summarise.js
require('dotenv').config({path : '../../.env'});
const axios = require('axios');
// ✅ Debug: check if env is loaded
console.log("🔑 API KEY FROM ENV:", process.env.OPENROUTER_API_KEY);
exports.handler = async function (event) {
      console.log("📤 Running summarise function");
  console.log("🔑 API KEY:", process.env.OPENROUTER_API_KEY); // <--- here
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OPENROUTER_API_KEY missing in env' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST allowed' }),
    };
  }

  const { text } = JSON.parse(event.body || '{}');

  if (!text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing text' }),
    };
  }

  const prompt = `
Summarize the following article in around 10 words. Keep the summary clear, informative, and suitable for someone looking to understand the key points quickly:

"""
${text}
"""
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ summary }),
    };
  } catch (err) {
    console.error(err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI summarization failed' }),
    };
  }
};

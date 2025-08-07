// netlify/functions/summarise.js
const axios = require('axios');
require('dotenv').config({path : '../../.env'});

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // ✅ Allow all origins
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // ✅ CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: 'OK',
    };
  }

  // ✅ Reject anything other than POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Only POST method is allowed' }),
    };
  }

  const { text } = JSON.parse(event.body || '{}');
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!text || !apiKey) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required data' }),
    };
  }

  const prompt = `Summarize in 10-15 words:\n\n${text}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
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
      headers,
      body: JSON.stringify({ summary }),
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate summary' }),
    };
  }
};

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, modelName, apiKey, resumeText, feedback } = body;

    if (!endpoint || !modelName || !resumeText || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      // Handle different API authentication methods
      if (endpoint.includes('anthropic.com')) {
        // Claude API uses x-api-key header
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else {
        // OpenAI and most other APIs use Bearer token
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    // Convert feedback to string format, handling both strings and objects
    const feedbackStrings = Array.isArray(feedback) 
      ? feedback.map(item => {
          if (typeof item === 'string') return item;
          return item?.feedback || item?.text || JSON.stringify(item);
        })
      : [feedback];
    const feedbackText = feedbackStrings.join('\n- ');
    
    const SYSTEM_PROMPT = `You are an expert résumé writer. Given the original résumé and specific feedback points, create an improved version of the résumé that addresses ALL the feedback points while keeping the résumé realistic and professional. 

Instructions:
- Apply each feedback point to improve the résumé
- Keep all existing experience and education factual
- Enhance descriptions, add relevant keywords, and improve formatting
- Make the résumé more compelling for the target role
- Return ONLY the improved résumé text, no additional commentary

Respond with just the improved résumé content.`;

    let payload: any;
    
    if (endpoint.includes('anthropic.com')) {
      // Claude API format
      payload = {
        model: modelName,
        max_tokens: 4000,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `ORIGINAL RÉSUMÉ:\n${resumeText}\n\nFEEDBACK POINTS TO ADDRESS:\n- ${feedbackText}\n\nPlease create an improved version of this résumé that addresses all the feedback points above.`
          }
        ]
      };
    } else {
      // OpenAI and other APIs format
      payload = {
        model: modelName,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `ORIGINAL RÉSUMÉ:\n${resumeText}\n\nFEEDBACK POINTS TO ADDRESS:\n- ${feedbackText}\n\nPlease create an improved version of this résumé that addresses all the feedback points above.`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `API Error (${response.status}): ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle different response formats from various LLM providers
    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      // OpenAI format
      content = data.choices[0].message.content;
    } else if (data.content && data.content[0] && data.content[0].text) {
      // Anthropic format
      content = data.content[0].text;
    } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      // Gemini format
      content = data.candidates[0].content.parts[0].text;
    } else if (typeof data === 'string') {
      // Raw text response
      content = data;
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format from LLM API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      improved_resume: content.trim()
    });
  } catch (error) {
    console.error('Improve API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
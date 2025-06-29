import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, modelName, apiKey, resumeText, jobDescription } = body;

    if (!endpoint || !modelName || !resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const SYSTEM_PROMPT = `You are an expert résumé coach and recruiter. Analyze the following résumé against the job description and provide detailed, actionable feedback points to improve the résumé for this specific job. Be quantitative and specific—point out missing skills, keywords, experience, or achievements. If the résumé is already strong, suggest advanced improvements. Respond ONLY in JSON format: {"feedback": ["point 1", "point 2", "point 3", ...]}`;

    const payload = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `RÉSUMÉ:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nProvide detailed, actionable feedback to improve this résumé for the job.`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    };

    console.log('Making request to LLM endpoint:', endpoint);
    console.log('Request payload:', JSON.stringify(payload, null, 2));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for longer response
    
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - the API endpoint took too long to respond (60s)' },
          { status: 408 }
        );
      }
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
      return NextResponse.json(
        { error: `Network error: ${errorMessage}` },
        { status: 500 }
      );
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('API error response:', error);
      return NextResponse.json(
        { error: `API Error (${response.status}): ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Raw LLM response data:', JSON.stringify(data, null, 2));
    
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
    
    console.log('Extracted content:', content);

    try {
      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      console.log('JSON match found:', jsonMatch ? jsonMatch[0] : 'No JSON found');
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON response:', JSON.stringify(parsedResponse, null, 2));
        
        const feedbackArray = parsedResponse.feedback || [];
        
        console.log('Final feedback to return:', feedbackArray);
        
        return NextResponse.json({
          feedback: feedbackArray
        });
      }
      
      // Fallback: try to extract feedback lines
      const lines = content.split('\n').filter(line => line.trim());
      console.log('Fallback: Using lines as feedback:', lines);
      return NextResponse.json({
        feedback: lines.length > 0 ? lines : ['The AI provided general feedback to improve your résumé.']
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw content that failed to parse:', content);
      // If JSON parsing fails, return the raw content as feedback
      return NextResponse.json({
        feedback: ['The AI provided feedback in a non-structured format: ' + content]
      });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
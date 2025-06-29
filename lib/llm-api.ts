export interface LLMRequest {
  endpoint: string;
  modelName: string;
  apiKey?: string;
  resumeText: string;
  jobDescription: string;
}

export interface LLMResponse {
  feedback: (string | { point?: string; section?: string; feedback?: string; text?: string; message?: string; [key: string]: any })[];
}

export interface ImprovedResumeResponse {
  improved_resume: string;
}

export async function callLLMAPI(request: LLMRequest): Promise<LLMResponse> {
  console.log('Making client request to /api/llm');
  
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: request.endpoint,
        modelName: request.modelName,
        apiKey: request.apiKey,
        resumeText: request.resumeText,
        jobDescription: request.jobDescription,
      }),
    });

    console.log('Client response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API error:', errorData);
      throw new Error(errorData.error || `API Error (${response.status})`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Client API call error:', error);
    throw error;
  }
}

export async function improveResumeAPI(request: LLMRequest & { feedback: (string | { point?: string; section?: string; feedback?: string; text?: string; message?: string; [key: string]: any })[] }): Promise<ImprovedResumeResponse> {
  const response = await fetch('/api/improve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: request.endpoint,
      modelName: request.modelName,
      apiKey: request.apiKey,
      resumeText: request.resumeText,
      feedback: request.feedback,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error (${response.status})`);
  }

  const data = await response.json();
  return data;
} 
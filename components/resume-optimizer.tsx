'use client';

import React, { useState } from 'react';
import { Upload, FileText, Loader2, Download, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { parseFile, validateFileType, getFileTypeLabel } from '@/lib/file-parser';
import { callLLMAPI, improveResumeAPI, type LLMRequest, type LLMResponse, type ImprovedResumeResponse } from '@/lib/llm-api';
import { exportToPDF, exportToDOCX, formatResumeText } from '@/lib/document-export';
import ResumeDisplay from '@/components/resume-display';
import ProfessionalResumeDisplay from '@/components/professional-resume-display';
import { convertTextResumeToStructured } from '@/lib/resume-parser';

interface FormData {
  resumeFile: File | null;
  jobDescription: string;
  apiEndpoint: string;
  modelName: string;
  apiKey: string;
}

interface FormErrors {
  resumeFile?: string;
  jobDescription?: string;
  apiEndpoint?: string;
  modelName?: string;
}

const ResumeOptimizer: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    resumeFile: null,
    jobDescription: '',
    apiEndpoint: '',
    modelName: '',
    apiKey: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<(string | { point?: string; section?: string; feedback?: string; text?: string; message?: string; [key: string]: any })[] | null>(null);
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [useProfessionalView, setUseProfessionalView] = useState(true);

  const validateForm = (): boolean => {
    console.log('Validating form...');
    const newErrors: FormErrors = {};

    if (!formData.resumeFile) {
      console.log('Validation error: No resume file');
      newErrors.resumeFile = 'Please upload your résumé';
    }

    if (!formData.jobDescription.trim()) {
      console.log('Validation error: No job description');
      newErrors.jobDescription = 'Please enter the job description';
    }

    if (!formData.apiEndpoint.trim()) {
      console.log('Validation error: No API endpoint');
      newErrors.apiEndpoint = 'Please enter the API endpoint';
    } else {
      try {
        new URL(formData.apiEndpoint);
      } catch {
        console.log('Validation error: Invalid URL');
        newErrors.apiEndpoint = 'Please enter a valid URL';
      }
    }

    if (!formData.modelName.trim()) {
      console.log('Validation error: No model name');
      newErrors.modelName = 'Please enter the model name';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateFileType(file)) {
        setFormData(prev => ({ ...prev, resumeFile: file }));
        setErrors(prev => ({ ...prev, resumeFile: undefined }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          resumeFile: 'Please upload a PDF, DOCX, or text file' 
        }));
      }
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setErrors({}); // Clear previous errors

    try {
      // Step 1: Parse the résumé file
      console.log('Starting file parsing...');
      setProgress(20);
      const parsedResumeText = await parseFile(formData.resumeFile!);
      console.log('File parsed successfully, length:', parsedResumeText.length);
      setResumeText(parsedResumeText);

      // Step 2: Call the LLM API for feedback only
      console.log('Calling LLM API for feedback...');
      setProgress(50);
      const llmRequest: LLMRequest = {
        endpoint: formData.apiEndpoint,
        modelName: formData.modelName,
        apiKey: formData.apiKey || undefined,
        resumeText: parsedResumeText,
        jobDescription: formData.jobDescription,
      };

      const response = await callLLMAPI(llmRequest);
      console.log('LLM API response received:', response);
      setProgress(90);
      
      if (!response.feedback || response.feedback.length === 0) {
        throw new Error('No feedback received from LLM API');
      }

      // Step 3: Set feedback
      setFeedback(response.feedback);
      setProgress(100);
      console.log('Process completed successfully');
    } catch (error) {
      console.error('Error processing résumé:', error);
      setErrors({
        apiEndpoint: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveResume = async () => {
    if (!feedback || !resumeText) return;

    setIsImproving(true);
    try {
      const improveRequest = {
        endpoint: formData.apiEndpoint,
        modelName: formData.modelName,
        apiKey: formData.apiKey || undefined,
        resumeText: resumeText,
        jobDescription: formData.jobDescription,
        feedback: feedback,
      };

      const response = await improveResumeAPI(improveRequest);
      const formattedResume = formatResumeText(response.improved_resume);
      setImprovedResume(formattedResume);
    } catch (error) {
      console.error('Error improving résumé:', error);
      setErrors({
        apiEndpoint: error instanceof Error ? error.message : 'An unexpected error occurred while improving résumé'
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (improvedResume) {
      exportToPDF(improvedResume);
    }
  };

  const handleDownloadDOCX = () => {
    if (improvedResume) {
      exportToDOCX(improvedResume);
    }
  };

  const resetForm = () => {
    setFormData({
      resumeFile: null,
      jobDescription: '',
      apiEndpoint: '',
      modelName: '',
      apiKey: '',
    });
    setErrors({});
    setFeedback(null);
    setImprovedResume(null);
    setResumeText('');
    setProgress(0);
  };

  // Convert improved resume text to structured format for professional display
  const getStructuredResumeData = () => {
    if (!improvedResume) return null;
    try {
      return convertTextResumeToStructured(improvedResume);
    } catch (error) {
      console.error('Error converting resume to structured format:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job-timus Prime</h1>
          <p className="text-xl text-blue-600 font-semibold mb-2">Transforms Your Career</p>
          <p className="text-lg text-gray-600">
            AI-powered résumé optimization tailored to any job description
          </p>
        </div>

        {!feedback ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Optimize Your Résumé
              </CardTitle>
              <CardDescription>
                Upload your résumé, provide the job description, and configure your LLM settings to get personalized improvement suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="resume-upload">Upload Résumé *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="space-y-2">
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                    <p className="text-sm text-gray-500">
                      PDF, DOCX, and TXT files supported
                    </p>
                    <p className="text-xs text-gray-400">
                      💡 For best results with PDFs, ensure they contain selectable text (not scanned images)
                    </p>
                    {formData.resumeFile && (
                      <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {formData.resumeFile.name} ({getFileTypeLabel(formData.resumeFile)})
                      </p>
                    )}
                  </div>
                </div>
                {errors.resumeFile && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.resumeFile}
                  </p>
                )}
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description *</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  className="min-h-[120px]"
                  value={formData.jobDescription}
                  onChange={handleInputChange('jobDescription')}
                />
                {errors.jobDescription && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.jobDescription}
                  </p>
                )}
              </div>

              {/* LLM Configuration */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">LLM Configuration</h3>
                <p className="text-sm text-gray-600">
                  Supports public and private endpoints, including OpenAI, Anthropic, Gemini, or your own. 
                  Model name is required; API key is optional for public endpoints.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint *</Label>
                    <Input
                      id="api-endpoint"
                      placeholder="https://api.openai.com/v1/chat/completions"
                      value={formData.apiEndpoint}
                      onChange={handleInputChange('apiEndpoint')}
                    />
                    {errors.apiEndpoint && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.apiEndpoint}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-name">Model Name *</Label>
                    <Input
                      id="model-name"
                      placeholder="gpt-4, claude-3-opus, gemini-1.5-pro"
                      value={formData.modelName}
                      onChange={handleInputChange('modelName')}
                    />
                    {errors.modelName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.modelName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Your API key (leave blank for public endpoints)"
                    value={formData.apiKey}
                    onChange={handleInputChange('apiKey')}
                  />
                </div>
              </div>

              {/* Progress */}
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing...</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Button clicked!');
                  handleSubmit();
                }} 
                disabled={isLoading} 
                className="w-full"
                size="lg"
                type="button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing Résumé...
                  </>
                ) : (
                  'Optimize Résumé'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Results */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Feedback Analysis Complete
                  </span>
                  <Button variant="outline" onClick={resetForm}>
                    Start Over
                  </Button>
                </CardTitle>
                <CardDescription>
                  Your résumé has been analyzed. Review the feedback and then improve your résumé.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Actionable Feedback</CardTitle>
                <CardDescription>
                  Specific recommendations to improve your résumé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.map((item, index) => {
                    // Handle both string and object feedback formats
                    let feedbackText: string;
                    
                    console.log('Processing feedback item:', item, 'Type:', typeof item);
                    
                    if (typeof item === 'string') {
                      feedbackText = item;
                    } else if (typeof item === 'object' && item !== null) {
                      // Handle various object formats that LLMs might return
                      feedbackText = (item as any).point || 
                                   (item as any).feedback || 
                                   (item as any).text || 
                                   (item as any).message ||
                                   JSON.stringify(item);
                    } else if (item === null || item === undefined) {
                      feedbackText = 'Empty feedback point';
                    } else {
                      feedbackText = String(item);
                    }
                    
                    // Final safety check - ensure we have a string
                    if (typeof feedbackText !== 'string') {
                      feedbackText = JSON.stringify(feedbackText);
                    }
                    
                    console.log('Final feedback text:', feedbackText);
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{feedbackText}</p>
                      </div>
                    );
                  })}
                </div>
                
                {/* Improve Resume Button */}
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={handleImproveResume} 
                    disabled={isImproving} 
                    className="w-full"
                    size="lg"
                  >
                    {isImproving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Improving Résumé...
                      </>
                    ) : (
                      'Improve These Feedback Points and Update My Résumé'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Improved Resume - Beautiful Display */}
            {improvedResume && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Your Professional Résumé
                    </span>
                    <div className="flex gap-2 items-center">
                      {/* View Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUseProfessionalView(!useProfessionalView)}
                        className="flex items-center gap-2"
                      >
                        {useProfessionalView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {useProfessionalView ? 'Simple View' : 'Professional View'}
                      </Button>
                      
                      {/* Download Buttons */}
                      <Button variant="outline" size="sm" onClick={handleDownloadDOCX}>
                        <Download className="h-4 w-4 mr-2" />
                        DOCX
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Your optimized résumé with professional formatting and all feedback points addressed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {useProfessionalView && getStructuredResumeData() ? (
                    <ProfessionalResumeDisplay 
                      resumeData={getStructuredResumeData()!}
                      showDownloadButtons={false}
                    />
                  ) : (
                    <ResumeDisplay content={improvedResume} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimizer; 
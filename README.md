# AI Resume Optimizer

A production-ready web application for optimizing resumes using any LLM API endpoint. Upload your resume, provide a job description, and get AI-powered feedback with an improved resume tailored to your target position.

## Features

- **File Upload Support**: Upload resumes in PDF, DOCX, or plain text format
- **Universal LLM Integration**: Works with any LLM API (OpenAI, Anthropic, Gemini, custom endpoints)
- **Intelligent Parsing**: Extracts text from PDF and DOCX files automatically
- **Actionable Feedback**: Provides detailed, quantitative suggestions for improvement
- **Document Export**: Download improved resumes in both PDF and DOCX formats
- **Modern UI**: Beautiful, responsive design with Tailwind CSS and shadcn/ui
- **Production Ready**: Optimized for deployment on Vercel, Netlify, or any hosting platform

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **File Processing**: pdf-parse, mammoth
- **Document Export**: jsPDF, docx
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-optimizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Resume**: Choose a PDF, DOCX, or text file containing your resume
2. **Job Description**: Paste the job description you want to target
3. **Configure LLM**: 
   - Enter your LLM API endpoint (e.g., `https://api.openai.com/v1/chat/completions`)
   - Specify the model name (e.g., `gpt-4`, `claude-3-opus`, `gemini-1.5-pro`)
   - Optionally provide an API key (required for most commercial APIs)
4. **Optimize**: Click "Optimize Resume" to get AI-powered improvements
5. **Download**: Export your improved resume in PDF or DOCX format

## API Compatibility

The application works with any LLM API that accepts chat/completion requests. Tested with:

- **OpenAI**: `https://api.openai.com/v1/chat/completions`
- **Anthropic**: `https://api.anthropic.com/v1/messages`
- **Google Gemini**: `https://generativelanguage.googleapis.com/v1beta/models/MODEL_NAME:generateContent`
- **Custom APIs**: Any endpoint following OpenAI-compatible format

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

### Netlify

1. Build the app: `npm run build`
2. Deploy the `out` folder to Netlify

### Docker

```bash
docker build -t resume-optimizer .
docker run -p 3000:3000 resume-optimizer
```

## Environment Variables

No environment variables are required. All configuration is done through the UI.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

- API keys are handled client-side and never stored
- File processing happens in the browser
- No data is sent to any servers except the LLM API you specify

## Support

For issues, questions, or contributions, please open an issue on GitHub. 
# Build Job-timus Prime: AI Resume Optimizer Web App

Create a complete Next.js 14 web application called "Job-timus Prime" with TypeScript, Tailwind CSS, and shadcn/ui components. This is a resume optimization tool that uses AI to improve resumes for specific job applications.

## Core Features Required:

**1. Resume Input System:**
- File upload for DOCX and TXT files (use mammoth for DOCX parsing)
- Alternative manual text input option with large textarea
- Toggle between file upload and manual input
- File validation and error handling

**2. Job Description Input:**
- Large textarea for pasting job descriptions
- Character counter and validation
- Required field validation

**3. LLM Configuration Panel:**
- API endpoint input field (for any OpenAI-compatible API)
- Model name input (free text, not dropdown)
- Optional API key input (password field with clear "optional" labeling)
- Support for both public endpoints (no auth) and private APIs (with keys)
- Test connection functionality

**4. Two-Step AI Processing:**
- Step 1: Analyze resume against job description, return structured feedback
- Step 2: Generate improved resume based on feedback
- Progress indicators during processing
- Error handling for API failures

**5. Results Display:**
- Show numbered feedback points in styled cards
- Display improved resume in formatted text area
- Download options for PDF and DOCX formats
- Side-by-side comparison capability

**6. Document Export:**
- PDF generation using jsPDF
- DOCX generation using docx library
- File-saver for downloads
- Proper formatting preservation

## Technical Requirements:

**Framework:** Next.js 14 with App Router
**Styling:** Tailwind CSS with custom blue/transformer theme
**UI Components:** shadcn/ui (Button, Card, Input, Textarea, Label, Progress, Toast)
**File Processing:** mammoth for DOCX, standard File API for TXT
**API Integration:** Flexible to work with OpenAI, Anthropic, Gemini, or custom endpoints
**State Management:** React useState hooks
**Error Handling:** Comprehensive validation and user feedback

## Design Requirements:

**Theme:** "Job-timus Prime" - Transformer-inspired career transformation
**Colors:** Blue gradient background, professional color scheme
**Layout:** Single-page application with card-based sections
**Responsive:** Mobile-friendly design
**Accessibility:** Proper ARIA labels and keyboard navigation

## API Route Structure:

Create two API routes:
- `/api/llm` - For initial resume analysis and feedback
- `/api/improve` - For generating improved resume

Both routes should:
- Accept endpoint, modelName, optional apiKey, resumeText, jobDescription
- Handle different LLM response formats (OpenAI, Anthropic, Gemini)
- Include proper error handling and timeouts
- Return structured JSON responses

## User Flow:

1. User chooses file upload or manual input for resume
2. User pastes job description
3. User configures LLM settings (endpoint, model, optional API key)
4. Click "Optimize Resume" → Get AI feedback
5. Review feedback points
6. Click "Apply Feedback" → Get improved resume
7. Download PDF or DOCX of improved resume
8. Option to start over with new resume/job

## Key Features:

- **Universal LLM Support:** Works with any OpenAI-compatible API
- **Optional Authentication:** Public endpoints supported, API keys optional
- **Flexible Model Selection:** User specifies exact model name
- **Professional Export:** High-quality PDF and DOCX downloads
- **Error Recovery:** Graceful handling of API failures and file parsing errors
- **Modern UX:** Loading states, progress bars, toast notifications

## Branding:

Use "Job-timus Prime" throughout with tagline "Transforms Your Career"
Include transformer/robot theme elements in design
Professional yet playful tone
Blue color scheme with gradient backgrounds

Build this as a complete, production-ready application with all features fully functional. Focus on creating a smooth user experience that guides users through the resume optimization process step by step.
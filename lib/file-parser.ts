import mammoth from 'mammoth';

export async function parseFile(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('File parsing must be done on the client side');
  }

  const arrayBuffer = await file.arrayBuffer();
  
  if (file.type === 'application/pdf') {
    // Use the legacy build of pdfjs-dist for better browser compatibility
    try {
      const pdfjs = await import('pdfjs-dist');
      
      // Set worker source - use local worker to avoid CORS issues
      pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';
      
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        verbosity: 0, // Reduce console output
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      const result = fullText.trim();
      if (!result) {
        throw new Error('No text could be extracted from this PDF. It might be a scanned document or image-based PDF.');
      }
      
      return result;
    } catch (error) {
      console.error('PDF parsing error:', error);
      if (error instanceof Error && error.message.includes('No text could be extracted')) {
        throw error;
      }
      throw new Error('Failed to parse PDF file. This might be a scanned document or password-protected PDF. Please try converting it to text or DOCX format.');
    }
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX file. Please check the file format.');
    }
  } else if (file.type === 'text/plain') {
    return new TextDecoder().decode(arrayBuffer);
  } else {
    throw new Error(`Unsupported file type: ${file.type}. Please use PDF, DOCX, or TXT files.`);
  }
}

export function validateFileType(file: File): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return supportedTypes.includes(file.type);
}

export function getFileTypeLabel(file: File): string {
  switch (file.type) {
    case 'application/pdf':
      return 'PDF';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'text/plain':
      return 'Text';
    default:
      return 'Unknown';
  }
} 
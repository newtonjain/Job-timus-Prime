import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeSection {
  title: string;
  content: string[];
}

function parseResumeContent(content: string): ResumeSection[] {
  const lines = content.split('\n').filter(line => line.trim());
  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a section header
    const isHeader = /^[A-Z\s]{3,}$/.test(trimmedLine) || 
                    /^(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL SKILLS|PROJECTS|CERTIFICATIONS|CONTACT|PERSONAL INFORMATION|ACHIEVEMENTS|AWARDS)/i.test(trimmedLine) ||
                    (trimmedLine.length > 0 && trimmedLine === trimmedLine.toUpperCase() && !trimmedLine.includes('@') && !trimmedLine.match(/\d{4}-\d{4}/) && trimmedLine.length < 50);
    
    if (isHeader) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = { title: trimmedLine, content: [] };
    } else if (currentSection && trimmedLine) {
      currentSection.content.push(trimmedLine);
    } else if (!currentSection && trimmedLine) {
      // Content before first header - create a summary section
      if (sections.length === 0) {
        currentSection = { title: 'PROFESSIONAL SUMMARY', content: [trimmedLine] };
      }
    }
  }
  
  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

export async function exportToPDF(content: string, filename: string = 'improved-resume.pdf') {
  const doc = new jsPDF();
  const sections = parseResumeContent(content);
  
  // Page setup
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  
  // Colors
  const primaryColor = [51, 51, 51]; // Dark gray for text
  const accentColor = [59, 130, 246]; // Blue for headers
  const lightGray = [128, 128, 128]; // Light gray for secondary text
  
  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };
  
  // Helper function to add a styled header
  const addHeader = (text: string) => {
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(text, margin, yPosition);
    yPosition += 8;
    
    // Add underline
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, margin + doc.getTextWidth(text), yPosition);
    yPosition += 8;
  };
  
  // Helper function to add body text
  const addBodyText = (text: string, isBullet: boolean = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    const prefix = isBullet ? '• ' : '';
    const textWidth = maxWidth - (isBullet ? 10 : 0);
    const lines = doc.splitTextToSize(prefix + text, textWidth);
    
    checkPageBreak(lines.length * 5);
    
    for (let i = 0; i < lines.length; i++) {
      const x = isBullet && i === 0 ? margin : (isBullet ? margin + 10 : margin);
      doc.text(lines[i], x, yPosition);
      yPosition += 5;
    }
    yPosition += 2; // Extra spacing between items
  };
  
  // Add title if first section looks like a name
  if (sections.length > 0 && sections[0].content.length > 0) {
    const firstLine = sections[0].content[0];
    if (firstLine.split(' ').length <= 4 && !firstLine.includes('@')) {
      // This looks like a name
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(firstLine, margin, yPosition);
      yPosition += 15;
      
      // Add contact info on the same line if available
      if (sections[0].content.length > 1) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        const contactInfo = sections[0].content.slice(1).join(' | ');
        doc.text(contactInfo, margin, yPosition);
        yPosition += 12;
      }
      
      // Skip the first section since we used it for header
      sections.shift();
    }
  }
  
  // Process sections
  for (const section of sections) {
    addHeader(section.title);
    
    for (const item of section.content) {
      // Determine if this should be a bullet point
      const isBullet = section.title.toLowerCase().includes('skill') || 
                      item.startsWith('•') || 
                      item.startsWith('-') || 
                      item.startsWith('*') ||
                      (section.content.length > 1 && !item.includes(' - ') && !item.match(/\d{4}/));
      
      const cleanItem = item.replace(/^[•\-*]\s*/, ''); // Remove existing bullets
      addBodyText(cleanItem, isBullet);
    }
    
    yPosition += 5; // Extra space between sections
  }
  
  doc.save(filename);
}

export async function exportToDOCX(content: string, filename: string = 'improved-resume.docx') {
  const sections = parseResumeContent(content);
  const children: any[] = [];
  
  // Extract name and contact info from first section if applicable
  let nameSection: ResumeSection | null = null;
  let sectionsToProcess = sections;
  
  if (sections.length > 0 && sections[0].content.length > 0) {
    const firstLine = sections[0].content[0];
    if (firstLine.split(' ').length <= 4 && !firstLine.includes('@')) {
      nameSection = sections[0];
      sectionsToProcess = sections.slice(1);
    }
  }
  
  // Add name header
  if (nameSection) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: nameSection.content[0],
            bold: true,
            size: 32,
            color: '3B82F6',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    
    // Add contact information
    if (nameSection.content.length > 1) {
      const contactInfo = nameSection.content.slice(1).join(' | ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo,
              size: 20,
              color: '6B7280',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }
  }
  
  // Process remaining sections
  for (const section of sectionsToProcess) {
    // Add section header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 24,
            color: '3B82F6',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: {
          bottom: {
            color: '3B82F6',
            space: 1,
            style: 'single',
            size: 4,
          },
        },
      })
    );
    
    // Add section content
    for (const item of section.content) {
      const cleanItem = item.replace(/^[•\-*]\s*/, ''); // Remove existing bullets
      
      // Determine formatting based on content
      const isSkillsSection = section.title.toLowerCase().includes('skill');
      const isExperienceItem = item.includes(' - ') || item.match(/\d{4}/);
      
      if (isSkillsSection) {
        // Skills as bullet points
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanItem,
                size: 22,
              }),
            ],
            bullet: {
              level: 0,
            },
            spacing: { after: 100 },
          })
        );
      } else if (isExperienceItem) {
        // Experience items with proper formatting
        const parts = cleanItem.split(' - ');
        if (parts.length >= 2) {
          // Job title and company
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: parts[0],
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: parts.length > 1 ? ` - ${parts.slice(1).join(' - ')}` : '',
                  size: 22,
                  color: '6B7280',
                }),
              ],
              spacing: { after: 100 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanItem,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      } else {
        // Regular content
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanItem,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }
    
    // Add extra spacing between sections
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { after: 200 },
      })
    );
  }
  
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,  // 0.5 inch
              bottom: 720, // 0.5 inch
              left: 720,   // 0.5 inch
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
          },
          paragraph: {
            spacing: { line: 276 }, // 1.15 line spacing
          },
        },
      },
    },
  });
  
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  
  saveAs(blob, filename);
}

export function formatResumeText(text: string): string {
  // Basic formatting improvements
  return text
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/^\s+/gm, '') // Remove leading whitespace
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .trim();
} 
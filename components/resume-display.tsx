import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumeSection {
  title: string;
  content: string[];
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github: string;
}

function parseResumeContent(content: string): { personalInfo: PersonalInfo; sections: ResumeSection[] } {
  const lines = content.split('\n').filter(line => line.trim());
  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  
  // Initialize personal info
  const personalInfo: PersonalInfo = {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    github: ''
  };

  // Extract personal information from first few lines
  let contentStartIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    
    if (!personalInfo.name && line.length > 0 && line.length < 50 && 
        /^[A-Za-z\s.'-]+$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
      personalInfo.name = line;
      contentStartIndex = i + 1;
    } else if (!personalInfo.title && personalInfo.name && line.length > 0 && line.length < 100 &&
               !line.includes('@') && !line.includes('(') && !line.includes('+')) {
      personalInfo.title = line;
      contentStartIndex = i + 1;
    } else if (line.includes('@') && !personalInfo.email) {
      personalInfo.email = line.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
    } else if (line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) && !personalInfo.phone) {
      personalInfo.phone = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || '';
    } else if ((line.toLowerCase().includes('linkedin') || line.includes('linkedin.com')) && !personalInfo.linkedin) {
      personalInfo.linkedin = line;
    } else if ((line.toLowerCase().includes('github') || line.includes('github.com')) && !personalInfo.github) {
      personalInfo.github = line;
    } else if (!personalInfo.location && (line.includes(',') || line.match(/\b[A-Z]{2}\b/))) {
      personalInfo.location = line;
    }
  }

  // Process remaining content into sections
  for (let i = contentStartIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if line is a section header
    const isHeader = /^[A-Z\s]{3,}$/.test(trimmedLine) || 
                    /^(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL SKILLS|PROJECTS|CERTIFICATIONS|CONTACT|PERSONAL INFORMATION|ACHIEVEMENTS|AWARDS)/i.test(trimmedLine) ||
                    (trimmedLine.length > 0 && trimmedLine === trimmedLine.toUpperCase() && 
                     !trimmedLine.includes('@') && !trimmedLine.match(/\d{4}-\d{4}/) && 
                     trimmedLine.length < 50 && trimmedLine.length > 2);
    
    if (isHeader) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = { title: trimmedLine, content: [] };
    } else if (currentSection && trimmedLine) {
      currentSection.content.push(trimmedLine);
    } else if (!currentSection && trimmedLine && trimmedLine.length > 20) {
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
  
  return { personalInfo, sections };
}

interface ResumeDisplayProps {
  content: string;
}

const ResumeDisplay: React.FC<ResumeDisplayProps> = ({ content }) => {
  const { personalInfo, sections } = parseResumeContent(content);

  // Split sections into main content and sidebar content
  const sidebarSections = sections.filter(section => 
    section.title.toLowerCase().includes('skill') ||
    section.title.toLowerCase().includes('certification') ||
    section.title.toLowerCase().includes('language') ||
    section.title.toLowerCase().includes('software') ||
    section.title.toLowerCase().includes('tool')
  );

  const mainSections = sections.filter(section => 
    !section.title.toLowerCase().includes('skill') &&
    !section.title.toLowerCase().includes('certification') &&
    !section.title.toLowerCase().includes('language') &&
    !section.title.toLowerCase().includes('software') &&
    !section.title.toLowerCase().includes('tool')
  );

  const ContactItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
    text ? (
      <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
        <span className="text-white/70">{icon}</span>
        <span className="break-all">{text}</span>
      </div>
    ) : null
  );

  const SectionHeader: React.FC<{ title: string; isMain?: boolean }> = ({ title, isMain = false }) => (
    <h2 className={`font-bold mb-3 ${
      isMain 
        ? 'text-2xl text-blue-600 border-b-2 border-blue-600 pb-2' 
        : 'text-lg text-white uppercase tracking-wide'
    }`}>
      {title}
    </h2>
  );

  const ExperienceItem: React.FC<{ item: string }> = ({ item }) => {
    // Check if this looks like a job title with company
    const jobMatch = item.match(/^(.+?)\s*[-–]\s*(.+?)(?:\s*\|\s*(.+?))?(?:\s*\|\s*(.+?))?$/);
    if (jobMatch) {
      const [, title, company, location, dates] = jobMatch;
      return (
        <div className="mb-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-lg text-gray-800">{title.trim()}</h3>
            {dates && <span className="text-sm text-gray-600">{dates.trim()}</span>}
          </div>
          <div className="text-blue-600 font-medium mb-2">
            {company.trim()}{location && ` • ${location.trim()}`}
          </div>
        </div>
      );
    }
    
    // Regular content item
    return (
      <div className="mb-2">
        <p className="text-gray-700 leading-relaxed">{item}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
      <div className="flex min-h-[800px]">
        {/* Sidebar */}
        <div className="w-1/3 bg-gradient-to-b from-blue-600 to-blue-800 p-6 text-white">
          {/* Personal Info */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-white">
              {personalInfo.name || 'Your Name'}
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              {personalInfo.title || 'Professional Title'}
            </p>
            
            <div className="space-y-1">
              <ContactItem icon={<Mail size={16} />} text={personalInfo.email} />
              <ContactItem icon={<Phone size={16} />} text={personalInfo.phone} />
              <ContactItem icon={<MapPin size={16} />} text={personalInfo.location} />
              <ContactItem icon={<Linkedin size={16} />} text={personalInfo.linkedin} />
              <ContactItem icon={<Github size={16} />} text={personalInfo.github} />
              <ContactItem icon={<Globe size={16} />} text={personalInfo.website} />
            </div>
          </div>

          {/* Sidebar Sections */}
          {sidebarSections.map((section, index) => (
            <div key={index} className="mb-6">
              <SectionHeader title={section.title} />
              <div className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="text-white/90 text-sm leading-relaxed">
                    {section.title.toLowerCase().includes('skill') ? (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <span>{item.replace(/^[•\-*]\s*/, '')}</span>
                      </div>
                    ) : (
                      <p className="mb-2">{item}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8">
          {mainSections.map((section, index) => (
            <div key={index} className="mb-8">
              <SectionHeader title={section.title} isMain={true} />
              <div className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {section.title.toLowerCase().includes('experience') || 
                     section.title.toLowerCase().includes('employment') || 
                     section.title.toLowerCase().includes('work') ? (
                      <ExperienceItem item={item} />
                    ) : section.title.toLowerCase().includes('education') ? (
                      <div className="mb-4">
                        <div className="font-semibold text-gray-800 mb-1">
                          {item.replace(/^[•\-*]\s*/, '')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 leading-relaxed mb-3">
                        {item.startsWith('•') || item.startsWith('-') || item.startsWith('*') ? (
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{item.replace(/^[•\-*]\s*/, '')}</span>
                          </div>
                        ) : (
                          <p>{item}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeDisplay; 
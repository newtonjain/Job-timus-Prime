import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exportToPDF, exportToDOCX } from '@/lib/document-export';

// TypeScript interfaces for structured resume data
export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description?: string;
  achievements?: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
  coursework?: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects?: ProjectItem[];
  certifications?: string[];
  languages?: string[];
}

interface ProfessionalResumeDisplayProps {
  resumeData: ResumeData;
  className?: string;
  showDownloadButtons?: boolean;
}

const ProfessionalResumeDisplay: React.FC<ProfessionalResumeDisplayProps> = ({
  resumeData,
  className = '',
  showDownloadButtons = true,
}) => {
  // Convert structured data to text format for existing export functions
  const convertToTextFormat = (data: ResumeData): string => {
    let text = `${data.name}\n${data.title}\n\n`;
    
    // Contact info
    if (data.contact.email) text += `${data.contact.email}\n`;
    if (data.contact.phone) text += `${data.contact.phone}\n`;
    if (data.contact.location) text += `${data.contact.location}\n`;
    if (data.contact.linkedin) text += `${data.contact.linkedin}\n`;
    if (data.contact.github) text += `${data.contact.github}\n`;
    if (data.contact.website) text += `${data.contact.website}\n`;
    
    // Summary
    if (data.summary) {
      text += `\nPROFESSIONAL SUMMARY\n${data.summary}\n`;
    }
    
    // Experience
    if (data.experience.length > 0) {
      text += `\nWORK EXPERIENCE\n`;
      data.experience.forEach(exp => {
        text += `${exp.title} - ${exp.company}`;
        if (exp.location) text += ` | ${exp.location}`;
        text += ` | ${exp.startDate} - ${exp.endDate}\n`;
        if (exp.description) text += `${exp.description}\n`;
        if (exp.achievements) {
          exp.achievements.forEach(achievement => {
            text += `• ${achievement}\n`;
          });
        }
        text += '\n';
      });
    }
    
    // Education
    if (data.education.length > 0) {
      text += `\nEDUCATION\n`;
      data.education.forEach(edu => {
        text += `${edu.degree} - ${edu.institution}`;
        if (edu.location) text += ` | ${edu.location}`;
        text += ` | ${edu.graduationDate}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        if (edu.honors) text += `${edu.honors}\n`;
        if (edu.coursework) {
          text += `Relevant Coursework: ${edu.coursework.join(', ')}\n`;
        }
        text += '\n';
      });
    }
    
    // Skills
    if (data.skills.length > 0) {
      text += `\nSKILLS\n`;
      data.skills.forEach(skill => {
        text += `• ${skill}\n`;
      });
      text += '\n';
    }
    
    // Projects
    if (data.projects && data.projects.length > 0) {
      text += `\nPROJECTS\n`;
      data.projects.forEach(project => {
        text += `${project.name}\n`;
        text += `${project.description}\n`;
        if (project.technologies) {
          text += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        if (project.link) text += `Link: ${project.link}\n`;
        text += '\n';
      });
    }
    
    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      text += `\nCERTIFICATIONS\n`;
      data.certifications.forEach(cert => {
        text += `• ${cert}\n`;
      });
    }
    
    return text;
  };

  const handleDownloadPDF = () => {
    const textFormat = convertToTextFormat(resumeData);
    exportToPDF(textFormat, `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  const handleDownloadDOCX = () => {
    const textFormat = convertToTextFormat(resumeData);
    exportToDOCX(textFormat, `${resumeData.name.replace(/\s+/g, '_')}_Resume.docx`);
  };

  const ContactItem: React.FC<{ icon: React.ReactNode; text: string; href?: string }> = ({ 
    icon, 
    text, 
    href 
  }) => (
    text ? (
      <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
        <span className="text-white/70 flex-shrink-0">{icon}</span>
        {href ? (
          <a href={href} className="break-all hover:text-white transition-colors">
            {text}
          </a>
        ) : (
          <span className="break-all">{text}</span>
        )}
      </div>
    ) : null
  );

  const SectionHeader: React.FC<{ title: string; isMain?: boolean }> = ({ title, isMain = false }) => (
    <h2 className={`font-bold mb-4 ${
      isMain 
        ? 'text-2xl text-blue-600 border-b-2 border-blue-600 pb-2 uppercase tracking-wide' 
        : 'text-lg text-white uppercase tracking-wide'
    }`}>
      {title}
    </h2>
  );

  const ExperienceItemComponent: React.FC<{ experience: ExperienceItem }> = ({ experience }) => (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{experience.title}</h3>
          <div className="text-blue-600 font-semibold">
            {experience.company}
            {experience.location && ` • ${experience.location}`}
          </div>
        </div>
        <div className="text-sm text-gray-600 flex-shrink-0 ml-4">
          {experience.startDate} - {experience.endDate}
        </div>
      </div>
      {experience.description && (
        <p className="text-gray-700 mb-2 leading-relaxed">{experience.description}</p>
      )}
      {experience.achievements && (
        <ul className="space-y-1">
          {experience.achievements.map((achievement, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span className="leading-relaxed">{achievement}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const EducationItemComponent: React.FC<{ education: EducationItem }> = ({ education }) => (
    <div className="mb-4">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="font-semibold text-gray-800">{education.degree}</h3>
          <div className="text-blue-600 font-medium">
            {education.institution}
            {education.location && ` • ${education.location}`}
          </div>
        </div>
        <div className="text-sm text-gray-600 flex-shrink-0 ml-4">
          {education.graduationDate}
        </div>
      </div>
      {education.gpa && (
        <p className="text-sm text-gray-600">GPA: {education.gpa}</p>
      )}
      {education.honors && (
        <p className="text-sm text-gray-700 italic">{education.honors}</p>
      )}
      {education.coursework && (
        <p className="text-sm text-gray-700">
          <span className="font-medium">Relevant Coursework:</span> {education.coursework.join(', ')}
        </p>
      )}
    </div>
  );

  const ProjectItemComponent: React.FC<{ project: ProjectItem }> = ({ project }) => (
    <div className="mb-4">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-800">{project.name}</h3>
        {project.link && (
          <a 
            href={project.link} 
            className="text-blue-600 hover:text-blue-800 text-sm flex-shrink-0 ml-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Project
          </a>
        )}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
      {project.technologies && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
        </p>
      )}
    </div>
  );

  return (
    <div className={`font-sans ${className}`}>
      {/* Download Buttons */}
      {showDownloadButtons && (
        <div className="flex gap-2 mb-6 justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadDOCX}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Download DOCX
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      )}

      {/* Resume Display */}
      <Card className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex min-h-[800px]">
            {/* Left Sidebar */}
            <div className="w-1/3 bg-gradient-to-b from-blue-600 to-blue-800 p-8 text-white">
              {/* Personal Info */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-white leading-tight">
                  {resumeData.name}
                </h1>
                <p className="text-blue-100 text-xl mb-6 leading-relaxed">
                  {resumeData.title}
                </p>
                
                <div className="space-y-1">
                  <ContactItem 
                    icon={<Mail size={16} />} 
                    text={resumeData.contact.email || ''} 
                    href={resumeData.contact.email ? `mailto:${resumeData.contact.email}` : undefined}
                  />
                  <ContactItem 
                    icon={<Phone size={16} />} 
                    text={resumeData.contact.phone || ''} 
                    href={resumeData.contact.phone ? `tel:${resumeData.contact.phone}` : undefined}
                  />
                  <ContactItem 
                    icon={<MapPin size={16} />} 
                    text={resumeData.contact.location || ''} 
                  />
                  <ContactItem 
                    icon={<Linkedin size={16} />} 
                    text={resumeData.contact.linkedin || ''} 
                    href={resumeData.contact.linkedin}
                  />
                  <ContactItem 
                    icon={<Github size={16} />} 
                    text={resumeData.contact.github || ''} 
                    href={resumeData.contact.github}
                  />
                  <ContactItem 
                    icon={<Globe size={16} />} 
                    text={resumeData.contact.website || ''} 
                    href={resumeData.contact.website}
                  />
                </div>
              </div>

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Skills" />
                  <div className="space-y-2">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                        <div className="w-2 h-2 bg-white/60 rounded-full flex-shrink-0"></div>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {resumeData.languages && resumeData.languages.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Languages" />
                  <div className="space-y-2">
                    {resumeData.languages.map((language, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                        <div className="w-2 h-2 bg-white/60 rounded-full flex-shrink-0"></div>
                        <span>{language}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resumeData.certifications && resumeData.certifications.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Certifications" />
                  <div className="space-y-2">
                    {resumeData.certifications.map((cert, index) => (
                      <div key={index} className="text-white/90 text-sm leading-relaxed">
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Main Content */}
            <div className="w-2/3 p-8">
              {/* Professional Summary */}
              {resumeData.summary && (
                <div className="mb-8">
                  <SectionHeader title="Professional Summary" isMain={true} />
                  <p className="text-gray-700 leading-relaxed text-justify">
                    {resumeData.summary}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Work Experience" isMain={true} />
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <ExperienceItemComponent key={index} experience={exp} />
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Education" isMain={true} />
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <EducationItemComponent key={index} education={edu} />
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Projects" isMain={true} />
                  <div className="space-y-4">
                    {resumeData.projects.map((project, index) => (
                      <ProjectItemComponent key={index} project={project} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalResumeDisplay; 
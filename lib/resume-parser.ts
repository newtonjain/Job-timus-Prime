import { ResumeData, ContactInfo, ExperienceItem, EducationItem, ProjectItem } from '@/components/professional-resume-display';

/**
 * Parses unstructured resume text into structured ResumeData format
 * This function can handle text output from AI resume generators
 */
export function parseResumeText(text: string): ResumeData {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Initialize result with defaults
  const result: ResumeData = {
    name: '',
    title: '',
    contact: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: []
  };

  let currentSection = '';
  let currentItem: any = null;
  let nameFound = false;
  let titleFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Try to identify name (usually first non-empty line)
    if (!nameFound && line.length > 0 && line.length < 50 && 
        /^[A-Za-z\s.'-]+$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4 &&
        !line.includes('@') && !line.includes('(') && !line.includes('+')) {
      result.name = line;
      nameFound = true;
      continue;
    }

    // Try to identify title (usually second line after name)
    if (nameFound && !titleFound && line.length > 0 && line.length < 100 &&
        !line.includes('@') && !line.includes('(') && !line.includes('+') &&
        !isHeaderLine(line)) {
      result.title = line;
      titleFound = true;
      continue;
    }

    // Extract contact information
    if (line.includes('@') && !result.contact.email) {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) result.contact.email = emailMatch[0];
    }

    if (line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) && !result.contact.phone) {
      const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) result.contact.phone = phoneMatch[0];
    }

    if ((line.toLowerCase().includes('linkedin') || line.includes('linkedin.com')) && !result.contact.linkedin) {
      result.contact.linkedin = line;
    }

    if ((line.toLowerCase().includes('github') || line.includes('github.com')) && !result.contact.github) {
      result.contact.github = line;
    }

    if (!result.contact.location && (line.includes(',') || line.match(/\b[A-Z]{2}\b/)) && 
        !line.includes('@') && !line.includes('linkedin') && !line.includes('github')) {
      result.contact.location = line;
    }

    // Check if line is a section header
    if (isHeaderLine(line)) {
      // Save previous section content
      if (currentSection && currentItem) {
        saveCurrentItem(result, currentSection, currentItem);
        currentItem = null;
      }

      currentSection = normalizeSection(line);
      continue;
    }

    // Process content based on current section
    if (currentSection) {
      processLineForSection(result, currentSection, line, currentItem);
    }
  }

  // Don't forget to save the last item
  if (currentSection && currentItem) {
    saveCurrentItem(result, currentSection, currentItem);
  }

  return result;
}

function isHeaderLine(line: string): boolean {
  const upperLine = line.toUpperCase();
  return /^[A-Z\s]{3,}$/.test(line) || 
         /^(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL SKILLS|PROJECTS|CERTIFICATIONS|CONTACT|PERSONAL INFORMATION|ACHIEVEMENTS|AWARDS|LANGUAGES)/i.test(line) ||
         (line.length > 0 && line === upperLine && 
          !line.includes('@') && !line.match(/\d{4}-\d{4}/) && 
          line.length < 50 && line.length > 2);
}

function normalizeSection(line: string): string {
  const normalized = line.toUpperCase().trim();
  
  if (normalized.includes('SUMMARY') || normalized.includes('OBJECTIVE')) {
    return 'SUMMARY';
  }
  if (normalized.includes('EXPERIENCE') || normalized.includes('EMPLOYMENT') || normalized.includes('WORK')) {
    return 'EXPERIENCE';
  }
  if (normalized.includes('EDUCATION')) {
    return 'EDUCATION';
  }
  if (normalized.includes('SKILL')) {
    return 'SKILLS';
  }
  if (normalized.includes('PROJECT')) {
    return 'PROJECTS';
  }
  if (normalized.includes('CERTIFICATION') || normalized.includes('CERTIFICATE')) {
    return 'CERTIFICATIONS';
  }
  if (normalized.includes('LANGUAGE')) {
    return 'LANGUAGES';
  }
  
  return normalized;
}

function processLineForSection(result: ResumeData, section: string, line: string, currentItem: any) {
  switch (section) {
    case 'SUMMARY':
      if (result.summary) {
        result.summary += ' ' + line;
      } else {
        result.summary = line;
      }
      break;

    case 'EXPERIENCE':
      processExperienceSection(result, line);
      break;

    case 'EDUCATION':
      processEducationSection(result, line);
      break;

    case 'SKILLS':
      const cleanSkill = line.replace(/^[•\-*]\s*/, '');
      if (cleanSkill) {
        result.skills.push(cleanSkill);
      }
      break;

    case 'PROJECTS':
      processProjectsSection(result, line);
      break;

    case 'CERTIFICATIONS':
      const cleanCert = line.replace(/^[•\-*]\s*/, '');
      if (cleanCert) {
        result.certifications?.push(cleanCert);
      }
      break;

    case 'LANGUAGES':
      const cleanLang = line.replace(/^[•\-*]\s*/, '');
      if (cleanLang) {
        result.languages?.push(cleanLang);
      }
      break;
  }
}

function processExperienceSection(result: ResumeData, line: string) {
  // Check if this looks like a job title/company line
  const jobMatch = line.match(/^(.+?)\s*[-–|]\s*(.+?)(?:\s*[-–|]\s*(.+?))?(?:\s*[-–|]\s*(.+?))?$/);
  
  if (jobMatch && (line.includes('20') || line.includes('Present') || line.includes('Current'))) {
    // This looks like a new job entry
    const [, title, company, location, dates] = jobMatch;
    
    const newExp: ExperienceItem = {
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || '',
      startDate: extractStartDate(dates || ''),
      endDate: extractEndDate(dates || ''),
      achievements: []
    };
    
    result.experience.push(newExp);
  } else if (result.experience.length > 0) {
    // Add as achievement to the last experience
    const cleanLine = line.replace(/^[•\-*]\s*/, '');
    if (cleanLine) {
      const lastExp = result.experience[result.experience.length - 1];
      if (!lastExp.achievements) lastExp.achievements = [];
      lastExp.achievements.push(cleanLine);
    }
  }
}

function processEducationSection(result: ResumeData, line: string) {
  // Check if this looks like a degree line
  if (line.includes('Bachelor') || line.includes('Master') || line.includes('PhD') || line.includes('Associate') ||
      line.includes('University') || line.includes('College') || line.includes('Institute')) {
    
    const parts = line.split(/[-–|]/).map(p => p.trim());
    
    const newEdu: EducationItem = {
      degree: parts[0] || '',
      institution: parts[1] || '',
      location: parts[2] || '',
      graduationDate: extractGraduationDate(line)
    };
    
    result.education.push(newEdu);
  } else if (result.education.length > 0) {
    // Add additional info to last education entry
    const lastEdu = result.education[result.education.length - 1];
    if (line.toLowerCase().includes('gpa')) {
      const gpaMatch = line.match(/(\d+\.\d+)/);
      if (gpaMatch) lastEdu.gpa = gpaMatch[1];
    } else if (line.toLowerCase().includes('magna cum laude') || 
               line.toLowerCase().includes('summa cum laude') ||
               line.toLowerCase().includes('cum laude')) {
      lastEdu.honors = line;
    }
  }
}

function processProjectsSection(result: ResumeData, line: string) {
  // Simple project parsing - can be enhanced based on actual format
  if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && 
      line.length > 10) {
    // This looks like a project name
    const newProject: ProjectItem = {
      name: line,
      description: '',
      technologies: []
    };
    
    result.projects?.push(newProject);
  } else if (result.projects && result.projects.length > 0) {
    // Add description to last project
    const cleanLine = line.replace(/^[•\-*]\s*/, '');
    if (cleanLine) {
      const lastProject = result.projects[result.projects.length - 1];
      if (!lastProject.description) {
        lastProject.description = cleanLine;
      } else {
        lastProject.description += ' ' + cleanLine;
      }
    }
  }
}

function extractStartDate(dateStr: string): string {
  const match = dateStr.match(/(\w+\s+\d{4}|\d{4})/);
  return match ? match[1] : '';
}

function extractEndDate(dateStr: string): string {
  if (dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
    return 'Present';
  }
  const matches = dateStr.match(/(\w+\s+\d{4}|\d{4})/g);
  return matches && matches.length > 1 ? matches[1] : '';
}

function extractGraduationDate(line: string): string {
  const match = line.match(/(\w+\s+\d{4}|\d{4})/);
  return match ? match[1] : '';
}

function saveCurrentItem(result: ResumeData, section: string, item: any) {
  // This function can be used for more complex section handling if needed
  // Currently, most processing is done inline
}

/**
 * Utility function to convert from the existing text-based resume format
 * to the new structured format for use with ProfessionalResumeDisplay
 */
export function convertTextResumeToStructured(textResume: string): ResumeData {
  return parseResumeText(textResume);
}

/**
 * Helper function to merge additional data into parsed resume
 */
export function enhanceResumeData(baseData: ResumeData, additionalInfo: Partial<ResumeData>): ResumeData {
  return {
    ...baseData,
    ...additionalInfo,
    contact: { ...baseData.contact, ...additionalInfo.contact },
    experience: additionalInfo.experience || baseData.experience,
    education: additionalInfo.education || baseData.education,
    skills: additionalInfo.skills || baseData.skills,
    projects: additionalInfo.projects || baseData.projects,
    certifications: additionalInfo.certifications || baseData.certifications,
    languages: additionalInfo.languages || baseData.languages,
  };
} 
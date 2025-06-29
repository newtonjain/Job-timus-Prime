import React from 'react';
import ProfessionalResumeDisplay, { ResumeData } from '@/components/professional-resume-display';

// Sample resume data to demonstrate the component
const sampleResumeData: ResumeData = {
  name: "Sarah Johnson",
  title: "Senior Software Engineer",
  contact: {
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "https://sarahjohnson.dev",
    linkedin: "https://linkedin.com/in/sarahjohnson",
    github: "https://github.com/sarahjohnson"
  },
  summary: "Experienced full-stack software engineer with 8+ years of expertise in modern web technologies, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers. Proven track record of delivering high-quality software solutions in fast-paced startup environments.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "Jan 2022",
      endDate: "Present",
      description: "Lead development of microservices architecture serving 1M+ daily active users.",
      achievements: [
        "Architected and implemented scalable microservices reducing system latency by 40%",
        "Led a team of 5 engineers in developing a real-time analytics dashboard",
        "Mentored 3 junior developers, with 2 receiving promotions within 18 months",
        "Reduced deployment time from 2 hours to 15 minutes through CI/CD optimization"
      ]
    },
    {
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "Jun 2019",
      endDate: "Dec 2021",
      description: "Developed and maintained customer-facing web applications using React and Node.js.",
      achievements: [
        "Built responsive web application increasing user engagement by 60%",
        "Implemented automated testing reducing bug reports by 35%",
        "Optimized database queries improving application performance by 50%",
        "Collaborated with design team to implement pixel-perfect UI components"
      ]
    },
    {
      title: "Software Developer",
      company: "Digital Solutions LLC",
      location: "Austin, TX",
      startDate: "Aug 2016",
      endDate: "May 2019",
      description: "Developed web applications and APIs for various client projects.",
      achievements: [
        "Created RESTful APIs serving multiple client applications",
        "Maintained 99.9% uptime for critical client systems",
        "Implemented security best practices reducing vulnerabilities by 80%"
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "May 2016",
      gpa: "3.8",
      honors: "Magna Cum Laude",
      coursework: [
        "Data Structures & Algorithms",
        "Software Engineering",
        "Database Systems",
        "Computer Networks",
        "Machine Learning"
      ]
    }
  ],
  skills: [
    "JavaScript (ES6+), TypeScript",
    "React, Vue.js, Angular",
    "Node.js, Express.js",
    "Python, Django, Flask",
    "AWS, Docker, Kubernetes",
    "PostgreSQL, MongoDB, Redis",
    "Git, CI/CD, Jenkins",
    "RESTful APIs, GraphQL",
    "Agile/Scrum, Test-Driven Development"
  ],
  projects: [
    {
      name: "E-Commerce Platform",
      description: "Built a complete e-commerce solution with payment processing, inventory management, and admin dashboard. Handles 10,000+ transactions per month.",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe API", "AWS"],
      link: "https://github.com/sarahjohnson/ecommerce-platform"
    },
    {
      name: "Real-Time Chat Application",
      description: "Developed a scalable chat application with real-time messaging, file sharing, and video calls using WebRTC and Socket.io.",
      technologies: ["Vue.js", "Socket.io", "WebRTC", "MongoDB", "Docker"],
      link: "https://github.com/sarahjohnson/chat-app"
    },
    {
      name: "Task Management API",
      description: "RESTful API for task management with user authentication, role-based permissions, and comprehensive documentation.",
      technologies: ["Python", "Django REST Framework", "PostgreSQL", "Redis"],
      link: "https://github.com/sarahjohnson/task-api"
    }
  ],
  certifications: [
    "AWS Certified Solutions Architect - Associate (2023)",
    "Certified Kubernetes Administrator (2022)",
    "Google Cloud Professional Developer (2021)"
  ],
  languages: [
    "English (Native)",
    "Spanish (Conversational)",
    "French (Basic)"
  ]
};

const ResumeExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Resume Display Example
          </h1>
          <p className="text-lg text-gray-600">
            This demonstrates the ProfessionalResumeDisplay component with structured data
          </p>
        </div>

        <ProfessionalResumeDisplay 
          resumeData={sampleResumeData}
          showDownloadButtons={true}
        />

        {/* Usage Instructions */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use</h2>
            <div className="prose prose-blue max-w-none">
              <h3>1. Import the Component</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import ProfessionalResumeDisplay, { ResumeData } from '@/components/professional-resume-display';`}
              </pre>

              <h3>2. Prepare Your Data</h3>
              <p>Structure your resume data according to the <code>ResumeData</code> interface:</p>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`const resumeData: ResumeData = {
  name: "John Doe",
  title: "Software Engineer",
  contact: {
    email: "john@example.com",
    phone: "(555) 123-4567",
    // ... other contact info
  },
  summary: "Professional summary...",
  experience: [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      startDate: "2022",
      endDate: "Present",
      achievements: ["Achievement 1", "Achievement 2"]
    }
  ],
  education: [
    {
      degree: "BS Computer Science",
      institution: "University",
      graduationDate: "2020"
    }
  ],
  skills: ["JavaScript", "React", "Node.js"],
  // ... other sections
};`}
              </pre>

              <h3>3. Use the Component</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<ProfessionalResumeDisplay 
  resumeData={resumeData}
  showDownloadButtons={true}
  className="my-custom-class"
/>`}
              </pre>

              <h3>Features</h3>
              <ul>
                <li><strong>Structured Data:</strong> Accepts well-defined TypeScript interfaces</li>
                <li><strong>Professional Design:</strong> Modern, clean layout with blue accent colors</li>
                <li><strong>Download Support:</strong> Built-in PDF and DOCX export functionality</li>
                <li><strong>Responsive:</strong> Works on desktop and mobile devices</li>
                <li><strong>Customizable:</strong> Optional download buttons and custom CSS classes</li>
                <li><strong>Interactive:</strong> Clickable contact links and project URLs</li>
              </ul>

              <h3>Data Structure</h3>
              <p>The component supports these main sections:</p>
              <ul>
                <li><strong>Personal Info:</strong> Name, title, contact information</li>
                <li><strong>Professional Summary:</strong> Brief overview of experience</li>
                <li><strong>Work Experience:</strong> Job history with achievements</li>
                <li><strong>Education:</strong> Academic background</li>
                <li><strong>Skills:</strong> Technical and professional skills</li>
                <li><strong>Projects:</strong> Portfolio projects (optional)</li>
                <li><strong>Certifications:</strong> Professional certifications (optional)</li>
                <li><strong>Languages:</strong> Language proficiency (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeExample; 
import React, { useState, useRef } from 'react';
import { ResumeData, Experience, Education, Skill } from './types';
import ResumePreview from './components/ResumePreview';
import { PlusIcon, TrashIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon } from './components/Icons';
import { AIAssistant } from './components/AIAssistant';
import { polishText, generateSummary, suggestSkills } from './services/geminiService';

const initialResumeState: ResumeData = {
  personalInfo: {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'janedoe.com',
    summary: 'Creative and detail-oriented Software Engineer with 5+ years of experience in building scalable web applications. Passionate about UI/UX design and AI technologies.',
  },
  experience: [
    {
      id: '1',
      company: 'Tech Solutions Inc.',
      role: 'Senior Frontend Developer',
      startDate: '2021',
      endDate: 'Present',
      description: 'Led the frontend team in redesigning the company dashboard using React and TypeScript. Improved load times by 40% and implemented a new design system.',
      isCurrent: true,
    }
  ],
  education: [],
  skills: [],
};

// --- Extracted Components (Must be outside App to preserve focus) ---

const SectionHeader = ({ 
  title, 
  isExpanded, 
  onToggle 
}: { 
  title: string, 
  isExpanded: boolean, 
  onToggle: () => void 
}) => (
  <button 
    onClick={onToggle}
    className="w-full flex justify-between items-center p-4 bg-white/40 hover:bg-white/60 backdrop-blur-sm border-b border-white/20 transition-all text-left"
  >
    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-slate-500" /> : <ChevronDownIcon className="w-5 h-5 text-slate-500" />}
  </button>
);

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{children}</label>
);

const GlassInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full p-2.5 bg-white/50 border border-white/40 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-400 focus:bg-white/70 focus:border-transparent outline-none transition-all shadow-sm ${props.className || ''}`}
  />
);

const GlassTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className={`w-full p-3 bg-white/50 border border-white/40 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-400 focus:bg-white/70 focus:border-transparent outline-none transition-all shadow-sm ${props.className || ''}`}
  />
);

function App() {
  const [resume, setResume] = useState<ResumeData>(initialResumeState);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: false,
    education: false,
    skills: false,
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Update Handlers ---
  const updatePersonalInfo = (field: string, value: string) => {
    setResume(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrent: false,
    };
    setResume(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setResume(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setResume(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setResume(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const addSkill = (name: string = '') => {
    const newSkill: Skill = { id: crypto.randomUUID(), name, level: 3 };
    setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const updateSkill = (id: string, name: string) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.map(skill => skill.id === id ? { ...skill, name } : skill)
    }));
  };

  const removeSkill = (id: string) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== id) }));
  };

  // --- AI Actions ---
  const handleAISummary = async () => {
    const summary = await generateSummary(resume);
    if (summary) updatePersonalInfo('summary', summary);
  };

  const handleAIPolishExperience = async (id: string, text: string) => {
    const polished = await polishText(text, "job experience description");
    if (polished) updateExperience(id, 'description', polished);
  };

  const handleAIGenerateSkills = async () => {
    const context = resume.experience.map(e => `${e.role}: ${e.description}`).join('; ');
    const skills = await suggestSkills("Professional", context);
    const existingNames = new Set(resume.skills.map(s => s.name.toLowerCase()));
    skills.forEach(skillName => {
      if (!existingNames.has(skillName.toLowerCase())) {
        addSkill(skillName);
      }
    });
  };

  const handleDownloadPDF = () => {
    // Triggers native browser print which supports Save as PDF with selectable text
    window.print();
  };

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden text-slate-800 no-print">
        {/* Mobile Tab Bar */}
        <div className="md:hidden flex bg-white/80 backdrop-blur-md border-b border-white/30 z-50">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-3 text-sm font-bold ${activeTab === 'editor' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            Editor
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-bold ${activeTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            Preview
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex justify-center items-center p-1 md:p-3 overflow-hidden">
          
          {/* Glass Desktop Container - Maximized width and height */}
          <div className="w-full max-w-[1600px] h-full bg-white/20 backdrop-blur-xl border border-white/40 md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Editor Pane (Left) */}
            <div className={`
              flex-1 flex flex-col min-w-0 bg-white/30 border-r border-white/20 transition-all duration-300
              ${activeTab === 'editor' ? 'flex' : 'hidden md:flex'}
              md:w-[45%] lg:w-[40%] xl:w-[35%]
            `}>
              <div className="p-5 md:p-6 border-b border-white/20 bg-white/10 backdrop-blur-sm">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mini Resume</h1>
                <p className="text-slate-600 text-xs mt-1 font-medium">AI-Powered • Immersive • Smart</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                
                {/* Personal Info */}
                <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <SectionHeader 
                    title="Personal Info" 
                    isExpanded={expandedSections['personal']}
                    onToggle={() => toggleSection('personal')} 
                  />
                  {expandedSections['personal'] && (
                    <div className="p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <InputLabel>Full Name</InputLabel>
                            <GlassInput value={resume.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} placeholder="John Doe" />
                        </div>
                        <div>
                            <InputLabel>Email</InputLabel>
                            <GlassInput type="email" value={resume.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} placeholder="john@example.com" />
                        </div>
                        <div>
                            <InputLabel>Phone</InputLabel>
                            <GlassInput value={resume.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="+1 234 567 890" />
                        </div>
                        <div className="col-span-2">
                            <InputLabel>Location</InputLabel>
                            <GlassInput value={resume.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="New York, NY" />
                        </div>
                        <div className="col-span-2">
                            <InputLabel>LinkedIn</InputLabel>
                            <GlassInput value={resume.personalInfo.linkedin} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <InputLabel>Summary</InputLabel>
                          <AIAssistant onGenerate={handleAISummary} label="Auto-Write" context="Generates a summary based on your experience." disabled={resume.experience.length === 0} />
                        </div>
                        <GlassTextArea 
                          className="h-28"
                          value={resume.personalInfo.summary} 
                          onChange={(e) => updatePersonalInfo('summary', e.target.value)} 
                          placeholder="Experienced software engineer with a passion for..." 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <SectionHeader 
                    title="Experience" 
                    isExpanded={expandedSections['experience']}
                    onToggle={() => toggleSection('experience')}
                  />
                  {expandedSections['experience'] && (
                    <div className="p-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        {resume.experience.map((exp) => (
                          <div key={exp.id} className="relative p-4 border border-white/50 rounded-xl bg-white/40 group hover:bg-white/60 transition-colors">
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded-full shadow-sm">
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <GlassInput className="col-span-2 font-semibold" placeholder="Job Title" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                              <GlassInput className="col-span-2" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                              <GlassInput placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                              <div className="flex gap-2 items-center">
                                 <GlassInput placeholder="End Date" disabled={exp.isCurrent} className={`${exp.isCurrent ? 'opacity-50' : ''}`} value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} />
                                 <div className="flex items-center h-full pt-1">
                                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" checked={exp.isCurrent} onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)} />
                                 </div>
                              </div>
                            </div>
                            <div className="relative mt-2">
                               <div className="flex justify-between items-center mb-1.5">
                                  <InputLabel>Description</InputLabel>
                                  <AIAssistant 
                                    onGenerate={() => handleAIPolishExperience(exp.id, exp.description)} 
                                    label="Polish" 
                                    context="Refines description."
                                    disabled={!exp.description}
                                  />
                               </div>
                               <GlassTextArea 
                                  className="h-24"
                                  placeholder="• Led a team of..." 
                                  value={exp.description}
                                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                               />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={addExperience} className="mt-4 w-full py-2.5 border-2 border-dashed border-white/40 rounded-xl text-slate-600 hover:bg-white/30 hover:border-indigo-400 hover:text-indigo-600 transition-all flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-wide">
                        <PlusIcon className="w-4 h-4" /> Add Position
                      </button>
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <SectionHeader 
                    title="Education" 
                    isExpanded={expandedSections['education']}
                    onToggle={() => toggleSection('education')}
                  />
                  {expandedSections['education'] && (
                    <div className="p-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        {resume.education.map((edu) => (
                          <div key={edu.id} className="relative p-4 border border-white/50 rounded-xl bg-white/40 group hover:bg-white/60 transition-colors">
                            <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded-full shadow-sm">
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <GlassInput className="col-span-2 font-semibold" placeholder="School / University" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} />
                              <GlassInput className="col-span-2" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                              <GlassInput placeholder="Start Date" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} />
                              <GlassInput placeholder="End Date" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={addEducation} className="mt-4 w-full py-2.5 border-2 border-dashed border-white/40 rounded-xl text-slate-600 hover:bg-white/30 hover:border-indigo-400 hover:text-indigo-600 transition-all flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-wide">
                        <PlusIcon className="w-4 h-4" /> Add Education
                      </button>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <SectionHeader 
                    title="Skills" 
                    isExpanded={expandedSections['skills']}
                    onToggle={() => toggleSection('skills')}
                  />
                  {expandedSections['skills'] && (
                    <div className="p-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-slate-600 font-medium">Add skills manually or use AI.</p>
                        <AIAssistant 
                          onGenerate={handleAIGenerateSkills} 
                          label="Suggest" 
                          context="Suggests skills based on experience."
                          disabled={resume.experience.length === 0} 
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resume.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center bg-indigo-50/50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100/50 text-sm shadow-sm backdrop-blur-sm">
                            <input 
                              value={skill.name}
                              onChange={(e) => updateSkill(skill.id, e.target.value)}
                              className="bg-transparent border-none outline-none w-auto min-w-[20px] max-w-[120px] text-indigo-800 placeholder-indigo-300"
                            />
                            <button onClick={() => removeSkill(skill.id)} className="ml-2 text-indigo-400 hover:text-red-500 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addSkill('New Skill')} className="w-full py-2.5 border-2 border-dashed border-white/40 rounded-xl text-slate-600 hover:bg-white/30 hover:border-indigo-400 hover:text-indigo-600 transition-all flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-wide">
                        <PlusIcon className="w-4 h-4" /> Add Skill
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Preview Pane (Right) */}
            <div className={`
              flex-1 relative overflow-hidden bg-white/20 backdrop-blur-sm flex flex-col
              ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}
            `}>
              {/* Preview Toolbar */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/20 bg-white/30 backdrop-blur-md shadow-sm z-10">
                 <h2 className="text-slate-700 font-semibold text-sm uppercase tracking-wider">Live Preview</h2>
                 <button 
                  onClick={handleDownloadPDF}
                  className={`
                    flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm font-medium
                    hover:scale-105 active:scale-95
                  `}
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Save as PDF</span>
                </button>
              </div>

              {/* Scrollable Preview Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start custom-scrollbar bg-slate-50/50">
                <ResumePreview data={resume} innerRef={previewRef} id="resume-preview-content" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Print Container */}
      <div className="print-only-container">
        <ResumePreview data={resume} />
      </div>
    </>
  );
}

export default App;
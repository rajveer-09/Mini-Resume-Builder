import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  innerRef?: React.Ref<HTMLDivElement>;
  id?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, innerRef, id }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="w-full h-full flex justify-center print:block print:h-auto print:w-full print:p-0">
      <div 
        ref={innerRef}
        id={id}
        className="
          bg-white shadow-lg mx-auto p-[10mm] text-slate-800 
          max-w-[210mm] w-[210mm] min-h-[297mm]
          transform-gpu transition-transform origin-top
          print:shadow-none print:w-full print:max-w-none print:min-h-0 print:m-0 print:p-[10mm] print:transform-none
        "
      >
        {/* Centered Header */}
        <header className="border-b-2 border-slate-900 pb-6 mb-8 text-center print:mb-6">
          <h1 className="text-5xl font-bold uppercase tracking-tight text-slate-900 mb-4 print:text-4xl print:mb-2">
            {personalInfo.fullName || "Your Name"}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-slate-600 text-sm font-medium print:text-xs">
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.email && (
              <>
                <span className="text-slate-300">|</span>
                <span>{personalInfo.email}</span>
              </>
            )}
            {personalInfo.phone && (
              <>
                <span className="text-slate-300">|</span>
                <span>{personalInfo.phone}</span>
              </>
            )}
            {personalInfo.linkedin && (
              <>
                <span className="text-slate-300">|</span>
                <span className="truncate max-w-[200px]">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </>
            )}
            {personalInfo.website && (
              <>
                <span className="text-slate-300">|</span>
                <span className="truncate max-w-[200px]">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
              </>
            )}
          </div>
        </header>

        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-8 break-inside-avoid print:mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4 print:mb-2">
              Professional Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm text-justify print:text-xs">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8 print:mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4 print:mb-2">
              Work Experience
            </h2>
            <div className="space-y-6 print:space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 text-lg print:text-base">{exp.role}</h3>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide whitespace-nowrap ml-4 print:text-[10px]">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-slate-700 font-semibold text-sm mb-2 print:text-xs print:mb-1">{exp.company}</div>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pl-1 print:text-xs">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8 print:mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4 print:mb-2">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 text-base print:text-sm">{edu.school}</h3>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide whitespace-nowrap ml-4 print:text-[10px]">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className="text-slate-700 text-sm print:text-xs">{edu.degree}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4 print:mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-semibold tracking-wide border border-slate-200 print:border-gray-300"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
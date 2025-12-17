export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

export enum AIActionType {
  POLISH_SUMMARY = 'POLISH_SUMMARY',
  POLISH_EXPERIENCE = 'POLISH_EXPERIENCE',
  GENERATE_SKILLS = 'GENERATE_SKILLS',
}

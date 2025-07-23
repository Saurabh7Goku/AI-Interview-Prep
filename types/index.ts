export interface Tip {
    type: 'good' | 'improve';
    tip: string;
    explanation?: string;
  }
  
  export interface SkillMatch {
    skill: string;
    present: boolean;
  }
  
  export interface ATSReport {
    id: string;
    userId: string;
    jobTitle: string;
    companyName: string;
    matchScore: number;
    missingKeywords: string[];
    formattingIssues: string[];
    contentSuggestions: string[];
    hardSkillsMatch: SkillMatch[];
    softSkillsMatch: SkillMatch[];
    experienceAlignment: string;
    resumeText: string;
    jobDescription: string;
    createdAt: string;
  
    skills: {
      score: number;
      tips: Tip[];
    };
    toneAndStyle: {
      score: number;
      tips: Tip[];
    };
    content: {
      score: number;
      tips: Tip[];
    };
    structure: {
      score: number;
      tips: Tip[];
    };
    ATS: {
      tips: Omit<Tip, 'explanation'>[];
    };
  }
  
    
    export interface User {
      uid: string;
      email: string | null;
      displayName: string | null;
    }
// Emmy AI Career Assistant Types

export interface Message {
  from: 'emmy' | 'user';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface JobPreferences {
  role: string;
  skills: string[];
  location: string;
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experienceYears: number;
  preferences: {
    culturePriorities: string[];
    companySize?: string;
    industry?: string;
  };
  mustHaves: string[];
  niceToHaves: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  applyUrl: string;
  postedDate: Date;
  source: string;  // 'adzuna', 'linkedin', 'google_jobs', etc.
  relevanceScore?: number;
  matchReason?: string;
}

export interface ConversationState {
  messages: Message[];
  extractedPreferences?: Partial<JobPreferences>;
  isComplete: boolean;
  jobs?: Job[];
  sessionId?: string;
}

// API Request/Response Types

export interface MessageRequest {
  conversationHistory: Message[];
  currentMessage: string;
  sessionId?: string;
}

export interface MessageResponse {
  reply: string;
  isComplete: boolean;
  extractedData?: Partial<JobPreferences>;
}

export interface SearchRequest {
  preferences: Partial<JobPreferences>;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  jobs: Job[];
  total: number;
  query: string;
  page: number;
}

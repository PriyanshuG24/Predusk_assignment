export interface UserProfile {
  name: string;
  email: string;
  education?: string;
  skills: string[];
  work: Work[];
  projects: Project[];
  links?: Links;
}

export interface Work {
  _id: string;
  title: string;
  description: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  links?: ProjectLink[];
}

export interface ProjectLink {
  _id: string;
  label: string;
  url: string;
}

export interface Links {
  [key: string]: string | undefined;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiFetchOptions {
  method?: string;
  body?: any;
}

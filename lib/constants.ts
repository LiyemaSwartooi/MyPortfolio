/**
 * Application Constants
 * Centralized configuration for the portfolio application
 */

// API Endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  ABOUT: '/api/about',
  PROFILE: '/api/about/profile',
  UPLOAD: '/api/about/upload',
  EXPERIENCES: '/api/experiences',
  SKILLS: '/api/skills',
  PROJECTS: '/api/projects',
  ACHIEVEMENTS: '/api/achievements',
  EDUCATION: '/api/education',
  CERTIFICATES: '/api/certificates',
  TESTIMONIALS: '/api/testimonials',
  CONTACT: '/api/contact',
  JOURNEY: '/api/journey',
  RESUME: '/api/resume',
} as const

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_CONVERSATION_HISTORY: 10,
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  API_TIMEOUT_MS: 30000, // 30 seconds
  MAX_MESSAGES_LOAD: 100,
} as const

// Chat Categories
export const CHAT_CATEGORIES = {
  ALL_TOPICS: 'smart',
  PROJECTS: 'fast',
  EXPERIENCE: 'creative',
  SKILLS: 'skills',
  ACHIEVEMENTS: 'achievements',
  EDUCATION: 'education',
  CERTIFICATES: 'certificates',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
} as const

export const CHAT_CATEGORY_LABELS: Record<string, string> = {
  [CHAT_CATEGORIES.ALL_TOPICS]: 'All Topics',
  [CHAT_CATEGORIES.PROJECTS]: 'Projects',
  [CHAT_CATEGORIES.EXPERIENCE]: 'Experience',
  [CHAT_CATEGORIES.SKILLS]: 'Skills',
  [CHAT_CATEGORIES.ACHIEVEMENTS]: 'Achievements',
  [CHAT_CATEGORIES.EDUCATION]: 'Education',
  [CHAT_CATEGORIES.CERTIFICATES]: 'Certificates',
  [CHAT_CATEGORIES.TESTIMONIALS]: 'Testimonials',
  [CHAT_CATEGORIES.CONTACT]: 'Contact',
} as const

// Sections
export type Section = 'home' | 'about' | 'experience' | 'skills' | 'projects' | 'education' | 'achievements' | 'certificates' | 'resume' | 'journey' | 'testimonials' | 'contact'

export const SECTIONS: Record<string, Section> = {
  HOME: 'home',
  ABOUT: 'about',
  EXPERIENCE: 'experience',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  EDUCATION: 'education',
  ACHIEVEMENTS: 'achievements',
  CERTIFICATES: 'certificates',
  RESUME: 'resume',
  JOURNEY: 'journey',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
} as const

// Validation Rules
export const VALIDATION_RULES = {
  MAX_TEXT_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_URL_LENGTH: 2048,
  MIN_PASSWORD_LENGTH: 8,
} as const

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH_PX: 240,
  MOBILE_BREAKPOINT_PX: 768,
  TOAST_DURATION_MS: 3000,
  DEBOUNCE_DELAY_MS: 500,
  BACKGROUND_SLIDE_INTERVAL_MS: 8000,
  TEXT_SLIDESHOW_INTERVAL_MS: 3000,
} as const

// Storage Keys (for localStorage/sessionStorage)
export const STORAGE_KEYS = {
  CHAT_SESSION_ID: 'chat_session_id',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be signed in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported format.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  DELETED: 'Deleted successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  UPLOADED: 'File uploaded successfully',
  SENT: 'Sent successfully',
  COPIED: 'Copied to clipboard',
} as const

// Background Images
export const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2070&auto=format&fit=crop',
] as const

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
} as const

// Animation Durations (in seconds)
export const ANIMATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  VERY_SLOW: 1,
} as const

// Z-Index Layers
export const Z_INDEX = {
  BACKGROUND: -10,
  BASE: 0,
  DROPDOWN: 10,
  SIDEBAR: 20,
  MOBILE_SIDEBAR: 40,
  HEADER: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOAST: 100,
} as const


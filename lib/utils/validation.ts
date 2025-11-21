/**
 * Input Validation Utilities
 * Centralized validation functions for all user inputs
 */

import { VALIDATION_RULES, REGEX_PATTERNS, ERROR_MESSAGES } from '@/lib/constants'

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate text input
 */
export function validateText(
  value: string | undefined | null,
  fieldName: string,
  options: {
    required?: boolean
    maxLength?: number
    minLength?: number
    pattern?: RegExp
    patternMessage?: string
  } = {}
): ValidationResult {
  const {
    required = false,
    maxLength = VALIDATION_RULES.MAX_TEXT_LENGTH,
    minLength = 0,
    pattern,
    patternMessage
  } = options

  // Check required
  if (required && (!value || value.trim().length === 0)) {
    return {
      valid: false,
      error: `${fieldName} is required`
    }
  }

  // Skip further validation if value is empty and not required
  if (!value || value.trim().length === 0) {
    return { valid: true }
  }

  const trimmedValue = value.trim()

  // Check min length
  if (trimmedValue.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`
    }
  }

  // Check max length
  if (trimmedValue.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${maxLength} characters`
    }
  }

  // Check pattern
  if (pattern && !pattern.test(trimmedValue)) {
    return {
      valid: false,
      error: patternMessage || `${fieldName} format is invalid`
    }
  }

  // Check for dangerous patterns (XSS, SQL injection)
  const dangerousPatterns = [
    { pattern: /<script/i, message: 'Invalid characters detected' },
    { pattern: /javascript:/i, message: 'Invalid characters detected' },
    { pattern: /on\w+\s*=/i, message: 'Invalid characters detected' },
    { pattern: /DROP\s+TABLE/i, message: 'Invalid input' },
    { pattern: /DELETE\s+FROM/i, message: 'Invalid input' },
    { pattern: /INSERT\s+INTO/i, message: 'Invalid input' },
    { pattern: /UPDATE\s+\w+\s+SET/i, message: 'Invalid input' }
  ]

  for (const { pattern: dangerousPattern, message } of dangerousPatterns) {
    if (dangerousPattern.test(trimmedValue)) {
      return {
        valid: false,
        error: message
      }
    }
  }

  return { valid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string | undefined | null): ValidationResult {
  if (!email) {
    return { valid: true } // Email is optional
  }

  const trimmed = email.trim()
  
  if (trimmed.length === 0) {
    return { valid: true }
  }

  if (trimmed.length > VALIDATION_RULES.MAX_EMAIL_LENGTH) {
    return {
      valid: false,
      error: `Email must be less than ${VALIDATION_RULES.MAX_EMAIL_LENGTH} characters`
    }
  }

  if (!REGEX_PATTERNS.EMAIL.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid email format'
    }
  }

  return { valid: true }
}

/**
 * Validate URL
 */
export function validateURL(url: string | undefined | null): ValidationResult {
  if (!url) {
    return { valid: true } // URL is optional
  }

  const trimmed = url.trim()
  
  if (trimmed.length === 0) {
    return { valid: true }
  }

  if (trimmed.length > VALIDATION_RULES.MAX_URL_LENGTH) {
    return {
      valid: false,
      error: `URL must be less than ${VALIDATION_RULES.MAX_URL_LENGTH} characters`
    }
  }

  if (!REGEX_PATTERNS.URL.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid URL format'
    }
  }

  return { valid: true }
}

/**
 * Validate UUID
 */
export function validateUUID(id: string | undefined | null): ValidationResult {
  if (!id) {
    return {
      valid: false,
      error: 'ID is required'
    }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!uuidRegex.test(id)) {
    return {
      valid: false,
      error: 'Invalid ID format'
    }
  }

  return { valid: true }
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  return text
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

/**
 * Validate profile data
 */
export function validateProfileData(data: any): ValidationResult {
  // Validate full_name
  const nameValidation = validateText(data.full_name, 'Full name', {
    maxLength: VALIDATION_RULES.MAX_TITLE_LENGTH
  })
  if (!nameValidation.valid) return nameValidation

  // Validate title
  const titleValidation = validateText(data.title, 'Title', {
    maxLength: VALIDATION_RULES.MAX_TITLE_LENGTH
  })
  if (!titleValidation.valid) return titleValidation

  // Validate bio
  const bioValidation = validateText(data.bio, 'Bio', {
    maxLength: VALIDATION_RULES.MAX_DESCRIPTION_LENGTH
  })
  if (!bioValidation.valid) return bioValidation

  // Validate subtitle
  const subtitleValidation = validateText(data.subtitle, 'Subtitle', {
    maxLength: VALIDATION_RULES.MAX_TITLE_LENGTH
  })
  if (!subtitleValidation.valid) return subtitleValidation

  // Validate email
  if (data.email) {
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) return emailValidation
  }

  // Validate URLs
  if (data.linkedin_url) {
    const linkedinValidation = validateURL(data.linkedin_url)
    if (!linkedinValidation.valid) return linkedinValidation
  }

  if (data.github_url) {
    const githubValidation = validateURL(data.github_url)
    if (!githubValidation.valid) return githubValidation
  }

  if (data.website_url) {
    const websiteValidation = validateURL(data.website_url)
    if (!websiteValidation.valid) return websiteValidation
  }

  return { valid: true }
}


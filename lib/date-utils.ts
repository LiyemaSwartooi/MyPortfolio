/**
 * Safe date formatting utilities that prevent hydration mismatches
 */

/**
 * Formats a date string safely for SSR/client rendering
 * Uses a consistent format that won't differ between server and client
 */
export function formatDate(date: string | null | undefined, format: 'long' | 'short' = 'long'): string {
  if (!date) return "Not specified"
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return "Invalid date"
    
    if (format === 'long') {
      // Use a consistent format that works the same on server and client
      const year = dateObj.getFullYear()
      const month = dateObj.toLocaleString('en-US', { month: 'long' })
      return `${month} ${year}`
    } else {
      // Short format: YYYY-MM-DD
      return dateObj.toISOString().split('T')[0]
    }
  } catch {
    return "Invalid date"
  }
}

/**
 * Formats a date period (start - end)
 */
export function formatPeriod(startDate: string, endDate: string | null, isCurrent: boolean): string {
  if (!startDate) return ""
  
  try {
    const start = new Date(startDate).getFullYear()
    const end = endDate ? new Date(endDate).getFullYear() : null
    
    if (isCurrent) {
      return `${start} - Present`
    }
    return end ? `${start} - ${end}` : `${start}`
  } catch {
    return startDate
  }
}

/**
 * Gets current date in ISO format (YYYY-MM-DD)
 * Safe for use in initial state
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Gets current year as string
 */
export function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}


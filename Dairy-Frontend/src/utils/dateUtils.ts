/**
 * Date Utility Functions for Timezone-Aware Operations
 */

// Get today's date as DD-MM-YYYY format (for display and storage)
export const getTodayDateString = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}-${month}-${year}`
}

// Get today's date as YYYY-MM-DD format (for HTML input fields)
export const getTodayDateForInput = (): string => {
  const now = new Date()
  return now.toLocaleDateString('en-CA') // en-CA gives YYYY-MM-DD format
}

// Convert DD-MM-YYYY to YYYY-MM-DD (for HTML input fields)
export const convertToInputFormat = (dateStr: string): string => {
  if (!dateStr || dateStr.length === 0) return getTodayDateForInput()
  
  // Check if already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr
  }
  
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateStr.split('-')
    return `${year}-${month}-${day}`
  }
  
  return getTodayDateForInput()
}

// Convert YYYY-MM-DD to DD-MM-YYYY (for storage/display)
export const convertToDisplayFormat = (dateStr: string): string => {
  if (!dateStr) return getTodayDateString()
  
  // Check if already in DD-MM-YYYY format
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return dateStr
  }
  
  // Convert from YYYY-MM-DD to DD-MM-YYYY
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-')
    return `${day}-${month}-${year}`
  }
  
  return getTodayDateString()
}

// Format date for display in UI (ensures DD-MM-YYYY format)
// Handles both YYYY-MM-DD and DD-MM-YYYY formats for backwards compatibility
export const formatDateForDisplay = (dateStr: string | any): string => {
  if (!dateStr) return getTodayDateString()
  
  // Convert to string if it's a Date object
  if (dateStr instanceof Date) {
    const day = String(dateStr.getDate()).padStart(2, '0')
    const month = String(dateStr.getMonth() + 1).padStart(2, '0')
    const year = dateStr.getFullYear()
    return `${day}-${month}-${year}`
  }
  
  const dateString = String(dateStr).trim()
  
  // Check if already in DD-MM-YYYY format
  if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return dateString
  }
  
  // Convert from YYYY-MM-DD to DD-MM-YYYY
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }
  
  // If it's ISO date format (with time), extract date part and convert
  if (dateString.match(/^\d{4}-\d{2}-\d{2}T/)) {
    const dateOnly = dateString.split('T')[0]
    const [year, month, day] = dateOnly.split('-')
    return `${day}-${month}-${year}`
  }
  
  return getTodayDateString()
}

// Get current time with timezone
export const getCurrentTimeWithTimezone = (): string => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
  return timeString
}

// Get current date and time in IST (Indian Standard Time) or user's timezone
export const getCurrentDateTimeIST = (): string => {
  const now = new Date()
  
  // Get timezone offset
  const offset = now.getTimezoneOffset()
  const istOffset = -330 // IST is UTC+5:30
  const localOffset = offset * 60000 // convert minutes to milliseconds
  
  const istTime = new Date(now.getTime() + localOffset + istOffset * 60000)
  
  return istTime.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  })
}

// Format date for API (YYYY-MM-DD)
export const formatDateForAPI = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-CA')
}

// Check if today is Sunday (0 = Sunday, 1 = Monday, etc.)
export const isTodaySunday = (): boolean => {
  return new Date().getDay() === 0
}

// Get day of week name
export const getDayName = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

// Get current day name
export const getTodayDayName = (): string => {
  return getDayName(new Date())
}

// Get current 10-day payment period (1-10, 11-20, 21-30/31)
export const getCurrentPaymentPeriod = (): { start: number; end: number; label: string } => {
  const today = new Date()
  const date = today.getDate()
  
  if (date <= 10) {
    return { start: 1, end: 10, label: "1-10" }
  } else if (date <= 20) {
    return { start: 11, end: 20, label: "11-20" }
  } else {
    // Get last day of current month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    return { start: 21, end: lastDay, label: `21-${lastDay}` }
  }
}

// Convert date string (DD-MM-YYYY) to just the day number
export const getDateDay = (dateStr: string): number => {
  if (!dateStr) return 0
  
  // Handle DD-MM-YYYY format
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day] = dateStr.split('-')
    return Number(day)
  }
  
  // Handle YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parts = dateStr.split('-')
    return Number(parts[2])
  }
  
  return 0
}

// Check if a date falls within current payment period
export const isDateInCurrentPeriod = (dateStr: string): boolean => {
  if (!dateStr) return false
  
  const day = getDateDay(dateStr)
  const period = getCurrentPaymentPeriod()
  
  return day >= period.start && day <= period.end
}

// Get payment period label with date range (e.g., "1-10 April 2026")
export const getPaymentPeriodLabel = (): string => {
  const now = new Date()
  const period = getCurrentPaymentPeriod()
  const monthName = now.toLocaleString('en-US', { month: 'long' })
  const year = now.getFullYear()
  
  return `${period.label} ${monthName} ${year}`
}

// Check if today is the first day of a payment period (1st, 11th, or 21st)
export const isPaymentPeriodFirstDay = (): boolean => {
  const today = new Date()
  const date = today.getDate()
  return date === 1 || date === 11 || date === 21
}

// Get the current period start and end dates in DD-MM-YYYY format
export const getCurrentPeriodDateRange = (): { startDate: string; endDate: string } => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const period = getCurrentPaymentPeriod()
  
  const startDate = `${String(period.start).padStart(2, '0')}-${month}-${year}`
  const endDate = `${String(period.end).padStart(2, '0')}-${month}-${year}`
  
  return { startDate, endDate }
}

// Get period key for a date (used to check if payment already exists for that period)
// Returns format like "04-2026-1" for 1-10, "04-2026-2" for 11-20, "04-2026-3" for 21-30
export const getPeriodKey = (dateStr: string): string => {
  if (!dateStr) return ""
  
  let day = 0
  let month = 0
  let year = 0
  
  // Parse DD-MM-YYYY
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [d, m, y] = dateStr.split('-')
    day = Number(d)
    month = Number(m)
    year = Number(y)
  }
  // Parse YYYY-MM-DD
  else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split('-')
    day = Number(d)
    month = Number(m)
    year = Number(y)
  }
  
  if (day === 0 || month === 0) return ""
  
  // Determine which 10-day period (1-10, 11-20, or 21-30)
  let periodNumber = 1
  if (day >= 11 && day <= 20) {
    periodNumber = 2
  } else if (day >= 21) {
    periodNumber = 3
  }
  
  // Return format: MM-YYYY-PERIOD (e.g., "04-2026-1" for 1-10, "04-2026-2" for 11-20, "04-2026-3" for 21-30)
  return `${String(month).padStart(2, '0')}-${year}-${periodNumber}`
}

// Check if a date is in the same period as today
export const isSamePeriod = (dateStr: string): boolean => {
  if (!dateStr) return false
  return getPeriodKey(dateStr) === getPeriodKey(getTodayDateString())
}

// Get payment period for a specific date (1-10, 11-20, 21-30/31)
export const getPaymentPeriodForDate = (dateStr: string): { start: number; end: number; label: string } => {
  if (!dateStr) return getCurrentPaymentPeriod()
  
  const day = getDateDay(dateStr)
  
  if (day <= 10) {
    return { start: 1, end: 10, label: "1-10" }
  } else if (day <= 20) {
    return { start: 11, end: 20, label: "11-20" }
  } else {
    // Get the month and year to determine last day
    let lastDay = 31
    
    // Parse month from DD-MM-YYYY or YYYY-MM-DD format
    let month = 0, year = 0
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [d, m, y] = dateStr.split('-')
      month = Number(m)
      year = Number(y)
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = dateStr.split('-')
      month = Number(m)
      year = Number(y)
    }
    
    if (month > 0 && year > 0) {
      lastDay = new Date(year, month, 0).getDate()
    }
    
    return { start: 21, end: lastDay, label: `21-${lastDay}` }
  }
}

// Check if a date is in the same period as a reference date
export const isDateInSamePeriod = (dateStr: string, referenceDate: string): boolean => {
  if (!dateStr || !referenceDate) return false
  
  const day = getDateDay(dateStr)
  const period = getPaymentPeriodForDate(referenceDate)
  
  return day >= period.start && day <= period.end
}

// Get payment period label for a specific date (e.g., "1-10 April 2026")
export const getPaymentPeriodLabelForDate = (dateStr: string): string => {
  if (!dateStr) return getPaymentPeriodLabel()
  
  let month = 0, year = 0, day = 0
  
  // Parse DD-MM-YYYY
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [d, m, y] = dateStr.split('-')
    day = Number(d)
    month = Number(m)
    year = Number(y)
  }
  // Parse YYYY-MM-DD
  else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split('-')
    day = Number(d)
    month = Number(m)
    year = Number(y)
  }
  
  if (month === 0 || year === 0) return getPaymentPeriodLabel()
  
  const period = getPaymentPeriodForDate(dateStr)
  const monthDate = new Date(year, month - 1)
  const monthName = monthDate.toLocaleString('en-US', { month: 'long' })
  
  return `${period.label} ${monthName} ${year}`
}

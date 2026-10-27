import {
  calculateDailyWorkMinutes,
  calculateWorkedDays,
  formatDisplayDate,
  formatDuration,
  formatWorkedDays,
  parseCalendarDate,
} from './calculations'

describe('calculateWorkedDays', () => {
  it('counts calendar days between admission and dismissal', () => {
    expect(calculateWorkedDays('2024-01-01', '2024-01-31')).toBe(30)
    expect(calculateWorkedDays('2024-01-10', '2024-01-10')).toBe(0)
  })

  it('handles leap years and DST changes without off-by-one', () => {
    expect(calculateWorkedDays('2024-02-28', '2024-03-01')).toBe(2)
    expect(calculateWorkedDays('2023-01-01', '2024-01-01')).toBe(365)
    expect(calculateWorkedDays('2024-01-01', '2025-01-01')).toBe(366)
    expect(calculateWorkedDays('2018-11-03', '2018-11-05')).toBe(2)
  })

  it('returns null when there is no dismissal date', () => {
    expect(calculateWorkedDays('2024-01-01', null)).toBeNull()
    expect(calculateWorkedDays('2024-01-01', '')).toBeNull()
  })

  it('returns null for invalid input or dismissal before admission', () => {
    expect(calculateWorkedDays('2024-02-30', '2024-03-10')).toBeNull()
    expect(calculateWorkedDays('2024-03-10', '2024-03-01')).toBeNull()
  })
})

describe('calculateDailyWorkMinutes', () => {
  it('returns the difference between start and end', () => {
    expect(calculateDailyWorkMinutes('08:00', '17:30')).toBe(570)
    expect(calculateDailyWorkMinutes('09:15', '09:15')).toBe(0)
  })

  it('returns null for incomplete, malformed or inverted times', () => {
    expect(calculateDailyWorkMinutes('08:00', '')).toBeNull()
    expect(calculateDailyWorkMinutes('8:00', '17:00')).toBeNull()
    expect(calculateDailyWorkMinutes('18:00', '08:00')).toBeNull()
  })
})

describe('formatDuration', () => {
  it('formats hours and minutes in Portuguese', () => {
    expect(formatDuration(510)).toBe('8 horas e 30 minutos')
    expect(formatDuration(480)).toBe('8 horas')
    expect(formatDuration(61)).toBe('1 hora e 1 minuto')
    expect(formatDuration(30)).toBe('30 minutos')
    expect(formatDuration(0)).toBe('0 minutos')
  })
})

describe('formatting helpers', () => {
  it('formats worked days with plural', () => {
    expect(formatWorkedDays(1)).toBe('1 dia')
    expect(formatWorkedDays(30)).toBe('30 dias')
  })

  it('formats calendar dates for display', () => {
    expect(formatDisplayDate('2024-03-05')).toBe('05/03/2024')
    expect(formatDisplayDate(null)).toBe('')
  })

  it('parses only real calendar dates', () => {
    expect(parseCalendarDate('2024-02-29')).not.toBeNull()
    expect(parseCalendarDate('2023-02-29')).toBeNull()
    expect(parseCalendarDate('29/02/2024')).toBeNull()
  })
})

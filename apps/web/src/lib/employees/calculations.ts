import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

/** `YYYY-MM-DD` → Date local, ou `null` se vazio/inválido (ex.: 2024-02-30). */
export function parseCalendarDate(value: string | null | undefined) {
  if (!value || !DATE_PATTERN.test(value)) return null
  const date = parseISO(value)
  return isValid(date) && format(date, 'yyyy-MM-dd') === value ? date : null
}

export function timeToMinutes(value: string | null | undefined) {
  if (!value || !TIME_PATTERN.test(value)) return null
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Dias corridos entre admissão e demissão (diferença de datas de calendário:
 * admitido em 01/01 e demitido em 31/01 → 30 dias). `null` quando não há
 * demissão — o cálculo não deve ser exibido — ou quando as datas são inválidas.
 */
export function calculateWorkedDays(
  admissionDate: string | null | undefined,
  dismissalDate: string | null | undefined,
) {
  const admission = parseCalendarDate(admissionDate)
  const dismissal = parseCalendarDate(dismissalDate)
  if (!admission || !dismissal) return null

  const days = differenceInCalendarDays(dismissal, admission)
  return days >= 0 ? days : null
}

/** Minutos de expediente por dia, ou `null` se algum horário for inválido ou o fim vier antes do início. */
export function calculateDailyWorkMinutes(
  workStartTime: string | null | undefined,
  workEndTime: string | null | undefined,
) {
  const start = timeToMinutes(workStartTime)
  const end = timeToMinutes(workEndTime)
  if (start === null || end === null || end < start) return null
  return end - start
}

export function formatWorkedDays(days: number) {
  return plural(days, 'dia', 'dias')
}

/** 510 → "8 horas e 30 minutos"; 480 → "8 horas"; 30 → "30 minutos". */
export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return plural(minutes, 'minuto', 'minutos')
  if (minutes === 0) return plural(hours, 'hora', 'horas')
  return `${plural(hours, 'hora', 'horas')} e ${plural(minutes, 'minuto', 'minutos')}`
}

/** `YYYY-MM-DD` → `dd/MM/yyyy` para exibição. */
export function formatDisplayDate(value: string | null | undefined) {
  const date = parseCalendarDate(value)
  return date ? format(date, 'dd/MM/yyyy') : ''
}

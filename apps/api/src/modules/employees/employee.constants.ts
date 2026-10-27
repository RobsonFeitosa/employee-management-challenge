/** Letras (inclusive acentuadas), espaços, apóstrofo, ponto e hífen — nenhum dígito. */
export const NAME_PATTERN = /^[\p{L}\s'.-]+$/u

/** Data de calendário, sem horário nem fuso. */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Horário 24h no formato HH:mm. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** `YYYY-MM-DD` → Date à meia-noite UTC (o formato só-data já é lido como UTC). */
export function parseCalendarDate(date: string): Date {
  return new Date(date)
}

export function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Letras (inclusive acentuadas), espaços, apóstrofo, ponto e hífen — nenhum dígito. */
export const NAME_PATTERN = /^[\p{L}\s'.-]+$/u

/** Horário 24h no formato HH:mm. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

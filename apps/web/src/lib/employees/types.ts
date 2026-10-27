export const CLOSING_PERIODICITIES = [
  'Mensal',
  'Bimestral',
  'Trimestral',
  'Semestral',
  'Anual',
] as const

export type ClosingPeriodicity = (typeof CLOSING_PERIODICITIES)[number]

/** Espelha `EmployeeResponse` da API: datas `YYYY-MM-DD`, horários `HH:mm`. */
export interface Employee {
  id: string
  name: string
  admissionDate: string
  dismissalDate: string | null
  workStartTime: string
  workEndTime: string
  closingPeriodicity: ClosingPeriodicity
  createdAt: string
  updatedAt: string
}

export type EmployeeInput = Pick<
  Employee,
  | 'name'
  | 'admissionDate'
  | 'dismissalDate'
  | 'workStartTime'
  | 'workEndTime'
  | 'closingPeriodicity'
>

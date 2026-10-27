import { ClosingPeriodicity } from '../enums/closing-periodicity.enum'

/** Formato JSON devolvido pela API (ver `toJSON` do schema). */
export interface EmployeeResponse {
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

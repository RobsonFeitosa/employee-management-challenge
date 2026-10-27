import { z } from 'zod'

import { parseCalendarDate, TIME_PATTERN, timeToMinutes } from './calculations'
import { CLOSING_PERIODICITIES, EmployeeInput } from './types'

/** Mesmo critério da API: letras (inclusive acentuadas), espaços, `'`, `.` e `-`. */
const NAME_PATTERN = /^[\p{L}\s'.-]+$/u

/** Uma mensagem por campo: vazio → obrigatório; preenchido → formato. */
const calendarDate = (label: string, { optional = false } = {}) =>
  z.string().superRefine((value, ctx) => {
    if (value === '') {
      if (!optional) {
        ctx.addIssue({ code: 'custom', message: `Informe a data de ${label}` })
      }
      return
    }
    if (!parseCalendarDate(value)) {
      ctx.addIssue({ code: 'custom', message: `Data de ${label} inválida` })
    }
  })

const time = (label: string) =>
  z.string().superRefine((value, ctx) => {
    if (value === '') {
      ctx.addIssue({ code: 'custom', message: `Informe o ${label}` })
    } else if (!TIME_PATTERN.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: `Informe o ${label} no formato HH:mm`,
      })
    }
  })

/** Valores do formulário: inputs nativos devolvem string, `''` = campo vazio. */
export const employeeFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === '') {
          ctx.addIssue({ code: 'custom', message: 'O nome é obrigatório' })
        } else if (/\d/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'O nome não pode conter números',
          })
        } else if (!NAME_PATTERN.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'O nome deve conter apenas letras',
          })
        }
      }),
    admissionDate: calendarDate('admissão'),
    dismissalDate: calendarDate('demissão', { optional: true }),
    workStartTime: time('início do expediente'),
    workEndTime: time('fim do expediente'),
    closingPeriodicity: z.enum(CLOSING_PERIODICITIES, {
      errorMap: () => ({ message: 'Selecione a periodicidade do fechamento' }),
    }),
  })
  .superRefine((values, ctx) => {
    if (
      values.dismissalDate &&
      parseCalendarDate(values.admissionDate) &&
      parseCalendarDate(values.dismissalDate) &&
      values.dismissalDate < values.admissionDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dismissalDate'],
        message: 'A data de demissão não pode ser anterior à data de admissão',
      })
    }

    const start = timeToMinutes(values.workStartTime)
    const end = timeToMinutes(values.workEndTime)
    if (start !== null && end !== null && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['workEndTime'],
        message: 'O fim do expediente não pode ser anterior ao início',
      })
    }
  })

export type EmployeeFormInput = z.input<typeof employeeFormSchema>
export type EmployeeFormValues = z.output<typeof employeeFormSchema>

export const emptyEmployeeForm: EmployeeFormInput = {
  name: '',
  admissionDate: '',
  dismissalDate: '',
  workStartTime: '',
  workEndTime: '',
  // O select começa sem seleção; o schema exige uma das opções.
  closingPeriodicity: '' as EmployeeFormInput['closingPeriodicity'],
}

/** Formulário → payload da API (`''` vira `null`). */
export function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  return { ...values, dismissalDate: values.dismissalDate || null }
}

/** Registro da API → valores iniciais do formulário de edição. */
export function toEmployeeFormInput(
  employee: EmployeeInput,
): EmployeeFormInput {
  return {
    name: employee.name,
    admissionDate: employee.admissionDate,
    dismissalDate: employee.dismissalDate ?? '',
    workStartTime: employee.workStartTime,
    workEndTime: employee.workEndTime,
    closingPeriodicity: employee.closingPeriodicity,
  }
}

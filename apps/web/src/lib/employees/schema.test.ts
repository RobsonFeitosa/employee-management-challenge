import { employeeFormSchema, toEmployeeInput } from './schema'

const valid = {
  name: 'José Antônio',
  admissionDate: '2024-01-10',
  dismissalDate: '',
  workStartTime: '08:00',
  workEndTime: '17:30',
  closingPeriodicity: 'Mensal',
}

function errorPaths(values: Record<string, unknown>) {
  const result = employeeFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'))
}

describe('employeeFormSchema', () => {
  it('accepts valid values with and without dismissal date', () => {
    expect(errorPaths(valid)).toEqual([])
    expect(errorPaths({ ...valid, dismissalDate: '2024-01-10' })).toEqual([])
  })

  it('requires every mandatory field', () => {
    expect(
      errorPaths({
        name: '',
        admissionDate: '',
        dismissalDate: '',
        workStartTime: '',
        workEndTime: '',
        closingPeriodicity: '',
      }),
    ).toEqual([
      'name',
      'admissionDate',
      'workStartTime',
      'workEndTime',
      'closingPeriodicity',
    ])
  })

  it('rejects names with digits', () => {
    expect(errorPaths({ ...valid, name: 'Ana 2' })).toEqual(['name'])
  })

  it('rejects dismissal before admission on the dismissal field', () => {
    expect(errorPaths({ ...valid, dismissalDate: '2024-01-09' })).toEqual([
      'dismissalDate',
    ])
  })

  it('rejects work end before start on the end field', () => {
    expect(errorPaths({ ...valid, workEndTime: '07:00' })).toEqual([
      'workEndTime',
    ])
  })

  it('reports cross-field errors even when other fields are invalid', () => {
    expect(
      errorPaths({
        ...valid,
        name: 'Ana 1',
        dismissalDate: '2023-12-01',
        workEndTime: '07:00',
      }),
    ).toEqual(['name', 'dismissalDate', 'workEndTime'])
  })

  it('rejects periodicity outside the enum', () => {
    expect(errorPaths({ ...valid, closingPeriodicity: 'Quinzenal' })).toEqual([
      'closingPeriodicity',
    ])
  })

  it('trims the name and maps an empty dismissal date to null', () => {
    const parsed = employeeFormSchema.parse({ ...valid, name: '  Ana  ' })
    expect(toEmployeeInput(parsed)).toMatchObject({
      name: 'Ana',
      dismissalDate: null,
    })
  })
})

describe('employeeFormSchema messages', () => {
  const messageFor = (values: Record<string, unknown>) => {
    const result = employeeFormSchema.safeParse({ ...valid, ...values })
    return result.success ? null : result.error.issues[0].message
  }

  it('uses one specific message per problem', () => {
    expect(messageFor({ name: '' })).toBe('O nome é obrigatório')
    expect(messageFor({ name: 'Ana 2' })).toBe('O nome não pode conter números')
    expect(messageFor({ name: 'Ana@' })).toBe(
      'O nome deve conter apenas letras',
    )
    expect(messageFor({ admissionDate: '2023-02-29' })).toBe(
      'Data de admissão inválida',
    )
    expect(messageFor({ workStartTime: '8h' })).toBe(
      'Informe o início do expediente no formato HH:mm',
    )
  })
})

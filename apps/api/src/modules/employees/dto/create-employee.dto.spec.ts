import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { ClosingPeriodicity } from '../enums/closing-periodicity.enum'
import { CreateEmployeeDto } from './create-employee.dto'

const valid = {
  name: 'José Antônio',
  admissionDate: '2024-01-10',
  workStartTime: '08:00',
  workEndTime: '17:30',
  closingPeriodicity: ClosingPeriodicity.TRIMESTRAL,
}

async function errorsFor(payload: Record<string, unknown>) {
  const errors = await validate(plainToInstance(CreateEmployeeDto, payload))
  return errors.map((e) => e.property)
}

describe('CreateEmployeeDto', () => {
  it('accepts a valid payload with and without dismissal date', async () => {
    expect(await errorsFor(valid)).toEqual([])
    expect(await errorsFor({ ...valid, dismissalDate: '2024-01-10' })).toEqual(
      [],
    )
    expect(await errorsFor({ ...valid, dismissalDate: '' })).toEqual([])
    expect(await errorsFor({ ...valid, dismissalDate: null })).toEqual([])
  })

  it('requires every mandatory field', async () => {
    expect(await errorsFor({})).toEqual([
      'name',
      'admissionDate',
      'workStartTime',
      'workEndTime',
      'closingPeriodicity',
    ])
  })

  it('rejects names with digits or only spaces', async () => {
    expect(await errorsFor({ ...valid, name: 'Ana 3' })).toEqual(['name'])
    expect(await errorsFor({ ...valid, name: '   ' })).toEqual(['name'])
  })

  it('rejects impossible or badly formatted dates', async () => {
    expect(await errorsFor({ ...valid, admissionDate: '2024-02-30' })).toEqual([
      'admissionDate',
    ])
    expect(await errorsFor({ ...valid, admissionDate: '10/01/2024' })).toEqual([
      'admissionDate',
    ])
  })

  it('rejects dismissal before admission', async () => {
    expect(await errorsFor({ ...valid, dismissalDate: '2024-01-09' })).toEqual([
      'dismissalDate',
    ])
  })

  it('rejects work end before work start and malformed times', async () => {
    expect(await errorsFor({ ...valid, workEndTime: '07:59' })).toEqual([
      'workEndTime',
    ])
    expect(await errorsFor({ ...valid, workStartTime: '24:00' })).toEqual([
      'workStartTime',
    ])
  })

  it('rejects periodicity outside the enum', async () => {
    expect(
      await errorsFor({ ...valid, closingPeriodicity: 'Quinzenal' }),
    ).toEqual(['closingPeriodicity'])
  })
})

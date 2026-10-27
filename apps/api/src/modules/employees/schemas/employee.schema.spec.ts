import { model } from 'mongoose'

import { ClosingPeriodicity } from '../enums/closing-periodicity.enum'
import { Employee, EmployeeSchema } from './employee.schema'

const EmployeeModel = model(Employee.name, EmployeeSchema)

const valid = {
  name: 'Maria da Silva',
  admissionDate: new Date('2024-01-10'),
  workStartTime: '08:00',
  workEndTime: '17:30',
  closingPeriodicity: ClosingPeriodicity.MENSAL,
}

describe('EmployeeSchema', () => {
  it('accepts a valid employee without dismissal date', async () => {
    await expect(new EmployeeModel(valid).validate()).resolves.toBeUndefined()
  })

  it('rejects names containing digits', async () => {
    await expect(
      new EmployeeModel({ ...valid, name: 'Maria 2' }).validate(),
    ).rejects.toThrow(/name/)
  })

  it('rejects dismissal before admission', async () => {
    const doc = new EmployeeModel({
      ...valid,
      dismissalDate: new Date('2024-01-09'),
    })
    await expect(doc.validate()).rejects.toThrow(/demissão/)
  })

  it('accepts dismissal on the admission day', async () => {
    const doc = new EmployeeModel({
      ...valid,
      dismissalDate: new Date('2024-01-10'),
    })
    await expect(doc.validate()).resolves.toBeUndefined()
  })

  it('rejects work end before work start', async () => {
    const doc = new EmployeeModel({
      ...valid,
      workStartTime: '18:00',
      workEndTime: '08:00',
    })
    await expect(doc.validate()).rejects.toThrow(/expediente/)
  })

  it('rejects malformed times and unknown periodicity', async () => {
    await expect(
      new EmployeeModel({ ...valid, workStartTime: '8h' }).validate(),
    ).rejects.toThrow(/workStartTime/)
    await expect(
      new EmployeeModel({
        ...valid,
        closingPeriodicity: 'Quinzenal',
      }).validate(),
    ).rejects.toThrow(/closingPeriodicity/)
  })
})

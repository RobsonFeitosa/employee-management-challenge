import { Connection } from 'mongoose'

import { parseCalendarDate } from '../../../modules/employees/employee.constants'
import { ClosingPeriodicity } from '../../../modules/employees/enums/closing-periodicity.enum'
import {
  Employee,
  EmployeeSchema,
} from '../../../modules/employees/schemas/employee.schema'
import { Migration } from '../migration.interface'

const employees = [
  {
    name: 'Ana Beatriz Souza',
    admissionDate: '2021-02-01',
    dismissalDate: null,
    workStartTime: '08:00',
    workEndTime: '17:00',
    closingPeriodicity: ClosingPeriodicity.MENSAL,
  },
  {
    name: 'Carlos Eduardo Lima',
    admissionDate: '2022-06-15',
    dismissalDate: '2024-03-29',
    workStartTime: '09:00',
    workEndTime: '18:30',
    closingPeriodicity: ClosingPeriodicity.BIMESTRAL,
  },
  {
    name: 'Fernanda Oliveira',
    admissionDate: '2023-01-09',
    dismissalDate: null,
    workStartTime: '07:30',
    workEndTime: '16:15',
    closingPeriodicity: ClosingPeriodicity.TRIMESTRAL,
  },
  {
    name: "João D'Ávila",
    admissionDate: '2023-08-21',
    dismissalDate: '2025-01-31',
    workStartTime: '13:00',
    workEndTime: '19:00',
    closingPeriodicity: ClosingPeriodicity.SEMESTRAL,
  },
  {
    name: 'Mariana Costa',
    admissionDate: '2024-11-04',
    dismissalDate: null,
    workStartTime: '10:00',
    workEndTime: '19:45',
    closingPeriodicity: ClosingPeriodicity.ANUAL,
  },
]

/** Dados iniciais para a interface não abrir vazia. Não mexe em um banco que já tem funcionários. */
export const seedEmployees: Migration = {
  name: '001-seed-employees',
  async up(connection: Connection) {
    const EmployeeModel = connection.model(Employee.name, EmployeeSchema)

    if (await EmployeeModel.exists({})) {
      return
    }

    await EmployeeModel.insertMany(
      employees.map((employee) => ({
        ...employee,
        admissionDate: parseCalendarDate(employee.admissionDate),
        dismissalDate: employee.dismissalDate
          ? parseCalendarDate(employee.dismissalDate)
          : null,
      })),
    )
  },
}

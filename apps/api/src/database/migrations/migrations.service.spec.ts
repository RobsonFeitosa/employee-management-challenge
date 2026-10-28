import { getConnectionToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connect, Connection } from 'mongoose'

import { ClosingPeriodicity } from '../../modules/employees/enums/closing-periodicity.enum'
import {
  Employee,
  EmployeeSchema,
} from '../../modules/employees/schemas/employee.schema'
import { Migration } from './migration.interface'
import { MIGRATIONS, MIGRATIONS_TOKEN } from './migrations'
import { MigrationsService } from './migrations.service'

describe('MigrationsService', () => {
  let mongod: MongoMemoryServer
  let connection: Connection

  const createService = async (migrations: Migration[]) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MigrationsService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: MIGRATIONS_TOKEN, useValue: migrations },
      ],
    }).compile()

    return moduleRef.get(MigrationsService)
  }

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    connection = (await connect(mongod.getUri())).connection
  })

  afterEach(() => connection.dropDatabase())

  afterAll(async () => {
    await connection.close()
    await mongod.stop()
  })

  it('applies pending migrations in order and only once', async () => {
    const calls: string[] = []
    const migration = (name: string): Migration => ({
      name,
      up: async () => {
        calls.push(name)
      },
    })
    const service = await createService([migration('a'), migration('b')])

    await expect(service.run()).resolves.toEqual(['a', 'b'])
    await expect(service.run()).resolves.toEqual([])
    expect(calls).toEqual(['a', 'b'])
  })

  it('does not record a migration that fails', async () => {
    const service = await createService([
      {
        name: 'broken',
        up: async () => {
          throw new Error('boom')
        },
      },
    ])

    await expect(service.run()).rejects.toThrow('boom')
    await expect(
      connection.collection('migrations').countDocuments(),
    ).resolves.toBe(0)
  })

  describe('001-seed-employees', () => {
    const EmployeeModel = () => connection.model(Employee.name, EmployeeSchema)

    it('seeds valid employees into an empty database', async () => {
      const service = await createService(MIGRATIONS)

      await service.run()

      const employees = await EmployeeModel().find()
      expect(employees.length).toBeGreaterThan(0)
      expect(employees.some((e) => e.dismissalDate === null)).toBe(true)
      expect(employees.some((e) => e.dismissalDate !== null)).toBe(true)
    })

    it('keeps existing employees untouched', async () => {
      await EmployeeModel().create({
        name: 'Maria da Silva',
        admissionDate: new Date('2024-03-01'),
        workStartTime: '08:00',
        workEndTime: '17:30',
        closingPeriodicity: ClosingPeriodicity.MENSAL,
      })
      const service = await createService(MIGRATIONS)

      await service.run()

      await expect(EmployeeModel().countDocuments()).resolves.toBe(1)
    })
  })
})

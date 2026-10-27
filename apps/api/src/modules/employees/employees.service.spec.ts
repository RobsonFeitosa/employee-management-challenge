import { BadRequestException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connect, Connection, Types } from 'mongoose'

import { CreateEmployeeDto } from './dto/create-employee.dto'
import { EmployeesService } from './employees.service'
import { ClosingPeriodicity } from './enums/closing-periodicity.enum'
import { Employee, EmployeeSchema } from './schemas/employee.schema'

const payload = (overrides: Partial<CreateEmployeeDto> = {}) => ({
  name: 'Maria da Silva',
  admissionDate: '2024-03-01',
  workStartTime: '08:00',
  workEndTime: '17:30',
  closingPeriodicity: ClosingPeriodicity.MENSAL,
  ...overrides,
})

describe('EmployeesService', () => {
  let mongod: MongoMemoryServer
  let connection: Connection
  let service: EmployeesService

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    connection = (await connect(mongod.getUri())).connection
    const model = connection.model(Employee.name, EmployeeSchema)

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getModelToken(Employee.name), useValue: model },
      ],
    }).compile()

    service = moduleRef.get(EmployeesService)
  })

  afterEach(() => connection.dropDatabase())

  afterAll(async () => {
    await connection.close()
    await mongod.stop()
  })

  it('creates an employee and serializes calendar dates', async () => {
    const created = await service.create(
      payload({ dismissalDate: '2024-12-31' }),
    )

    expect(created.toJSON()).toMatchObject({
      id: expect.any(String),
      name: 'Maria da Silva',
      admissionDate: '2024-03-01',
      dismissalDate: '2024-12-31',
    })
  })

  it('lists employees ordered by admission date ascending', async () => {
    await service.create(
      payload({ name: 'Carla', admissionDate: '2023-05-10' }),
    )
    await service.create(payload({ name: 'Ana', admissionDate: '2021-01-02' }))
    await service.create(
      payload({ name: 'Bruno', admissionDate: '2022-07-15' }),
    )

    const names = (await service.findAll()).map((e) => e.name)
    expect(names).toEqual(['Ana', 'Bruno', 'Carla'])
  })

  it('returns an empty list when there are no employees', async () => {
    await expect(service.findAll()).resolves.toEqual([])
  })

  it('updates all fields and clears the dismissal date', async () => {
    const created = await service.create(
      payload({ dismissalDate: '2024-06-01' }),
    )

    const updated = await service.update(
      created.id,
      payload({ name: 'Maria Souza', dismissalDate: null }),
    )

    expect(updated.toJSON()).toMatchObject({
      name: 'Maria Souza',
      dismissalDate: null,
    })
  })

  it('maps schema validation errors to 400 on update', async () => {
    const created = await service.create(payload())

    await expect(
      service.update(created.id, payload({ dismissalDate: '2020-01-01' })),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('removes an employee', async () => {
    const created = await service.create(payload())

    await service.remove(created.id)

    await expect(service.findAll()).resolves.toEqual([])
  })

  it('throws 404 for unknown or malformed ids', async () => {
    const unknownId = new Types.ObjectId().toString()

    await expect(service.findOne(unknownId)).rejects.toBeInstanceOf(
      NotFoundException,
    )
    await expect(service.remove('nao-e-um-id')).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})

import { INestApplication } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Types } from 'mongoose'
import request from 'supertest'

import { AppModule } from '../src/app.module'
import { setupApp } from '../src/app.setup'

const payload = (overrides: Record<string, unknown> = {}) => ({
  name: 'Maria da Silva',
  admissionDate: '2024-03-01',
  dismissalDate: null,
  workStartTime: '08:00',
  workEndTime: '17:30',
  closingPeriodicity: 'Mensal',
  ...overrides,
})

describe('/employees (e2e)', () => {
  let mongod: MongoMemoryServer
  let app: INestApplication
  let connection: Connection

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    process.env.MONGODB_URI = mongod.getUri()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    setupApp(app)
    await app.init()

    connection = app.get(getConnectionToken())
  })

  afterEach(() => connection.dropDatabase())

  afterAll(async () => {
    await app.close()
    await mongod.stop()
  })

  const http = () => request(app.getHttpServer())

  it('GET returns an empty list when there are no employees', async () => {
    await http().get('/employees').expect(200).expect([])
  })

  it('POST creates an employee and returns the serialized record', async () => {
    const { body } = await http()
      .post('/employees')
      .send(payload({ dismissalDate: '2024-12-31' }))
      .expect(201)

    expect(body).toEqual({
      id: expect.any(String),
      name: 'Maria da Silva',
      admissionDate: '2024-03-01',
      dismissalDate: '2024-12-31',
      workStartTime: '08:00',
      workEndTime: '17:30',
      closingPeriodicity: 'Mensal',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('POST returns 400 with messages for invalid payloads', async () => {
    const { body } = await http()
      .post('/employees')
      .send(
        payload({
          name: 'Maria 2',
          dismissalDate: '2024-01-01',
          workEndTime: '07:00',
          closingPeriodicity: 'Quinzenal',
        }),
      )
      .expect(400)

    expect(body.message).toEqual(
      expect.arrayContaining([
        'O nome não pode conter números',
        'A data de demissão não pode ser anterior à data de admissão',
        'O fim do expediente não pode ser anterior ao início',
      ]),
    )
    expect(body.message).toHaveLength(4)
  })

  it('POST rejects unknown fields', async () => {
    await http()
      .post('/employees')
      .send(payload({ salary: 1000 }))
      .expect(400)
  })

  it('GET lists employees ordered by admission date ascending', async () => {
    for (const [name, admissionDate] of [
      ['Carla', '2023-05-10'],
      ['Ana', '2021-01-02'],
      ['Bruno', '2022-07-15'],
    ]) {
      await http()
        .post('/employees')
        .send(payload({ name, admissionDate }))
        .expect(201)
    }

    const { body } = await http().get('/employees').expect(200)
    expect(body.map((e: { name: string }) => e.name)).toEqual([
      'Ana',
      'Bruno',
      'Carla',
    ])
  })

  it('GET /:id, PUT and DELETE work on an existing employee', async () => {
    const { body: created } = await http()
      .post('/employees')
      .send(payload())
      .expect(201)

    await http()
      .get(`/employees/${created.id}`)
      .expect(200)
      .expect((res) => expect(res.body.id).toBe(created.id))

    const { body: updated } = await http()
      .put(`/employees/${created.id}`)
      .send(payload({ name: 'Maria Souza', dismissalDate: '2025-01-15' }))
      .expect(200)
    expect(updated).toMatchObject({
      name: 'Maria Souza',
      dismissalDate: '2025-01-15',
    })

    await http().delete(`/employees/${created.id}`).expect(204)
    await http().get(`/employees/${created.id}`).expect(404)
  })

  it('PUT validates the full payload', async () => {
    const { body: created } = await http()
      .post('/employees')
      .send(payload())
      .expect(201)

    await http()
      .put(`/employees/${created.id}`)
      .send({ name: 'Só o nome' })
      .expect(400)
  })

  it('returns 404 for unknown and malformed ids', async () => {
    const unknownId = new Types.ObjectId().toString()

    await http().get(`/employees/${unknownId}`).expect(404)
    await http().put(`/employees/${unknownId}`).send(payload()).expect(404)
    await http().delete('/employees/nao-e-um-id').expect(404)
  })
})

import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

import { Migration } from './migration.interface'
import { MIGRATIONS_TOKEN } from './migrations'

interface AppliedMigration {
  name: string
  appliedAt: Date
}

@Injectable()
export class MigrationsService {
  private readonly logger = new Logger(MigrationsService.name)

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(MIGRATIONS_TOKEN) private readonly migrations: Migration[],
  ) {}

  /** Aplica, em ordem, as migrations ainda não registradas. Retorna os nomes aplicados. */
  async run(): Promise<string[]> {
    const collection =
      this.connection.collection<AppliedMigration>('migrations')
    await collection.createIndex({ name: 1 }, { unique: true })

    const applied = new Set(
      (await collection.find().toArray()).map(({ name }) => name),
    )
    const executed: string[] = []

    for (const migration of this.migrations) {
      if (applied.has(migration.name)) {
        continue
      }

      await migration.up(this.connection)
      await collection.insertOne({
        name: migration.name,
        appliedAt: new Date(),
      })
      this.logger.log(`Migration aplicada: ${migration.name}`)
      executed.push(migration.name)
    }

    return executed
  }
}

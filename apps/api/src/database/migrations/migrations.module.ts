import { Module } from '@nestjs/common'

import { MIGRATIONS, MIGRATIONS_TOKEN } from './migrations'
import { MigrationsService } from './migrations.service'

@Module({
  providers: [
    MigrationsService,
    { provide: MIGRATIONS_TOKEN, useValue: MIGRATIONS },
  ],
  exports: [MigrationsService],
})
export class MigrationsModule {}

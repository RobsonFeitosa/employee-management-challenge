import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { setupApp } from './app.setup'
import { MigrationsService } from './database/migrations/migrations.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  setupApp(app)

  // Só aqui (e não nos e2e): os testes partem de um banco vazio.
  await app.get(MigrationsService).run()

  await app.listen(process.env.PORT ?? 3333)
}

bootstrap()

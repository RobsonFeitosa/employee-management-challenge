import { INestApplication, ValidationPipe } from '@nestjs/common'

/** Configuração compartilhada entre `main.ts` e os testes e2e. */
export function setupApp(app: INestApplication) {
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
}

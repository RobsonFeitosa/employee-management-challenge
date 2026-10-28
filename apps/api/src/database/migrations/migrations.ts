import { Migration } from './migration.interface'
import { seedEmployees } from './scripts/001-seed-employees'

export const MIGRATIONS_TOKEN = Symbol('MIGRATIONS')

/** Ordem de execução. Nunca renomeie nem remova uma migration já aplicada. */
export const MIGRATIONS: Migration[] = [seedEmployees]

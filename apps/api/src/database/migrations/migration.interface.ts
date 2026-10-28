import { Connection } from 'mongoose'

/** Alteração de banco aplicada uma única vez, na ordem da lista `MIGRATIONS`. */
export interface Migration {
  /** Identificador único e estável: é o que fica registrado na coleção `migrations`. */
  name: string
  up(connection: Connection): Promise<void>
}

// .d.ts vem de definição de tipos
// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      created_at: string
      updated_at: string
    }

    meals: {
      id: string
      name: string
      description: string
      datetime: Date
      is_on_diet: boolean
      user_id: string
      created_at: string
      updated_at: string
    }
  }
}

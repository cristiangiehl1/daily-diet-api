import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().min(1, { message: 'name is required.' }),
      email: z.string().email({ message: 'Invalid email address.' }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 char long.' }),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const emailAlreadyExists = await knex('users').where({ email }).first()

    if (emailAlreadyExists) {
      return reply.status(400).send({ error: 'E-mail already exists' })
    }

    const hashedPassword = await await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
    })

    return reply.status(201).send()
  })
}

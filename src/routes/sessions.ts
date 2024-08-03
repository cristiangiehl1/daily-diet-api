import { compare } from 'bcrypt'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function sessionRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createSessionBodySchema = z.object({
      email: z.string().email({ message: 'Invalid email address.' }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 char long.' }),
    })

    const { email, password } = createSessionBodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.status(400).send({ message: 'Invalid e-mail or password.' })
    }

    const passwordIsValid = await compare(password, user.password)

    if (!passwordIsValid) {
      return reply.status(400).send({ message: 'Invalid e-mail or password.' })
    }

    const userId = request.cookies.userId

    if (!userId) {
      reply.cookie('userId', user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    if (userId !== user.id) {
      reply.cookie('userId', user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return reply.status(201).send()
  })
}

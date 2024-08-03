import { randomUUID } from 'node:crypto'

import { hash } from 'bcrypt'
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

    const hashedPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
    })

    return reply.status(201).send()
  })

  app.get('/metrics', async (request) => {
    const userId = request.cookies.userId

    const mealsList = await knex('meals')
      .where({ user_id: userId })
      .select()
      .orderBy('datetime', 'desc')

    console.log(mealsList)

    const mealsQuantity = mealsList.length
    const mealsOnDiet = mealsList.filter((meal) => meal.is_on_diet)

    const mealsOffDiet = mealsList.filter((meal) => !meal.is_on_diet)

    const { bestOnDietSequence } = mealsList.reduce(
      (acc, meal) => {
        if (meal.is_on_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return {
      mealsQuantity,
      mealsOnDietQuantity: mealsOnDiet.length,
      mealsOffDietQuantity: mealsOffDiet.length,
      bestOnDietSequence,
    }
  })
}

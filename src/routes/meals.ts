import { randomUUID } from 'node:crypto'

import { format } from 'date-fns'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { CheckUserIfUserIsAuthenticated } from '../middlewares/authenticated'

export async function mealsRoutes(app: FastifyInstance) {
  function parseDateTime(dateString: string, timeString: string) {
    const [day, month, year] = dateString.split('/')
    const [hours, minutes] = timeString.split(':')
    const fullYear = year.length === 2 ? `20${year}` : year
    const formattedDate = `${fullYear}-${month}-${day}T${hours}:${minutes}:00`
    return new Date(formattedDate)
  }

  app.addHook('preHandler', async (request, reply) => {
    CheckUserIfUserIsAuthenticated(request, reply)
  })

  // create a new meal
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string().min(1, { message: 'Please provide a name.' }),
      description: z.string().optional(),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in HH:MM format.',
      }),
      date: z
        .string()
        .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/, {
          message: 'Provide a valid date format.',
        }),
      isOnDiet: z.boolean(),
    })

    const { name, description, isOnDiet, date, time } =
      createMealBodySchema.parse(request.body)

    const userId = request.cookies.userId

    const combinedDateTime = parseDateTime(date, time)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet: isOnDiet,
      datetime: combinedDateTime,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  // list all user meals
  app.get('/', async (request) => {
    const userId = request.cookies.userId

    const mealsList = await knex('meals').where({ user_id: userId }).select()

    return { mealsList }
  })

  // get a specific user meal
  app.get('/:mealId', async (request, reply) => {
    const getMealParamsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where({ id: mealId }).first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    return { meal }
  })

  // update a specific user meal
  app.put('/:mealId', async (request, reply) => {
    const updateMealParamsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = updateMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where({ id: mealId }).first()

    if (!meal) {
      return reply.status(400).send({ message: 'Meal not found.' })
    }

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
          message: 'Time must be in HH:MM format.',
        })
        .optional(),
      date: z
        .string()
        .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/, {
          message: 'Provide a valid date format.',
        })
        .optional(),
      isOnDiet: z.boolean().optional(),
    })

    const { name, description, date, time, isOnDiet } =
      updateMealBodySchema.parse(request.body)

    let combinedDateTime = meal.datetime

    if (date && !time) {
      const timeUnformatted = new Date(meal.datetime).toLocaleTimeString()
      const hours = timeUnformatted.split(':')[0]
      const minutes = timeUnformatted.split(':')[1]

      const time = `${hours}:${minutes}`

      combinedDateTime = parseDateTime(date, time)
    }

    if (!date && time) {
      const date = new Date(meal.datetime).toLocaleDateString()

      combinedDateTime = parseDateTime(date, time)
    }

    if (date && time) {
      combinedDateTime = parseDateTime(date, time)
    }

    await knex('meals')
      .where({ id: mealId })
      .update({
        name: name ?? meal.name,
        description: description ?? meal.description,
        datetime: combinedDateTime,
        is_on_diet: isOnDiet ?? meal.is_on_diet,
        updated_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      })

    return reply.status(200).send()
  })

  // delete a specific user meal
  app.delete('/:mealId', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = deleteMealParamsSchema.parse(request.params)

    await knex('meals').where({ id: mealId }).delete()

    return reply.status(200).send()
  })
}

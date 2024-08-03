import { execSync } from 'node:child_process'

import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('Meals routes', () => {
  let cookies: string

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')

    await request(app.server).post('/users').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'test@example.com',
      password: 'password123',
    })

    cookies = authResponse.headers['set-cookie']
  })

  it('should be able to create a new meal', async () => {
    const response = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'bife a role',
        description: 'comida deliciosa jumbo edition',
        isOnDiet: true,
        date: '12/02/2024',
        time: '08:24',
      })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all user meals', async () => {
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'meal example 01',
      description: 'description example 01',
      isOnDiet: true,
      date: '12/02/2024',
      time: '08:24',
    })

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(response.body.mealsList).toEqual([
      expect.objectContaining({
        name: 'meal example 01',
        description: 'description example 01',
        is_on_diet: 1,
      }),
    ])
  })

  it.only('should be able to get an specific meal', async () => {
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'meal example 01',
      description: 'description example 01',
      isOnDiet: true,
      date: '12/02/2024',
      time: '08:24',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.mealsList[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'meal example 01',
        description: 'description example 01',
        is_on_diet: 1,
      }),
    )
  })
})

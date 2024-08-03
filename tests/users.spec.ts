import { execSync } from 'node:child_process'

import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create an account', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '12345678',
    })

    expect(response.statusCode).toEqual(201)
  })
})

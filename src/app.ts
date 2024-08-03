import cookies from '@fastify/cookie'
import fastify from 'fastify'

import { mealsRoutes } from './routes/meals'
import { sessionRoutes } from './routes/sessions'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.register(cookies)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(sessionRoutes, {
  prefix: 'sessions',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server is running! 🚀')
  })

import fastify from 'fastify'

import { usersRoutes } from './routes/users'

const app = fastify()

app.register(usersRoutes, {
  prefix: 'users',
})

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server is running! 🚀')
  })

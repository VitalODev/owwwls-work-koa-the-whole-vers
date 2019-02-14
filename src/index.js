import Koa from 'koa'
import mongoose from 'mongoose'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'
import cors from '@koa/cors'
import favicon from 'koa-favicon'
import serve from 'koa-static'
import config from './config'
import router from './router'

const app = new Koa()

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useCreateIndex: true })

app.use(bodyParser())

app.use(passport.initialize())

app.use(cors())

app.use(favicon('./public/favicon.ico'))

app.use(serve('public'))

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    if (e.status) {
      ctx.status = e.status
    } else {
      ctx.status = 500
    }
  }
})

app.use(router.routes())

app.listen(config.port)

import Router from 'koa-router'
import passport from 'passport'
import jwtSign from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import config from './config'
import authentication from './authentication'
import User from './models/user'

const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = 'main page'
})

router.post('/registration', async (ctx) => {
  try {
    await User.create(ctx.request.body)

    await passport.authenticate('local', (err, user, info, status) => {
      if (err) {
        throw err
      } else if (!user) {
        ctx.body = { info }
      } else {
        const payload = {
          id: user.id
        }

        const token = jwtSign.sign(payload, config.jwtSecret)

        ctx.body = { token: token, email: user.email, defense: user.cookieSalt }
      }
    })(ctx)
  } catch (err) {
    if (err.name != 'MongoError') throw err
    ctx.throw(400)
  }
})

router.post('/login', async (ctx) => {
  await passport.authenticate('local', (err, user, info, status) => {
    if (err) {
      throw err
    } else if (!user) {
      ctx.body = { info }
    } else {
      const payload = {
        id: user.id
      }

      const token = jwtSign.sign(payload, config.jwtSecret)

      ctx.body = { token: token, email: user.email, defense: user.cookieSalt }
    }
  })(ctx)
})

router.post('/contact', async (ctx) => {
  const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secureConnection: true,
    port: 587,
    auth: {
      user: config.gmail.user,
      pass: config.gmail.password
    }
  })

  ctx.body = await smtpTransport.sendMail({
    to: 'vitalodev@gmail.com',
    subject: ctx.request.body.subject,
    text: ctx.request.body.message + ' \n\nfrom ' + ctx.request.body.email
  })
})

router.post('/custom', async (ctx) => {
  await passport.authenticate('jwt', (err, user) => {
    if (user) {
      if (user.cookieSalt == ctx.request.body.defense) {
        ctx.body = 'hello ' + user.email
      } else {
        ctx.throw(400, 'Something is wrong with your cookie!')
      }
    } else if (!user) {
      ctx.body = 'No such user'
    } else if (err) {
      ctx.status = err.status
    }
  })(ctx)
})

export default router

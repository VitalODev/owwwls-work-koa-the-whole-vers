import passport from 'passport'
import LocalStrategy from 'passport-local'
import jwt from 'passport-jwt'
import config from './config'
import User from './models/user'

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
},
(email, password, done) => {
  User.findOne({ email }, (err, user) => {
    if (err) {
      return done(err)
    }

    if (!user) {
      return done(null, false, { message: 'User with this name doesn\'t exist' })
    }

    if (!user.checkPassword(password)) {
      return done(null, false, { message: 'Password is incorrect' })
    }

    return done(null, user)
  })
}))

passport.use(new jwt.Strategy({
  jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret
},
(payload, done) => {
  User.findById(payload.id, (err, user) => {
    if (err) {
      return done(err)
    }

    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
}))

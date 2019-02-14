import mongoose from 'mongoose'
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
  userName: String,
  email: {
    type: String,
    required: true,
    unique: 'Such e-mail exists',
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  cookieSalt: {
    type: String,
    required: true
  }
})

userSchema.virtual('password')
  .set(function (password) {
    this._plainPassword = password
    this.passwordSalt = crypto.randomBytes(32).toString('base64')
    this.cookieSalt = crypto.randomBytes(8).toString('base64')
    this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 2, 32, 'sha256'.toString('base64'))
  })

  .get(function () {
    return this._plainPassword
  })

userSchema.methods.checkPassword = function (password) {
  return crypto.pbkdf2Sync(password, this.passwordSalt, 2, 32, 'sha256'.toString('base64')) == this.passwordHash
}

export default mongoose.model('User', userSchema)

const functions = require('firebase-functions')
const main = require('../index')

Object.entries(functions.config().env || {}).forEach(([key, val]) => {
  process.env[key] = val
})
process.env.FIREBASE = 'true'

module.exports = main

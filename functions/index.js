const functions = require('firebase-functions')
const admin = require('firebase-admin')

const main = require('./src/usage/firebase')

admin.initializeApp()

const cors = (callback) => (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET,POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204).send('')
    return
  }

  callback(req, res)
}

exports.runStrategy = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540,
  })
  .https.onRequest(
    cors(async (request, response) => {
      response.send(await main())
    })
  )

exports.registerValidationCode = functions.region('europe-west1').https.onRequest(
  cors(async (request, response) => {
    const { password, code } = request.body

    if (password != functions.config().env.OCTOBER_PASSWORD) {
      response.send({ error: 'Wrong password!' })
      return
    }

    await admin.database().ref('/validation_code').set(code)
    response.send({ ok: true })
  })
)

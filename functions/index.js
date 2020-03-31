const functions = require('firebase-functions')
const admin = require('firebase-admin')

const main = require('./src/usage/firebase')

admin.initializeApp()

exports.runStrategy = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540
  })
  .https.onRequest(async (request, response) => {
    // CORS
    response.set('Access-Control-Allow-Origin', '*')
    response.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
    response.set('Access-Control-Allow-Headers', '*')

    response.send(await main())
  })

exports.registerValidationCode = functions
  .region('europe-west1')
  .https.onRequest(async (request, response) => {
    // CORS
    response.set('Access-Control-Allow-Origin', '*')
    response.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
    response.set('Access-Control-Allow-Headers', '*')

    const { password, code } = request.body

    if (password != functions.config().env.OCTOBER_PASSWORD) {
      response.send({ error: 'Wrong password!' })
      return
    }

    await admin
      .database()
      .ref('/validation_code')
      .set(code)
    response.send({ ok: true })
  })

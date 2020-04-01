const functions = require('firebase-functions')
const main = require('../index')

Object.entries(functions.config().env || {}).forEach(([key, val]) => {
  process.env[key] = val
})
process.env.FIREBASE = 'true'

module.exports = () =>
  main().then(async log => {
    if (process.env.FIREBASE) {
      const admin = require('firebase-admin')
      await admin
        .database()
        .ref('/logs/' + new Date().toISOString())
        .set(log)

      if (process.env.IFTTT_KEY && log.strategyActions.length > 0) {
        await fetch(
          `https://maker.ifttt.com/trigger/october_eu_bot_summary/with/key/${process.env.IFTTT_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              value1: `Projects available: ${log.availableProjects.length}`,
              value2: `Strategy actions: ${log.strategyActions
                .map(a => `${a.projectName} (${a.amount / 100}€ / ${a.status})`)
                .join(', ')}`,
              value3: `Remaining credits: ${log.remainingCredits / 100}€`
            })
          }
        )
      }
    }

    return log
  })

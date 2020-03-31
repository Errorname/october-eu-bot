const { getStrategy } = require('./strategies')
const { getSession, secureSession } = require('./session')
const { getAvailableProjects, makeInvestment } = require('./projects')
const fetch = require('node-fetch')

const main = async () => {
  const strategy = getStrategy()

  const session = await getSession()
  let availableCredits = session.user.credit

  console.log('👌 User session is correctly set up!')

  const projects = await getAvailableProjects(session)

  console.log(`🔍 ${projects.length} available projects found...`)

  if (projects.length == 0) {
    return {
      availableProjects: [],
      strategyActions: [],
      remainingCredits: availableCredits
    }
  }

  const actions = strategy(projects)

  console.log(`💰 ${actions.length} lending actions with strategy "${process.env.STRATEGY}"!\n`)

  for (let action of actions) {
    if (availableCredits < action.amount) {
      action.status = 'unsufficient-credits'
      console.warn(
        `  ❌ Unsufficient credits (${availableCredits / 100}€) to lend ${action.amount /
          100}€ to project ${projects.find(p => p.id == action.projectId).name}`
      )
      continue
    }

    try {
      await makeInvestment(session, action)
    } catch (e) {
      action.status = e.message
      console.warn(
        `  ❌ Unknown error while lending to project ${
          projects.find(p => p.id == action.projectId).name
        }`
      )
      console.error(e)
      continue
    }

    action.status = 'successful'
    console.log(
      `  ✅ Lended ${action.amount / 100}€ to project ${
        projects.find(p => p.id == action.projectId).name
      }`
    )
    availableCredits -= action.amount
  }

  return {
    availableProjects: projects,
    strategyActions: actions,
    remainingCredits: availableCredits
  }
}

module.exports = () =>
  main().then(async log => {
    if (process.env.FIREBASE) {
      const admin = require('firebase-admin')
      await admin
        .database()
        .ref('/logs/' + Date.now())
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
                .map(a => `${a.projectName} (${a.amount / 100}€)`)
                .join(', ') || 'None'}`,
              value3: `Remaining credits: ${log.remainingCredits / 100}€`
            })
          }
        )
      }
    }

    return log
  })

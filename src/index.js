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
      remainingCredits: availableCredits,
    }
  }

  const actions = strategy(projects)

  console.log(`💰 ${actions.length} lending actions with strategy "${process.env.STRATEGY}"!\n`)

  for (let action of actions) {
    if (availableCredits < action.amount) {
      action.status = 'unsufficient-credits'
      console.warn(
        `  ❌ Unsufficient credits (${availableCredits / 100}€) to lend ${
          action.amount / 100
        }€ to project ${projects.find((p) => p.id == action.projectId).name}`
      )
      continue
    }

    try {
      await makeInvestment(session, action)
    } catch (e) {
      action.status = e.message
      console.warn(
        `  ❌ Unknown error while lending to project ${
          projects.find((p) => p.id == action.projectId).name
        }`
      )
      console.error(e)
      continue
    }

    action.status = 'successful'
    console.log(
      `  ✅ Lended ${action.amount / 100}€ to project ${
        projects.find((p) => p.id == action.projectId).name
      }`
    )
    availableCredits -= action.amount
  }

  return {
    availableProjects: projects,
    strategyActions: actions,
    remainingCredits: availableCredits,
  }
}

module.exports = main

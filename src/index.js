const { getStrategy } = require('./strategies')
const { getSession } = require('./session')
const { getAvailableProjects, makeInvestment } = require('./projects')

require('dotenv').config()

const main = async () => {
  console.log()

  const strategy = getStrategy()

  const session = await getSession()

  console.log('👌 October session is correctly set up!')

  const projects = await getAvailableProjects(session)

  console.log(`🔍 ${projects.length} available projects found...`)

  if (projects.length == 0) {
    console.log()
    return
  }

  const actions = strategy(projects)

  console.log(`💰 ${actions.length} lending actions with strategy "${process.env.STRATEGY}"!\n`)

  let availableCredits = session.user.credit

  for (let action of actions) {
    if (availableCredits < action.amount) {
      console.warn(
        `  ❌ Unsufficient credit (${availableCredits / 100}€) to lend ${action.amount /
          100}€ to project ${projects.find(p => p.id == action.projectId).name}`
      )
      continue
    }

    try {
      await makeInvestment(session, action)
    } catch (e) {
      console.warn(
        `  ❌ Unknown error while lending to project ${
          projects.find(p => p.id == action.projectId).name
        }`
      )
      console.error(e)
      continue
    }

    console.log(
      `  ✅ Lended ${action.amount / 100}€ to project ${
        projects.find(p => p.id == action.projectId).name
      }`
    )
    availableCredits -= action.amount
    investmentCount++
  }

  console.log()
}

main()

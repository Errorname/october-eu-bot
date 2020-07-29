const fetch = require('./fetch')
const { getInvestments } = require('./user')
const { secureSession } = require('./session')

const getAllProjects = async (session) =>
  fetch(session)('https://api.october.eu/projects?limit=15&offset=0').then((data) => data.projects)

const getAvailableProjects = async (session) => {
  const projects = await getAllProjects(session)
  const investments = await getInvestments(session)

  return projects.filter((project) => {
    // Confidential
    if (project.confidential) return false

    // Lease (reserved to institutional)
    if (project.type == 'lease') return false

    // Not available for french investors
    if (project.deny.includes('fr')) return false

    // Expired
    if (Date.parse(project.expirationDate) <= Date.now()) return false

    // Not opened yet
    if (Date.parse(project.openingDate) > Date.now()) return false

    // Completed
    if (project.totalInvested >= project.amount) return false

    // Already invested
    if (investments.find((investment) => investment.project.id == project.id)) return false

    return true
  })
}

const makeInvestment = async (session, { projectId, amount }) => {
  await secureSession(session)

  let transaction = await fetch(session)('https://api.october.eu/transactions', {
    type: 'investment',
    amount: amount / 100,
    user: null, //?
    project: projectId,
    contract: null, //?
    contractsExport: null, //?
    invoice: null, //?
    letter: null, //?
  }).then(({ error, transaction }) => {
    if (error) throw Error(error)
    return transaction
  })

  while (['processing', 'draft'].includes(transaction.status)) {
    transaction = await fetch(session)(`https://api.october.eu/transactions/${transaction.id}`)
  }

  if (transaction.status != 'incoming') {
    throw new Error(`unknown-transaction-status: ${transaction.status}`)
  }
}

module.exports = {
  getAllProjects,
  getAvailableProjects,
  makeInvestment,
}

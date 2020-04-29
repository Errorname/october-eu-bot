const fetch = require('./fetch')

const getSummary = (session) =>
  fetch(session)(`https://api.october.eu/users/${session.user.id}/summary?finsquare=true`)

const getInvestments = async (session) => {
  const summary = await getSummary(session)

  return summary.investments
}

module.exports = {
  getSummary,
  getInvestments,
}

/**
 * Name: THRESHOLD
 * Params: rate, amount
 * Description: Lend {amount}€ to a project if the rate is >= {rate}%
 */

module.exports = strategies => {
  strategies['THRESHOLD'] = (rate, amount) => {
    if (rate === undefined || !amount) {
      throw new Error(
        `Invalid parameters (amount: ${amount}, rate: ${rate}) for strategy "THRESHOLD"`
      )
    }

    rate = parseInt(rate, 10)
    amount = parseInt(amount, 10)

    return projects =>
      projects
        .filter(project => project.rate >= rate)
        .map(project => ({
          projectId: project.id,
          amount: amount * 100
        }))
  }
}

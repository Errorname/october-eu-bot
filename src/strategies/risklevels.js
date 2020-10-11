/**
 * Name: RISKLEVELS
 * Params: array of risk levels, amount
 * Description: Lend {amount}€ to a project if the risk level is in the {risk levels} array
 */

module.exports = (strategies) => {
  strategies['RISKLEVELS'] = (riskLevels, amount) => {
    if (
      riskLevels === undefined ||
      !riskLevels.match(/^\[(?:(A|B\+|B|C),)*(A|B\+|B|C)\]$/) ||
      !amount
    ) {
      throw new Error(
        `Invalid parameters (riskLevels: ${riskLevels}, amount: ${amount}) for strategy "RISKLEVEL"`
      )
    }

    riskLevels = riskLevels.slice(1, -1).split(',')
    amount = parseInt(amount, 10)

    console.log(riskLevels)

    return (projects) =>
      projects
        .filter((project) => riskLevels.includes(project.grade))
        .map((project) => ({
          projectId: project.id,
          projectName: project.name,
          amount: amount * 100,
        }))
  }
}

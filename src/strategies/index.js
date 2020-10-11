const strategies = {}

require('./threshold')(strategies)
require('./risklevels')(strategies)

const getStrategy = () => {
  const [_, name, params] = (process.env.STRATEGY || '').match(/(\w*)\((.*)\)/) || []
  const strategy = strategies[name]

  if (!strategy) {
    throw new Error(`Unknown strategy "${name}"`)
  }

  const parsedParams = (params || '').match(/\[.*\]|\".*\"|\d+/g).map((s) => s.trim())

  return strategy(...parsedParams)
}

module.exports = {
  strategies,
  getStrategy,
}

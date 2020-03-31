const strategies = {}

require('./threshold')(strategies)

const getStrategy = () => {
  const [_, name, params] = (process.env.STRATEGY || '').match(/(\w*)\((.*)\)/) || []
  const strategy = strategies[name]

  if (!strategy) {
    throw new Error(`Unknown strategy "${name}"`)
  }

  return strategy(...(params || '').split(',').map(s => s.trim()))
}

module.exports = {
  strategies,
  getStrategy
}

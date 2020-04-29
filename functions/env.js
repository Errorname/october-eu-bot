// Transform .env file into .env.json file
const fs = require('fs')

fs.readFile('../.env', 'utf8', (err, data) => {
  if (err) throw err

  const env = data
    .split('\n')
    .filter((x) => x)
    .reduce((acc, line) => {
      const key = line.substr(0, line.indexOf('='))
      const val = line.substr(line.indexOf('=') + 1)
      if (key && val) {
        acc[key] = val
      }
      return acc
    }, {})

  fs.writeFile('.env.json', JSON.stringify(env, null, 2), 'utf8', (err) => {
    if (err) throw err
  })
})

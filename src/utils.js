const fs = require('fs')

const readFile = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(JSON.parse(data))))
  )

const writeFile = (path, content) =>
  new Promise((resolve, reject) =>
    fs.writeFile(path, JSON.stringify(content), 'utf8', err => (err ? reject(err) : resolve()))
  )

module.exports = {
  readFile,
  writeFile
}

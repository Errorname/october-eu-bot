const fs = require('fs')

require('dotenv').config({
  path: '../.env'
})

const readFile = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(data)))
  )
const writeFile = (path, content) =>
  new Promise((resolve, reject) =>
    fs.writeFile(path, content, 'utf8', err => (err ? reject(err) : resolve()))
  )

const build = async () => {
  const template = await readFile('./template.html')

  const index = template.replace(/\[FIREBASE_APP_ID\]/g, process.env.FIREBASE_APP_ID)

  await writeFile('./public/index.html', index)
}

build()

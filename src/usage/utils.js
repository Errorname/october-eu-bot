const fs = require('fs')
const path = require('path')

const readFile = (path) =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(JSON.parse(data))))
  )

const writeFile = (path, content) =>
  new Promise((resolve, reject) =>
    fs.writeFile(path, JSON.stringify(content, null, 2), 'utf8', (err) =>
      err ? reject(err) : resolve()
    )
  )

const readSession = () => {
  if (process.env.CLI) {
    return readFile(path.join(__dirname, '../../data/session.json'))
  } else {
    const admin = require('firebase-admin')
    return admin
      .database()
      .ref('/session')
      .once('value')
      .then((snapshot) => snapshot.val())
  }
}

const writeSession = (session) => {
  if (process.env.CLI) {
    return writeFile(path.join(__dirname, '../../data/session.json'), session)
  } else {
    const admin = require('firebase-admin')
    return admin.database().ref('/session').set(session)
  }
}

const waitCode = async () => {
  if (process.env.CLI) {
    const inquirer = require('inquirer')
    return (
      await inquirer.prompt([
        {
          name: 'code',
          message: 'SMS code for validation:',
        },
      ])
    ).code
  } else {
    const admin = require('firebase-admin')

    const code = await new Promise((resolve) =>
      admin
        .database()
        .ref('/validation_code')
        .on('value', (snapshot) => {
          const val = snapshot.val()
          if (val) {
            resolve(val)
          }
        })
    )

    await admin.database().ref('/validation_code').remove()

    return code
  }
}

module.exports = {
  readSession,
  writeSession,
  waitCode,
}

const path = require('path')
const inquirer = require('inquirer')
const fetch = require('./fetch')
const { readFile, writeFile } = require('./utils')

const getSession = async () => {
  let session

  try {
    session = await readFile(path.join(__dirname, '../data/session.json'))

    session = await fetch(session)('https://api.october.eu/sessions/' + session.id).then(data => {
      if (data.errors || data.error) {
        throw new Error('Invalid session')
      }
      return data.session
    })
  } catch {
    console.log('Missing or invalid session. Requesting a new one...')

    session = await fetch(null)('https://api.october.eu/sessions', {
      email: process.env.OCTOBER_EMAIL,
      password: process.env.OCTOBER_PASSWORD,
      user: null //?
    }).then(data => data.session)
  }

  if (!session) {
    throw new Error('???')
  }

  await writeFile(path.join(__dirname, '../data/session.json'), session)

  return session
}

const secureSession = async session => {
  // Already secured
  if (session.secured) return

  await fetch(session)(`https://api.october.eu/sessions/${session.id}`, { secured: true })

  const { code } = await inquirer.prompt([
    {
      name: 'code',
      message: 'SMS Code for validation:'
    }
  ])

  await fetch(session)(`https://api.october.eu/sessions/${session.id}`, { code })
}

module.exports = { getSession, secureSession }

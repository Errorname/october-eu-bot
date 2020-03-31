const fetch = require('./fetch')
const { readSession, writeSession, waitCode } = require('./usage/utils')

const getSession = async () => {
  let session

  try {
    // Get cached session
    session = await readSession()

    // Fetch updated session
    session = await fetch(session)('https://api.october.eu/sessions/' + session.id).then(data => {
      if (data.errors || data.error) {
        throw new Error('Invalid session')
      }
      return data.session
    })
  } catch (e) {
    console.log('Missing or invalid session. Requesting a new one...')

    // Fetch new session
    session = await fetch(null)('https://api.october.eu/sessions', {
      email: process.env.OCTOBER_EMAIL,
      password: process.env.OCTOBER_PASSWORD,
      user: null //?
    }).then(data => data.session)
  }

  if (!session) {
    throw new Error('No session available')
  }

  // Update session
  await writeSession(session)

  return session
}

const secureSession = async session => {
  // Already secured
  if (session.secured) return

  await fetch(session)(`https://api.october.eu/sessions/${session.id}`, { secured: true })

  const code = await waitCode()

  await fetch(session)(`https://api.october.eu/sessions/${session.id}`, { code })

  session.secured = true
}

module.exports = { getSession, secureSession }

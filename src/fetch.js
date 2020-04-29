const fetch = require('node-fetch')

module.exports = (session) => (url, body) => {
  const headers = {}

  if (session) {
    headers.sessionToken = session.token
    headers.userId = session.user.id
  }
  if (body) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  return fetch(url, {
    method: body ? 'POST' : 'GET',
    headers,
    body,
  }).then((r) => r.json())
}

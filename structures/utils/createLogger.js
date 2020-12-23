const debug = require('debug')
const { name } = require('../../package.json')

module.exports = domain => {
  if (domain) {
    return debug(`${name}:${domain}`)
  }

  return debug(name)
}

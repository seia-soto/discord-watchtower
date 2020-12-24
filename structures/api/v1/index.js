const resultsHandler = require('./results')

module.exports = (app, opts, done) => {
  app.register(resultsHandler, { prefix: '/results' })

  done()
}

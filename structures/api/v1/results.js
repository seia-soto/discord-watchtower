const config = require('../../../config')
const { knex } = require('../../database')

const getResults = {
  method: 'GET',
  url: '/',
  schema: {
    query: {
      from: {
        type: 'integer'
      }
    }
  },
  handler: async (request, reply) => {
    const from = Number(request.query.from)

    if (!from) return []

    const results = await knex('results')
      .select('*')
      .whereBetween('updatedAt', [from - config.api.serverResultsIn, from])

    return results
  }
}

module.exports = (app, opts, done) => {
  app.route(getResults)

  done()
}

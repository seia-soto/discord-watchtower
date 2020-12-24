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
      .whereBetween('updatedAt', [from - (5 * 1000 * 60), from])

    return results
  }
}

module.exports = (app, opts, done) => {
  app.route(getResults)

  done()
}

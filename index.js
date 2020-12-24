const fastify = require('fastify')
const schedule = require('node-schedule')
const qs = require('qs')
const {
  api,
  database,
  tasks,
  utils
} = require('./structures')
const config = require('./config')

const debug = utils.createLogger()

module.exports = (async () => {
  if (process.env.WORKER) {
    debug('initiating as worker process')
    debug('creating database tables which not exist')

    await database.createTables()

    debug('querying registered regions')

    const availableRegions = await database.knex('regions').select('name')

    for (let i = 0, l = availableRegions.length; i < l; i++) {
      availableRegions[i] = availableRegions[i].name
    }

    debug('currently following regions are registered:', availableRegions.join(', '))

    for (let i = 0, l = config.discord.regions.length; i < l; i++) {
      const region = config.discord.regions[i]

      if (availableRegions.indexOf(region) < 0) {
        debug('registering region:', region)

        await database.knex('regions')
          .insert({
            name: region
          })
      }

      debug('registering scheduled task for region:', region)

      const task = tasks.updatePing(region)

      task()

      schedule.scheduleJob('* * * * *', task)
    }

    tasks.removeOldRecords()

    schedule.scheduleJob('*/5 * * * *', tasks.removeOldRecords)
  } else {
    debug('creating api server session on port:', config.api.port)

    const server = fastify({
      querystringParser: q => qs.parse(q)
    })

    server.get('/', async (req, reply) => reply.redirect('https://github.com/Seia-Soto/discord-watchtower'))

    const versions = Object.keys(api)

    for (let i = 0, l = versions.length; i < l; i++) {
      const version = versions[i]

      debug('registering api version:', version)

      server.register(api[version], { prefix: '/api/' + version })
    }

    try {
      await server.listen(config.api.port)
    } catch (error) {
      debug('error while processing request:', error)
    }
  }
})()

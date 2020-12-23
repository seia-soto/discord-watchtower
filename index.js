const schedule = require('node-schedule')
const {
  database,
  tasks,
  utils
} = require('./structures')
const config = require('./config')

const debug = utils.createLogger()

module.exports = (async () => {
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
})()

const config = require('../../config')
const { knex } = require('../database')
const { createLogger } = require('../utils')

const debug = createLogger('tasks/removeOldRecords')

let lockd = 0

module.exports = async () => {
  try {
    if (lockd) {
      debug('current process is locked and already running, passing scheduled task')

      return
    }

    lockd = 1

    debug('deleting old records')

    await knex('results')
      .where('updatedAt', '<=', Date.now() - config.discord.keepRecordsIn)
      .delete()
  } catch (error) {
    debug('error while running task:', error)
  }

  lockd = 0
}

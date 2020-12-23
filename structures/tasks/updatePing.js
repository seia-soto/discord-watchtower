const { promises: dns } = require('dns')
const ping = require('ping')
const config = require('../../config')
const { knex } = require('../database')
const { createLogger } = require('../utils')

const debug = createLogger('tasks/updatePing')

const cache = {
  domains: [],
  updatedAt: 0
}
let lockd = 0

module.exports = region => {
  debug('initiating with region:', region)

  return async () => {
    try {
      if (lockd) {
        debug('current process is locked and already running, passing scheduled task')

        return
      }

      lockd = 1

      const [termStart, termEnd] = config.discord.searchRange
      const insertions = []

      if (!cache.domains.length && (cache.updatedAt + config.discord.domainCache) < Date.now()) {
        for (let i = termStart, l = termEnd + 1; i < l; i++) {
          const domain = `${region}${i}.discord.gg`

          debug('querying domain on dns:', domain)

          try {
            const result = await dns.lookup(domain)

            if (result.address) {
              cache.domains.push(domain)
            }
          } catch (error) {
            debug('domain not available or error on network:', error.code)
          }
        }
      }

      // NOTE: Use min as the term;
      const startTime = (Date.now() / (60 * 1000)).toFixed(0) * (60 * 1000)

      debug('timestamp to log:', startTime)
      debug('pinging domains:', cache.domains.length)

      for (let i = 0, l = cache.domains.length; i < l; i += config.discord.pingCount) {
        const sets = cache.domains.slice(i, i + config.discord.pingCount)
        const workers = []

        for (let k = 0, s = sets.length; k < s; k++) {
          workers.push(ping.promise.probe(sets[k], config.discord.pingOptions))
        }

        const results = await Promise.allSettled(workers)

        for (let k = 0, s = results.length; k < s; k++) {
          const domain = sets[k]

          if (results[k].status === 'rejected') {
            debug(domain, 'is not available from our network yet')

            insertions.push({
              error: true,
              alive: false,
              region,
              domain,
              updatedAt: startTime
            })

            continue
          }

          const result = results[k].value

          if (result.alive) {
            debug(domain, 'has replied with latency:', result.avg)

            insertions.push({
              error: false,
              alive: true,
              region,
              domain,
              ip: result.numeric_host,
              latency: result.avg,
              packetLost: Number(result.packetLost),
              updatedAt: startTime
            })
          } else {
            debug(domain, 'is not alive from our network yet')

            insertions.push({
              error: false,
              alive: false,
              region,
              domain,
              updatedAt: startTime
            })
          }
        }
      }

      cache.domains.updatedAt = startTime

      debug('inserting results to database')

      for (let i = 0, l = insertions.length; i < l; i += 10) {
        await knex('results')
          .insert(insertions.slice(i, i + 10))
      }

      debug('done')
    } catch (error) {
      debug('error while running task:', error)
    }

    lockd = 0
  }
}

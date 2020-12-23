module.exports = table => {
  table.increments()

  table.boolean('error')
  table.boolean('alive')
  table.integer('region')
  table.string('domain', 2048)
  table.string('ip', 256)
  table.float('latency')
  table.float('packetLost')
  table.datetime('updatedAt')
}

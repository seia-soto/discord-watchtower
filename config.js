module.exports = {
  api: {
    port: 7003
  },
  database: {
    client: 'sqlite3',
    connection: {
      filename: 'data.db'
    },
    useNullAsDefault: true
  },
  discord: {
    regions: [
      'south-korea'
    ],
    searchRange: [1, 999],
    domainCache: 5 * 60 * 1000, // NOTE: 5 min
    pingCount: 16,
    pingOptions: {
      timeout: 2.5,
      packetSize: 56,
      min_reply: 2
    },
    keepRecordsIn: 7 * 1000 * 60 * 60 * 24
  }
}

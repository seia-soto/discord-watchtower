# Seia-Soto/discord-watchtower

A simple SQLite based API server to check pings of Discord's voice servers.

## Table of Contents

- [Installation](#Installation)
- [Config](#Config)
- [API](#API)

----

# Installation

To install, use git to clone this repository and install dependencies.

```sh
git clone https://github.com/Seia-Soto/discord-watchtower

yarn
```

I am providing `ecosystem.config.js` for pm2 cluster.
In cluster mode, only **1** worker instance will be enabled and work to get pings.

```sh
pm2 start ecosystem.config.js
```

# Config

As there is nothing to secure in config file, you can just edit provided `config.js` file.

```js
module.exports = {
  api: {
    port: 7003,
    serverResultsIn: 5 * 60 * 1000 // NOTE: 5 min
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
```

# API

API specification to provide information to frontend part.

## `/v1`

### `GET: /results`

Get results from database in **past 5 mins**.
This value that how many records you grab in the time is configurable in config file with ms (`config.api.serverResultsIn`).

- Request

```
http://localhost:7003/api/v1/results?from={% now 'millis', '' %}
```

- Response

```json
[
  {
    "id": 1,
    "error": 0,
    "alive": 0,
    "region": "south-korea",
    "domain": "south-korea21.discord.gg",
    "ip": null,
    "latency": null,
    "packetLost": null,
    "updatedAt": 1608773700000
  },
  ...
]
```

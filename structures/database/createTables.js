const tables = require('./tables')
const knex = require('./knex')

module.exports = async () => {
  const names = Object.keys(tables)

  for (let i = 0, l = names.length; i < l; i++) {
    const name = names[i]

    if (!await knex.schema.hasTable(name)) {
      await knex.schema.createTable(name, tables[name])
    }
  }
}

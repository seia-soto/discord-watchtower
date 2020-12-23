module.exports = table => {
  table.increments()
  table.string('name', 64)
}

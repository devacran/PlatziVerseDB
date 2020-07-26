'use strict'
// Sequelize es un ORM para Nodejs que nos permite manipular varias bases
// de datos SQL de una manera bastante sencilla, entre estas bases de datos
// podemos encontrar: mysql, sqlite, postgres, mssql.
const Sequelize = require('sequelize')
let sequelize = null
// Se hace un singleton
module.exports = function setupDatabase (config) {
  // si no existe la instancia la crea, y ya existe la devuelve
  if (!sequelize) {
    sequelize = new Sequelize(config)
  }
  return sequelize
}

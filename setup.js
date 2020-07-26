//ESte script de cofiguracion es para cuando ejecutemos nuestro proyecto por primea vez
//Va a crear la db, y los modelos
//Cada vez que lo ejecutemos va a borrar la db si ya exsiste, y creara todo de 0
'use strict'

const debug = require('debug')('platziverse:db:setup')//se le pasa en que archivo estoy haciendo debug
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')


//Para lanzar un prompt al usuario en la consola
const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }
  ])

  if (!answer.setup) {
    return console.log('Nothing happened :)')
  }

  //Es lo que necesita sequelize para funcionar
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres', //para especificar a sequelize cual db usar, porque trabaja con varias
    logging: s => debug(s), //cada msj que llegue aqui lo manda por debug
    setup: true
  }

  await db(config).catch(handleFatalError) //aqui cacho por si hay un error

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1) //para matar el proceso retornando codigo uno
}


setup()

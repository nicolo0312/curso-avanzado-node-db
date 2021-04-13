'use strict'

const debug = require('debug')('platziverse:db:setup')
const db = require('./index')
const inquirer = require('inquirer')
const chalk = require('chalk')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([{
    type: 'confirm',
    name: 'setup',
    messagge: 'This will destroy yout database, are you sure?'
  }])
  console.log(prompt, ' lkdjglaskjdglkajsdlkj')
  if (!answer.setup) {
    return console.log(chalk.blue('Nothing happened :)'))
  }
  const config = require('./config-db ')
  await db(config).catch(handleFatalError)
  console.log('Success!')
  process.exit(0)

  function handleFatalError (err) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
  }
}
setup()

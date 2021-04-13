'use strict'

const setUpDatabase = require('./lib/db')
const setUpAgentModel = require('./models/agents')
const setUpMetricModel = require('./models/metric')
const setUpAgent = require('./lib/agent')
const setUpMetric = require('./lib/metric')
const defaults = require('defaults')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })
  const sequelize = setUpDatabase(config)
  const AgentModel = setUpAgentModel(config)
  const MetricModel = setUpMetricModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const Agent = setUpAgent(AgentModel)
  const Metric = setUpMetric(MetricModel, AgentModel)

  return {
    Agent: Agent,
    Metric: Metric
  }
}

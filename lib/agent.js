'use strict'

module.exports = function setupAgent (agentModel) {
  function findById (id) {
    return agentModel.findById(id)
  }
  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }
    const agentExist = await agentModel.findOne(cond)
    if (agentExist) {
      const updated = await agentModel.update(agent, cond)
      return updated ? agentModel.findOne(cond) : agentExist
    }

    const result = await agentModel.create(agent)
    return result.toJSON()
  }

  function findByUuid (uuid) {
    return agentModel.findOne({
      where: {
        uuid
      }
    })
  }

  function findAll () {
    return agentModel.findAll()
  }

  function findConnected () {
    return agentModel.findAll({
      where: {
        connected: true
      }
    })
  }

  function findByUsername (username) {
    return agentModel.findAll({
      where: {
        username,
        connected: true
      }
    })
  }
  return {
    findById,
    createOrUpdate,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  }
}

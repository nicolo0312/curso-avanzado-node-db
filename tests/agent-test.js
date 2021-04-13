'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('../tests/fixtures/agent')
const agents = require('../models/agents')
const agent = require('../lib/agent')

const config = {
  loggin: function () {

  }
}
const metricStub = {
  belongsTo: sinon.spy()

}

const id = 1
const uuid = 'yyy-yyy-yyy'
let agentStub = null
let db = null
let sandbox = null
const single = Object.assign({}, agentFixtures.single)
const connectedArgs = { where: { connected: true } }
const usernameArgs = { where: { username: 'platzi', connected: true } }
const uuidArgs = {
  where: {
    uuid
  }
}
const newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  agentStub = {
    hasMany: sandbox.spy()
  }

  // model create Stub
  agentStub.create = sandbox.stub()
  agentStub.create.withArgs(newAgent).returns(Promise.resolve({ toJSON () { return newAgent } }))

  // model update Stub
  agentStub.update = sandbox.stub()
  agentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // model findOne Stub
  agentStub.findOne = sandbox.stub()
  agentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // model findById Stub
  agentStub.findById = sandbox.stub()
  agentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // model findAll Stub
  agentStub.findAll = sandbox.stub()
  agentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  agentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  agentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  const setUpDatabase = proxyquire('../index', {
    './models/agents': () => agentStub,
    './models/metric': () => metricStub
  })
  db = await setUpDatabase(config)
})

test.afterEach(t => {
  sandbox && sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(agentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(agentStub.hasMany.calledWith(metricStub), 'argument should be the metricModel ')
  t.true(metricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(metricStub.belongsTo.calledWith(agentStub), 'argument should be the agentModel')
})

test.serial('AgentFindById', async t => {
  const agent = await db.Agent.findById(id)
  t.true(agentStub.findById.called, 'find should be called on model')
  t.true(agentStub.findById.calledOnce, 'find should be called once')
  t.true(agentStub.findById.calledWith(id), 'findById should be called with id')
  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('AgentCreateOrUpdate', async t => {
  const agent = await db.Agent.createOrUpdate(single)
  t.true(agentStub.findOne.called, 'findOne should be called on model')
  t.true(agentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(agentStub.update.calledOnce, 'update should be called once')
  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('AgentCreateOrUpdate -- new', async t => {
  const agent = await db.Agent.createOrUpdate(newAgent)
  t.true(agentStub.findOne.called, 'findOne should be called')
  t.true(agentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(agentStub.findOne.calledWith({ where: { uuid: newAgent.uuid } }))
  t.true(agentStub.create.called, 'create should be called')
  t.true(agentStub.create.calledOnce, 'create should be called once')
  t.true(agentStub.create.calledWith(newAgent), 'create should be called with new agent')
  t.deepEqual(agent, newAgent, 'agent should be the same')
})

test.serial('AgentFindConnected', async t => {
  const agent = await db.Agent.findConnected()
  t.true(agentStub.findAll.called, 'findAll should be called')
  t.true(agentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(agentStub.findAll.calledWith(connectedArgs))
  t.is(agent.length, agentFixtures.connected.length, 'agent should be the same')
  t.deepEqual(agent, agentFixtures.connected, 'agent should be the same')
})

test.serial('AgentFindAll', async t => {
  const agent = await db.Agent.findAll()
  t.true(agentStub.findAll.called, 'findAll should be called')
  t.true(agentStub.findAll.calledOnce, 'findAll should be called once')
  t.is(agent.length, agentFixtures.all.length, 'agent should be the same')
  t.deepEqual(agent, agentFixtures.all, 'agent should be the same')
})

test.serial('AgentFindUsername', async t => {
  const agent = await db.Agent.findByUsername('platzi')
  t.true(agentStub.findAll.called, 'findAll should be called')
  t.true(agentStub.findAll.calledOnce, 'findALl should be called once')
  t.true(agentStub.findAll.calledWith(usernameArgs), 'findAll should be called with usernameArgs')
  t.deepEqual(agent, agentFixtures.platzi, 'agent should be the same')
})

test.serial('AgentFindByUuid', async t => {
  const agent = await db.Agent.findByUuid(uuid)
  t.true(agentStub.findOne.called, 'findOne should be called ')
  t.true(agentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(agentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid')
  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
})

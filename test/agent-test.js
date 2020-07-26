// <----------Tests para el modelo de Agente ---------------->
/* Para probarlo hay que configurar la db con una de pruebas en este caso con sqlite
Y hay que implementar unos mocks y stubs con sinon */
"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const agentFixtures = require("./fixtures/agent");
//le pasamos la configuracion a la base de datos
//solo la de logging, no se xq, lo demas lo toma del default la cual es sqlite
let config = {
  logging() {}
};
let newAgent = {
  uuid: "123-123-123",
  name: "test",
  username: "test",
  hostname: "test",
  pid: 0,
  connected: false
};
let connectedArgs = {
  where: { connected: true }
};

let usernameArgs = {
  where: { username: "platzi", connected: true }
};

let id = 1;
let uuid = "yyy-yyy-yyy";
let uuidArgs = {
  where: { uuid }
};
let MetricStub = {
  belongsTo: sinon.spy() //Es el mock del modelo de Metric, aqui se les llaman stubs jaja
};
let single = Object.assign({}, agentFixtures.single); //hago una copia del mock
let AgentStub = null; //Es el mock del modelo de Agente
let db = null;
let sandbox = null; //el sandbox sirve para crear spys en un entorno o algo asi

// <----Esto se ejecuta antes de cada prueba----->
test.beforeEach(async () => {
  sandbox = sinon.createSandbox(); //crea el sandbox
  //Crea el mock del Agente
  AgentStub = {
    hasMany: sandbox.spy()
  };

  // Model create Stub
  AgentStub.create = sandbox.stub();
  AgentStub.create.withArgs(newAgent).returns(
    Promise.resolve({
      toJSON() {
        return newAgent;
      }
    })
  );
  // Model update Stub
  AgentStub.update = sandbox.stub();
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

  // Model findById Stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)));

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all));
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected));
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.platzi));

  //setupDatabase ejecuta el index el cual configura la db, modelos y servicios
  //proxyquire intercepta las rutas de los requires y los sustituye por lo que le pongas
  const setupDatabase = proxyquire("../", {
    "./models/agent": () => AgentStub, //Se sustituyen por los mock
    "./models/metric": () => MetricStub
  });
  //Hace la conexion con la db
  db = await setupDatabase(config);
});
// <----Esto se ejecuta despues de cada prueba----->
test.afterEach(() => {
  sandbox && sandbox.restore(); //despues de cada prueba se resetea el sandbox
});

// <-----Inician las pruebas------>

test("Agent", t => {
  //prueba que el modelo de agente exista
  t.truthy(db.Agent, "Agent service should exist");
});

test.serial("Setup", t => {
  // prueba la configuracion
  //prueba que el metodo hasMany se haya llamado
  t.true(AgentStub.hasMany.called, "AgentModel.hasMany was executed");
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    "Argument should be the MetricModel"
  );
  t.true(MetricStub.belongsTo.called, "MetricModel.belongsTo was executed");
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    "Argument should be the AgentModel"
  );
});

//<-----Pruebas de los metodos del servicio de agente---->
test.serial("Agent#findById", async t => {
  let agent = await db.Agent.findById(id); //Esta funcion tendra dentro AgentStub en lugar del verdaero
  t.true(AgentStub.findById.called, "findById should be called on model"); //Se comprueba que si se haya llamado
  t.true(AgentStub.findById.calledOnce, "findById should be called once");
  t.true(
    AgentStub.findById.calledWith(id),
    "findById should be called with specified id"
  );
  //compruebo que la funcion devuelva lo mismo que el mock
  t.deepEqual(agent, agentFixtures.byId(id), "should be the same");
});

test.serial("Agent#createOrUpdate - new agent", async t => {
  let agent = await db.Agent.createOrUpdate(newAgent);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledOnce, "findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith({
      where: { uuid: newAgent.uuid }
    }),
    "findOne should be called with uuid args"
  );
  t.true(AgentStub.create.called, "create should be called on model");
  t.true(AgentStub.create.calledOnce, "create should be called once");
  t.true(
    AgentStub.create.calledWith(newAgent),
    "create should be called with specified args"
  );

  t.deepEqual(agent, newAgent, "agent should be the same");
});

test.serial("Agent#createOrUpdate - when agent already exists", async t => {
  console.log("im single", single);
  let agent = await db.Agent.createOrUpdate(single);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledTwice, "findOne should be called twice");
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    "findOne should be called with uuid args"
  );
  t.true(AgentStub.update.called, "agent.update called on model");
  t.true(AgentStub.update.calledOnce, "agent.update should be called once");
  t.true(
    AgentStub.update.calledWith(single),
    "agent.update should be called with specified args"
  );

  t.deepEqual(agent, single, "agent should be the same");
});

test.serial("Agent#findByUuid", async t => {
  let agent = await db.Agent.findByUuid(uuid);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledOnce, "findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    "findOne should be called with uuid args"
  );

  t.deepEqual(agent, agentFixtures.byUuid(uuid), "agent should be the same");
});

test.serial("Agent#findAll", async t => {
  let agents = await db.Agent.findAll();

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(),
    "findAll should be called without args"
  );

  t.is(
    agents.length,
    agentFixtures.all.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.all, "agents should be the same");
});

test.serial("Agent#findConnected", async t => {
  let agents = await db.Agent.findConnected();

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(connectedArgs),
    "findAll should be called with connected args"
  );

  t.is(
    agents.length,
    agentFixtures.connected.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.connected, "agents should be the same");
});

test.serial("Agent#findByUsername", async t => {
  let agents = await db.Agent.findByUsername("platzi");

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(usernameArgs),
    "findAll should be called with username args"
  );

  t.is(
    agents.length,
    agentFixtures.platzi.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.platzi, "agents should be the same");
});

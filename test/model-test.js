"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const AgentStub = {
  hasMany: sinon.spy()
};
const uuid = "yyy-yyy-yyy";
let MetricStub = null;
let sandbox = null;
let db = null;
const config = {
  logging() {}
};

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  MetricStub = {
    belongsTo: sandbox.spy()
  };
  MetricStub.findAll = sandbox.stub();
  const setupDatabase = proxyquire("../", {
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub
  });
  db = await setupDatabase(config);
});

test("Metric", t => {
  t.truthy(db.Metric, "Metric service should exists");
});

test.serial("Setup", t => {
  t.true(MetricStub.belongsTo.called, "MetricModel.belongsTo was executed");
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    "Argument should be the Agent Model"
  );
  t.true(AgentStub.hasMany.called, "AgentModel.hasMany was executed");
});

test.serial("Metric#findByAgentUuid", async t => {
  let metric = await db.Metric.findByAgentUuid(uuid);
  t.true(MetricStub.findAll.called, "findAll sould be called on Model");
});
test.afterEach(() => {
  sandbox && sandbox.restore();
});

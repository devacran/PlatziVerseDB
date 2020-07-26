"use strict";
//Aqui en este archivo hacemos toda la configuracion de la db, modelos y servicios
const setupDatabase = require("./lib/db");
const setupAgent = require("./lib/agent"); //Es como el servicio de Agente
const setupAgentModel = require("./models/agent");
const setupMetricModel = require("./models/metric");
const defaults = require("defaults");

module.exports = async function(config) {
  //Si no viene alguna config toma las por defecto, se usa el modulo defaults
  config = defaults(config, {
    dialect: "sqlite",
    pool: {
      //ESto es para performance
      max: 10, //maximo de conexiones
      min: 0, //minimo de conexiones
      idle: 10000
    },
    query: {
      raw: true //para que entrege jsons sencillos
    }
  });
  const sequelize = setupDatabase(config);
  const AgentModel = setupAgentModel(config);
  const MetricModel = setupMetricModel(config);
  //Estas funciones son de sequelice, con este tipo de funciones
  //automaticamente al crear la base de datos crea las llaves foraneas y todo
  AgentModel.hasMany(MetricModel); //El modelo de agente tiene muchas metricas
  MetricModel.belongsTo(AgentModel); //El modelo de metricas pertenece a agente
  //Comprueba a a ver si si hay una conexion con la base de datos
  await sequelize.authenticate();

  if (config.setup) {
    await sequelize.sync({ force: true }); //va a crear la db en el servidor, force tru significa que si la db existe, la borra y crea una nueva
  }
  //Agent es una abstraccion de AgentModel o sea como el servicio que solo brindara los metodos que queremos utilizar
  const Agent = setupAgent(AgentModel);
  const Metric = {};

  //Al final retorna el modelo de Agente y de Metrica
  return {
    Agent,
    Metric
  };
};

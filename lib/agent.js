// <---- Servicio de Agente ---->
//Aqui se definen los metodos que se van a poder llamar en el modelo de agente
"use strict";

module.exports = function setupAgent(AgentModel) {
  async function createOrUpdate(agent) {
    const cond = {
      //Esto es para squelice para que haga SELECT WHERE uuide blabla
      where: {
        uuid: agent.uuid
      }
    };
    //find one es una funcion de sequelice que devuelve la primera ocurrencia que cumpla con la condicion
    const existingAgent = await AgentModel.findOne(cond);

    if (existingAgent) {
      //si existe lo actualice
      const updated = await AgentModel.update(agent, cond); //retorna el numero de filas
      return updated ? AgentModel.findOne(cond) : existingAgent; //Si no lo actualizo retorno el existente
    }
    //Si no existe, lo crea y retorna el agente
    const result = await AgentModel.create(agent);
    return result.toJSON();
  }

  function findById(id) {
    return AgentModel.findById(id);
  }

  function findByUuid(uuid) {
    return AgentModel.findOne({
      where: {
        uuid
      }
    });
  }

  function findAll() {
    return AgentModel.findAll();
  }

  function findConnected() {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    });
  }

  function findByUsername(username) {
    return AgentModel.findAll({
      where: {
        username,
        connected: true
      }
    });
  }

  return {
    createOrUpdate,
    findById,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  };
};

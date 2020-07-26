"use strict";

module.exports = function setupMetric(MetricModel, AgentModel) {
  //Devuelve metricas por agente
  async function findByAgentUuid(uuid) {
    return MetricModel.findAll({
      attributes: ["type"], //SELECT 'type' FROM metrics
      group: ["type"], //Agrupa por 'type'
      //Para hacer el join
      include: [
        {
          attributes: [], //no retorna nada
          model: AgentModel, //Aqui se le pasa la tabla con la que hara join
          where: {
            //El join lo va a filtrar por uuid
            uuid
          }
        }
      ],
      raw: true //que retorne solo el json
    });
  }
  //Devuelve metricas por agente y por tipo de metrica
  async function findByTypeAgentUuid(type, uuid) {
    return MetricModel.findAll({
      attributes: ["id", "type", "value", "createdAt"],
      where: {
        type
      },
      limit: 20, //retorna solo 20 datos
      order: [["createdAt", "DESC"]], //Para que ordene usando el campo fecha descendiente
      include: [
        //Hace el join con AgentModel por medio del uuid
        {
          attributes: [],
          model: AgentModel,
          where: {
            uuid
          }
        }
      ],
      raw: true
    });
  }
  //Para crear una metrica
  async function create(uuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid }
    });

    if (agent) {
      //Si el agente existe, agrega al objeto de metrica una key de agentId
      Object.assign(metric, { agentId: agent.id });
      const result = await MetricModel.create(metric);
      return result.toJSON();
    }
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  };
};

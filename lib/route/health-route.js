const Joi = require('joi');
const ResponseBuilder = require('../response/builders');

module.exports = class HealthRoute {
  constructor(server, options) {
    this.method = 'GET';
    this.path = options.path;

    this.options = {
      description: 'Gets the API health status',
      notes: ['This endpoint returns the API REST health status that can be used as liveness or rediness probe'],
      tags: ['api', 'misc'],
      auth: false,
      response: {
        status: {
          200: Joi.object({ healthy: Joi.boolean().required() })
            .label('_healthz')
            .description('A successful health status response'),
          500: ResponseBuilder.errors.internal(),
        },
      },
    };

    this.handler = async (request, h) => {
      return { healthy: true };
    };
  }
};

module.exports.DEFAULT_PATH = '/_healthz';

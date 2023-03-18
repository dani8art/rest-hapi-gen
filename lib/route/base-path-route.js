const Joi = require('joi');

const HateoasLinks = require('../hateoas-links');
const HapiServerUtil = require('../hapi-server-util');
const ResponseBuilder = require('../response/builders');

module.exports = class BasePathRoute {
  constructor(server, options) {
    this.method = 'GET';
    this.path = options.basePath;

    this.options = {
      description: 'Gets all exposed endpoint in the API REST',
      notes: [
        'This endpoint returns all the available enpoints exposed by the API so you can easily navigate throughout them',
      ],
      tags: ['api', 'summary'],
      response: {
        status: {
          200: Joi.object({ _links: Joi.object().label('_links_summary') })
            .label('_summary')
            .description('A Map of _link'),
          500: ResponseBuilder.errors.internal(),
        },
      },
    };

    if (options.auth && options.auth.enabled) {
      this.options.auth = { access: { scope: false } };
    }

    this.handler = async (request, h) => {
      return this.getResponse(server, request, options);
    };
  }

  getResponse(server, request, options) {
    return {
      _links: {
        self: HateoasLinks.href(request, options.basePath),
        ...HapiServerUtil.hrefTable(server, request, options.basePath),
      },
    };
  }
};

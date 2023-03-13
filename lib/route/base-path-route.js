const HateoasLinks = require('../hateoas-links');
const HapiServerUtil = require('../hapi-server-util');

module.exports = class BasePathRoute {
  constructor(server, options) {
    this.method = 'GET';
    this.path = options.basePath;

    this.options = {
      description: 'Explore all exposed endpoint in the API REST',
      tags: ['api', 'summary'],
    };

    if (options.auth && options.auth.enabled) {
      this.options.auth = { access: { scope: false } };
    }

    this.handler = async (request, h) => {
      return {
        _links: {
          self: HateoasLinks.href(request, options.basePath),
          ...HapiServerUtil.hrefTable(server, request, options.basePath),
        },
      };
    };
  }
};

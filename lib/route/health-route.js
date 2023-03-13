module.exports = class HealthRoute {
  constructor(server, options) {
    this.method = 'GET';
    this.path = options.path;

    this.options = {
      description: 'Explore all exposed endpoint in the API REST',
      tags: ['api', 'misc'],
      auth: false,
    };

    this.handler = async (request, h) => {
      return { healthy: true };
    };
  }
};

module.exports.DEFAULT_PATH = '/_healthz';

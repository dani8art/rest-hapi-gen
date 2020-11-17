const models = require('./models');
const RouteBuilders = require('./route-builders');

module.exports.plugin = {
  name: 'rest-hapi-gen',
  multiple: true,
  register: async function(server, options) {
    const { collectionName, basePath, overrides } = options;

    const newResourceSchemaName = `new ${collectionName}`;
    const schema = options.schema.label(newResourceSchemaName);

    const model = models.buildModel(collectionName, schema);

    const builderOptions = {
      basePath,
      collectionName,
      schema,
      model,
      server,
      overrides,
    };

    server.route(RouteBuilders.buildGetCollectionRoute(builderOptions));

    server.route(RouteBuilders.buildGetResourceRoute(builderOptions));

    server.route(RouteBuilders.buildCreateResourceRoute(builderOptions));

    server.route(RouteBuilders.buildUpdateResourceRoute(builderOptions));

    server.route(RouteBuilders.buildDeleteResourceRoute(builderOptions));
  }
};

// TODO(): convert to a module and use 'import' instead of 'require'
const models = require('./models');
const RouteBuilders = require('./route-builders');
const AuthRegisterFactory = require('./auth/auth-register-factory');

module.exports.plugin = {
  // TODO(): Include pkg and version
  name: 'rest-hapi-gen',
  multiple: true,
  register: async function (server, options) {
    const { collectionName, basePath, overrides, tls } = options;

    await AuthRegisterFactory.get(server, { ...options.auth, tls, basePath }).register();

    const newResourceSchemaName = `new ${collectionName}`;
    const schema = options.schema.label(newResourceSchemaName);

    const model = models.buildModel(collectionName, schema);

    const builderOptions = {
      basePath: basePath || '/',
      collectionName,
      schema,
      model,
      server,
      overrides,
      auth: options.auth,
    };

    server.route(RouteBuilders.buildGetCollectionRoute(builderOptions));

    server.route(RouteBuilders.buildGetResourceRoute(builderOptions));

    server.route(RouteBuilders.buildCreateResourceRoute(builderOptions));

    server.route(RouteBuilders.buildUpdateResourceRoute(builderOptions));

    server.route(RouteBuilders.buildDeleteResourceRoute(builderOptions));
  },
};

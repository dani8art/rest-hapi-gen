// TODO(): convert to a module and use 'import' instead of 'require'
const models = require('./models');
const RouteBuilders = require('./route-builders');
const AuthRegisterFactory = require('./auth/auth-register-factory');
const HapiServerUtil = require('./hapi-server-util');
const BasePathRoute = require('./route/base-path-route');

module.exports.plugin = {
  // TODO(): Include pkg and version
  name: 'rest-hapi-gen',
  multiple: true,
  register: async function (server, options) {
    const { collection, basePath, overrides, tls } = options;

    await AuthRegisterFactory.get(server, { ...options.auth, tls, basePath }).register();

    const newResourceSchemaName = `new ${collection.name}`;
    const schema = options.schema.label(newResourceSchemaName);

    const model = models.buildModel(collection.name, schema);

    const builderOptions = {
      basePath: basePath || '/',
      collection,
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

    if (!HapiServerUtil.isRoute(server, builderOptions.basePath)) {
      server.route(new BasePathRoute(server, builderOptions));
    }
  },
};

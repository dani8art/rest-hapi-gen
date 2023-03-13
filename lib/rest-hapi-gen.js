// TODO(): convert to a module and use 'import' instead of 'require'
const Hoek = require('@hapi/hoek');
const models = require('./models');
const RouteBuilders = require('./route-builders');
const AuthRegisterFactory = require('./auth/auth-register-factory');
const HapiServerUtil = require('./hapi-server-util');
const BasePathRoute = require('./route/base-path-route');
const HealthRoute = require('./route/health-route');

module.exports.plugin = {
  // TODO(): Include pkg and version
  name: 'rest-hapi-gen',
  multiple: true,
  register: async function (server, options) {
    // TODO(): centralize options to a module.
    const { basePath, overrides, tls } = options;
    const health = Hoek.applyToDefaults({ enabled: true, path: HealthRoute.DEFAULT_PATH }, options.health || {});
    const collection = Hoek.applyToDefaults({ pages: { limit: 10 } }, options.collection || {});

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

    if (!HapiServerUtil.isRoute(server, '/') && options.rootPathRedirect) {
      server.route({
        method: 'GET',
        path: '/',
        handler: async (request, h) => h.redirect(options.basePath),
        options: {
          auth: false,
        },
      });
    }

    if (!HapiServerUtil.isRoute(server, health.path) && health.enabled) {
      server.route(new HealthRoute(server, { path: health.path }));
    }
  },
};
